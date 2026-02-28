'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface DashboardMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'bf-dashboard-chat-messages';
const MAX_MESSAGES = 50;

let msgCounter = 0;
function genId() {
  return `msg-${Date.now()}-${++msgCounter}`;
}

function loadMessages(): DashboardMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: DashboardMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

export function useDashboardChat() {
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef('');

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  const limitReached = messages.length >= MAX_MESSAGES;

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || limitReached) return;

      const userMsg: DashboardMessage = {
        id: genId(),
        role: 'user',
        content: content.trim(),
      };
      const next = [...messages, userMsg];
      setMessages(next);
      saveMessages(next);
      setIsLoading(true);
      contentRef.current = '';

      const controller = new AbortController();
      abortRef.current = controller;
      const aId = genId();

      try {
        const apiMessages = next.map(({ role, content: c }) => ({ role, content: c }));
        const res = await fetch('/api/v1/dashboard/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `API error: ${res.status}`);
        }

        if (!res.body) {
          throw new Error('No response body');
        }

        setMessages([...next, { id: aId, role: 'assistant', content: '' }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Parse NDJSON (raw JSON lines, no "data: " prefix)
            try {
              const parsed = JSON.parse(trimmed);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                contentRef.current += delta;
                setMessages([
                  ...next,
                  { id: aId, role: 'assistant', content: contentRef.current },
                ]);
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }

        const finalContent =
          contentRef.current || 'Sorry, I had trouble responding.';
        const finalMsgs = [
          ...next,
          { id: aId, role: 'assistant' as const, content: finalContent },
        ];
        setMessages(finalMsgs);
        saveMessages(finalMsgs);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const errorMessage =
            (err as Error).message || 'Something went wrong. Please try again.';
          const fallback = [
            ...next,
            {
              id: genId(),
              role: 'assistant' as const,
              content: errorMessage,
            },
          ];
          setMessages(fallback);
          saveMessages(fallback);
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, limitReached]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    saveMessages([]);
  }, []);

  return { messages, isLoading, send, clearChat, limitReached };
}

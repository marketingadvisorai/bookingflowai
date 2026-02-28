'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'bf-chat-messages';
const MAX_MESSAGES = 20;

let msgCounter = 0;
function genId() { return `msg-${Date.now()}-${++msgCounter}`; }

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: Message[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef('');

  useEffect(() => { setMessages(loadMessages()); }, []);

  const limitReached = messages.length >= MAX_MESSAGES;

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { id: genId(), role: 'user', content: content.trim() };
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
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: 'bookingflow-website', messages: apiMessages, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
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

          // Support both SSE (data: {...}) and NDJSON ({...}) formats
          let data: string;
          if (trimmed.startsWith('data: ')) {
            data = trimmed.slice(6).trim();
          } else if (trimmed.startsWith('{')) {
            data = trimmed;
          } else {
            continue;
          }
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              contentRef.current += delta;
              setMessages([...next, { id: aId, role: 'assistant', content: contentRef.current }]);
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      // Strip any lead capture comments from the visible response
      const rawContent = contentRef.current || 'Sorry, I had trouble responding.';
      const finalContent = rawContent.replace(/<!-- LEAD: \{.*?\} -->/g, '').trim();
      const finalMsgs = [...next, { id: aId, role: 'assistant' as const, content: finalContent }];
      setMessages(finalMsgs);
      saveMessages(finalMsgs);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const fallback = [...next, { id: genId(), role: 'assistant' as const, content: 'Something went wrong. Please try again.' }];
        setMessages(fallback);
        saveMessages(fallback);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    saveMessages([]);
  }, []);

  return { messages, isLoading, send, clearChat, limitReached };
}

'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { Message } from './use-chat';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const lastMsg = messages[messages.length - 1];
  const isStreaming = isLoading && lastMsg?.role === 'assistant';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.length === 0 && <EmptyState />}

      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;
        const shouldTypewrite = isLast && msg.role === 'assistant' && isLoading;

        return (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={msg.role === 'user' ? 'max-w-[82%]' : 'max-w-[92%]'}>
              <div
                className={
                  msg.role === 'user'
                    ? 'px-3.5 py-2 rounded-2xl rounded-br-sm text-sm bg-[#FF4F00] text-white'
                    : 'text-[14px] text-gray-800 dark:text-gray-200 leading-[1.6]'
                }
              >
                {shouldTypewrite ? (
                  <TypewriterText text={msg.content} />
                ) : (
                  <RichText text={msg.content} />
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && !isStreaming && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center mt-10 px-4">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FF4F00]/10 mb-3">
        <div className="w-3 h-3 rounded-full bg-[#FF4F00]" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        Hey! Ask me anything about BookingFlow.
      </p>
    </div>
  );
}

/** Parse simple markdown: **bold**, links, bullet lists, line breaks */
function RichText({ text }: { text: string }) {
  const elements = useMemo(() => parseRichText(text), [text]);
  return <span className="whitespace-pre-wrap">{elements}</span>;
}

function parseRichText(text: string) {
  // Split by newlines first to handle line breaks and lists
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];

    // Skip markdown headers (## etc) — just render as plain text
    const cleanLine = line.replace(/^#{1,4}\s+/, '');

    // Bullet list items
    if (/^[\-\*•]\s/.test(cleanLine)) {
      result.push(
        <span key={`li-${li}`} className="block pl-3 py-0.5">
          <span className="text-[#FF4F00] mr-1.5">•</span>
          {inlineFormat(cleanLine.replace(/^[\-\*•]\s+/, ''), li)}
        </span>
      );
    } else if (cleanLine.trim() === '') {
      result.push(<span key={`br-${li}`} className="block h-2" />);
    } else {
      if (li > 0) result.push(<span key={`nl-${li}`}>{'\n'}</span>);
      result.push(<span key={`t-${li}`}>{inlineFormat(cleanLine, li)}</span>);
    }
  }

  return result;
}

/** Handle **bold** and links within a line */
function inlineFormat(text: string, keyPrefix: number): React.ReactNode[] {
  // Combined pattern for **bold** and URLs
  const pattern = /(\*\*(.+?)\*\*)|((https?:\/\/[^\s,)]+|bookingflowai\.com[^\s,).]*))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(<span key={`${keyPrefix}-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <span key={`${keyPrefix}-b-${match.index}`} className="font-semibold">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // URL
      const href = match[3].startsWith('http') ? match[3] : `https://${match[3]}`;
      parts.push(
        <a
          key={`${keyPrefix}-a-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FF4F00] underline underline-offset-2 hover:opacity-80"
        >
          {match[3]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`${keyPrefix}-end`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={`${keyPrefix}-plain`}>{text}</span>];
}

/** Human-like typewriter — variable speed, pauses at punctuation */
function TypewriterText({ text }: { text: string }) {
  const [displayLen, setDisplayLen] = useState(0);
  const targetLen = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTime = useRef(0);

  useEffect(() => {
    targetLen.current = text.length;
  }, [text]);

  const animate = useCallback((timestamp: number) => {
    if (!lastTime.current) lastTime.current = timestamp;
    const elapsed = timestamp - lastTime.current;

    // Variable speed: slower at punctuation, faster mid-word
    const currentChar = text[displayLen] || '';
    let delay = 14; // base speed — slightly faster than before
    if ('.!?'.includes(currentChar)) delay = 180; // pause at sentence end
    else if (',;:'.includes(currentChar)) delay = 80; // brief pause at commas
    else if (currentChar === '\n') delay = 120; // pause at newlines

    if (elapsed >= delay) {
      lastTime.current = timestamp;
      setDisplayLen((prev) => {
        if (prev < targetLen.current) {
          const gap = targetLen.current - prev;
          // Catch up faster if way behind (streaming)
          const step = gap > 80 ? 4 : gap > 30 ? 2 : 1;
          return Math.min(prev + step, targetLen.current);
        }
        return prev;
      });
    }

    rafRef.current = requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, displayLen]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const visible = text.slice(0, displayLen);
  const showCursor = displayLen < text.length;

  return (
    <span className="whitespace-pre-wrap">
      <RichText text={visible} />
      {showCursor && (
        <span
          className="inline-block w-[2px] h-[14px] bg-[#FF4F00] ml-px align-middle rounded-full"
          style={{ animation: 'cursorBlink 0.9s ease-in-out infinite' }}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      ` }} />
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 py-2 px-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#FF4F00]/50"
            style={{
              animation: 'dotPulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 160}ms`,
            }}
          />
        ))}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes dotPulse {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.3; }
            40% { transform: scale(1.2); opacity: 1; }
          }
        ` }} />
      </div>
    </div>
  );
}

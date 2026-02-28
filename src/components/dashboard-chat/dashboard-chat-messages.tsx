'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { DashboardMessage } from './use-dashboard-chat';

interface DashboardChatMessagesProps {
  messages: DashboardMessage[];
  isLoading: boolean;
  orgName: string;
}

export function DashboardChatMessages({
  messages,
  isLoading,
  orgName,
}: DashboardChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const lastMsg = messages[messages.length - 1];
  const isStreaming = isLoading && lastMsg?.role === 'assistant';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-black/10">
      {messages.length === 0 && (
        <div className="text-center mt-12 animate-in fade-in duration-700">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="none"
            >
              <circle cx="24" cy="24" r="22" fill="#201515" />
              <circle cx="24" cy="24" r="6" fill="#FF4F00" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            {orgName} Assistant
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Ask about bookings, revenue, or get insights
          </p>
        </div>
      )}

      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;
        const shouldTypewrite = isLast && msg.role === 'assistant' && isLoading;

        return (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[90%]'}>
              <div
                className={
                  msg.role === 'user'
                    ? 'px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200/50 dark:border-white/5'
                    : 'text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap'
                }
              >
                {shouldTypewrite ? (
                  <TypewriterText text={msg.content} speed={18} />
                ) : (
                  <LinkifyText text={msg.content} />
                )}
              </div>
              {msg.role === 'assistant' && msg.content && !isLoading && (
                <FeedbackRow content={msg.content} />
              )}
            </div>
          </div>
        );
      })}

      {isLoading && !isStreaming && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}

/** Render text with clickable links */
function LinkifyText({ text }: { text: string }) {
  const urlPattern = /(https?:\/\/[^\s,)]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <span>
      {parts.map((part, i) => {
        if (urlPattern.test(part)) {
          urlPattern.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4F00] underline underline-offset-2 hover:text-[#e04500] transition-colors"
            >
              {part}
            </a>
          );
        }
        urlPattern.lastIndex = 0;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/** Gradually reveals text with a smooth typewriter effect */
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayLen, setDisplayLen] = useState(0);
  const targetLen = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTime = useRef(0);

  useEffect(() => {
    targetLen.current = text.length;
  }, [text]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const elapsed = timestamp - lastTime.current;

      if (elapsed >= speed) {
        lastTime.current = timestamp;
        setDisplayLen((prev) => {
          if (prev < targetLen.current) {
            const gap = targetLen.current - prev;
            const step = gap > 50 ? 3 : gap > 20 ? 2 : 1;
            return Math.min(prev + step, targetLen.current);
          }
          return prev;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [speed]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const visible = text.slice(0, displayLen);
  const showCursor = displayLen < text.length;

  return (
    <span>
      {visible}
      {showCursor && (
        <span
          className="inline-block w-[2.5px] h-[15px] bg-[#FF4F00] ml-[1px] align-middle rounded-full animate-pulse shadow-sm"
          style={{
            animation: 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            boxShadow: '0 0 4px rgba(255, 79, 0, 0.5)',
          }}
        />
      )}
    </span>
  );
}

function FeedbackRow({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const iconBtn =
    'p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95';

  return (
    <div
      className="flex items-center gap-0.5 mt-1.5 animate-in fade-in duration-300"
      style={{ animationDelay: '200ms' }}
    >
      <button className={iconBtn} aria-label="Good response">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
      </button>
      <button className={iconBtn} aria-label="Bad response">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
          <path d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
        </svg>
      </button>
      <button onClick={copy} className={iconBtn} aria-label="Copy">
        {copied ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
            style={{
              animation: 'chatBounce 1.2s infinite',
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes chatBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `,
          }}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (msg: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  }, [value, disabled, onSend]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 focus-within:border-[#FF4F00] dark:focus-within:border-[#FF4F00] focus-within:shadow-sm focus-within:shadow-[#FF4F00]/20 transition-all duration-200 px-3 py-1 bg-gray-50 dark:bg-white/5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question..."
          disabled={disabled}
          className="flex-1 py-1.5 text-base sm:text-sm text-gray-900 dark:text-gray-100 outline-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
        />
        <span className="text-[10px] text-gray-300 dark:text-gray-600 hidden sm:inline select-none px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 font-mono">⌘I</span>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
          style={{ 
            backgroundColor: canSend ? '#FF4F00' : '#e5e7eb',
            boxShadow: canSend ? '0 2px 8px rgba(255, 79, 0, 0.3)' : 'none'
          }}
          aria-label="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className={canSend ? 'animate-in fade-in duration-200' : ''}>
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

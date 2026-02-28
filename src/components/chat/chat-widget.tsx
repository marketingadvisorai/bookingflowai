'use client';

import { useState, useEffect } from 'react';
import { useChat } from './use-chat';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { messages, isLoading, send, clearChat } = useChat();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Trigger — subtle orange dot, barely noticeable breathing glow */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-50 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 hover:scale-125 active:scale-95"
          aria-label="Open assistant"
          style={{ opacity: 0.85 }}
        >
          {/* Subtle breathing glow — fades in/out slowly, hard to notice */}
          <div
            className="absolute inset-[-2px] rounded-full bg-[#FF4F00]"
            style={{
              animation: 'dotBreathe 4s ease-in-out infinite',
              opacity: 0.08,
            }}
          />
          {/* The dot */}
          <div className="w-3 h-3 rounded-full bg-[#FF4F00] group-hover:w-3.5 group-hover:h-3.5 transition-all duration-300" />
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes dotBreathe {
              0%, 100% { opacity: 0.04; transform: scale(1); }
              50% { opacity: 0.10; transform: scale(1.3); }
            }
          ` }} />
        </button>
      )}

      {/* Mobile backdrop with smooth fade */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent sm:pointer-events-none transition-opacity duration-300 animate-in fade-in" 
          onClick={() => setOpen(false)} 
        />
      )}

      {/* Sidebar panel with smooth slide animation */}
      <div
        className={`fixed z-50 top-0 right-0 h-full bg-white dark:bg-[#1a1a1a] flex flex-col shadow-2xl border-l border-gray-200 dark:border-white/10 transition-all duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'} w-full sm:w-[360px] ${expanded ? 'sm:!w-screen sm:!transition-all sm:!duration-500' : ''}`}
      >

        {/* Header with gradient background */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#1f1f1f] dark:to-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#FF4F00] opacity-20 blur-sm"></div>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="relative">
                <circle cx="24" cy="24" r="22" fill="#201515" />
                <circle cx="24" cy="24" r="6" fill="#FF4F00" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">Assistant</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="hidden sm:flex p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all duration-200 hover:scale-110"
              aria-label="Toggle fullscreen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {expanded ? (
                  <><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></>
                ) : (
                  <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>
                )}
              </svg>
            </button>
            <button
              onClick={() => { setOpen(false); setExpanded(false); }}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all duration-200 hover:scale-110"
              aria-label="Close assistant"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-500/5 border-b border-amber-100/50 dark:border-amber-500/10">
          <p className="text-[11px] text-amber-700 dark:text-amber-500/80 leading-tight flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Responses are generated using AI and may contain mistakes.
          </p>
        </div>

        {/* Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSend={send} disabled={isLoading} />

        {/* Clear chat */}
        <div className="px-4 pb-3 pt-1 flex justify-center">
          <button onClick={clearChat} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
            Clear chat
          </button>
        </div>
      </div>
    </>
  );
}

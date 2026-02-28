'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ExpanderIcon, 
  MinimizeIcon, 
  Cancel01Icon, 
  AlertCircleIcon, 
  Delete01Icon,
  AiChat01Icon
} from '@hugeicons/core-free-icons';
import { useDashboardChat } from './use-dashboard-chat';
import { DashboardChatMessages } from './dashboard-chat-messages';
import { DashboardChatInput } from './dashboard-chat-input';

interface DashboardChatWidgetProps {
  orgName: string;
}

export function DashboardChatWidget({ orgName }: DashboardChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { messages, isLoading, send, clearChat } = useDashboardChat();

  // Keyboard shortcut: ⌘K or ⌘I to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'i')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Trigger — subtle dot in bottom-right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-50 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 hover:scale-125 active:scale-95"
          aria-label="Open assistant"
          style={{ opacity: 0.85 }}
        >
          {/* Subtle breathing glow */}
          <div
            className="absolute inset-[-2px] rounded-full bg-[#FF4F00]"
            style={{
              animation: 'dotBreathe 4s ease-in-out infinite',
              opacity: 0.08,
            }}
          />
          {/* The dot */}
          <div className="w-3 h-3 rounded-full bg-[#FF4F00] group-hover:w-3.5 group-hover:h-3.5 transition-all duration-300" />
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes dotBreathe {
              0%, 100% { opacity: 0.04; transform: scale(1); }
              50% { opacity: 0.10; transform: scale(1.3); }
            }
          `,
            }}
          />
        </button>
      )}

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent sm:pointer-events-none transition-opacity duration-300 animate-in fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed z-50 top-0 right-0 h-full bg-white dark:bg-[#1a1a1a] flex flex-col shadow-2xl border-l border-gray-200 dark:border-white/10 transition-all duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[360px] ${
          expanded
            ? 'sm:!w-screen sm:!transition-all sm:!duration-500'
            : ''
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-gray-50 to-white dark:from-[#1f1f1f] dark:to-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#FF4F00] opacity-20 blur-sm"></div>
              <HugeiconsIcon 
                icon={AiChat01Icon} 
                size={20} 
                strokeWidth={1.8} 
                className="relative text-[#FF4F00]" 
              />
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                Assistant
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {orgName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="hidden sm:flex p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all duration-200 hover:scale-110"
              aria-label="Toggle fullscreen"
            >
              <HugeiconsIcon 
                icon={expanded ? MinimizeIcon : ExpanderIcon} 
                size={15} 
                strokeWidth={1.8} 
              />
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setExpanded(false);
              }}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all duration-200 hover:scale-110"
              aria-label="Close assistant"
            >
              <HugeiconsIcon 
                icon={Cancel01Icon} 
                size={15} 
                strokeWidth={1.8} 
              />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-500/5 border-b border-amber-100/50 dark:border-amber-500/10">
          <p className="text-[11px] text-amber-700 dark:text-amber-500/80 leading-tight flex items-center gap-1.5">
            <HugeiconsIcon 
              icon={AlertCircleIcon} 
              size={10} 
              strokeWidth={2.5} 
              className="flex-shrink-0" 
            />
            AI assistant. Responses may contain errors.
          </p>
        </div>

        {/* Messages */}
        <DashboardChatMessages
          messages={messages}
          isLoading={isLoading}
          orgName={orgName}
        />

        {/* Input */}
        <DashboardChatInput onSend={send} disabled={isLoading} />

        {/* Clear chat */}
        <div className="px-4 pb-3 pt-1 flex justify-center">
          <button
            onClick={clearChat}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            <HugeiconsIcon 
              icon={Delete01Icon} 
              size={12} 
              strokeWidth={1.8} 
            />
            Clear chat
          </button>
        </div>
      </div>
    </>
  );
}

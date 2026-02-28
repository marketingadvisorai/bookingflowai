'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Nudge, NudgeVariant } from './widget-intelligence';

/* ── Nudge Queue Hook ── */

export function useNudgeQueue() {
  const [queue, setQueue] = useState<Nudge[]>([]);
  const [current, setCurrent] = useState<Nudge | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setCurrent(next);
    setQueue(q => q.slice(1));
    if (next.autoDismissMs) {
      timerRef.current = setTimeout(() => setCurrent(null), next.autoDismissMs);
    }
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [current, queue]);

  const enqueue = useCallback((nudge: Nudge) => {
    if (seenIdsRef.current.has(nudge.id)) return;
    seenIdsRef.current.add(nudge.id);
    setQueue(q => [...q, nudge]);
  }, []);

  const dismiss = useCallback(() => {
    setCurrent(null);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  return { current, enqueue, dismiss };
}

/* ── SmartNudge Component — prominent pill with backdrop blur ── */

type SmartNudgeProps = {
  nudge: Nudge;
  onDismiss: () => void;
};

export function SmartNudge({ nudge, onDismiss }: SmartNudgeProps) {
  const styles = variantStyles(nudge.variant);

  return (
    <div role="status" aria-live="polite" className="animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium backdrop-blur-md shadow-lg ${styles.bg} ${styles.border} ${styles.text}`}>
        <span className={`flex-shrink-0 w-2 h-2 rounded-full animate-pulse ${styles.dot}`} />
        <span className="flex-1">{nudge.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2.5 2.5l5 5m-5 0l5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function variantStyles(variant: NudgeVariant) {
  switch (variant) {
    case 'warm':
      return {
        bg: 'bg-[#FF4F00]/15 dark:bg-[#FF4F00]/20',
        border: 'border border-[#FF4F00]/30 dark:border-[#FF4F00]/40',
        text: 'text-[#201515] dark:text-[#FFFDF9]',
        dot: 'bg-[#FF4F00]',
      };
    case 'alert':
      return {
        bg: 'bg-amber-100/90 dark:bg-amber-500/20',
        border: 'border border-amber-300/80 dark:border-amber-500/40',
        text: 'text-amber-900 dark:text-amber-300',
        dot: 'bg-amber-500',
      };
    case 'neutral':
    default:
      return {
        bg: 'bg-[#201515]/[0.08] dark:bg-white/[0.12]',
        border: 'border border-[#201515]/[0.12] dark:border-white/[0.20]',
        text: 'text-[#201515] dark:text-[#FFFDF9]',
        dot: 'bg-[#201515]/50 dark:bg-white/50',
      };
  }
}

/* ── AI Helper Bubble — tiny contextual suggestions ── */

type IdleHelperProps = {
  idleSeconds: number;
  stage: 'time_selection' | 'customer_form' | 'slot_selected' | 'idle';
  onOpenChat?: () => void;
};

export function IdleHelper({ idleSeconds, stage, onOpenChat }: IdleHelperProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [stage]);

  const getMessage = () => {
    if (stage === 'time_selection' && idleSeconds >= 30) {
      return { text: 'Need help picking a time? 💬', clickable: !!onOpenChat };
    }
    if (stage === 'customer_form' && idleSeconds >= 15) {
      return { text: 'Almost done! Just a few more details.', clickable: false };
    }
    if (stage === 'slot_selected') {
      return { text: 'Great pick! Fill in your details below to lock it in. ⬇️', clickable: false };
    }
    return null;
  };

  const msg = getMessage();

  // Auto-dismiss after 8 seconds (hook must be called unconditionally)
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => setDismissed(true), 8000);
    return () => clearTimeout(timer);
  }, [stage, idleSeconds, !!msg]);

  if (dismissed || !msg) return null;

  const handleClick = () => {
    if (msg.clickable && onOpenChat) {
      onOpenChat();
    }
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-center z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        type="button"
        onClick={handleClick}
        className={`rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/20 px-4 py-2.5 text-xs shadow-lg backdrop-blur-sm transition-all duration-200 ${msg.clickable ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-gray-700 dark:text-gray-300">{msg.text}</span>
      </button>
    </div>
  );
}

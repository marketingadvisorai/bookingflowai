'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NudgeResponse } from '@/lib/nudge/tracker';
import { BehaviorTracker } from '@/lib/nudge/tracker';

/* ── Types ── */
type NudgeOverlayProps = {
  orgId: string;
  apiBase?: string;
  mode?: 'customer' | 'admin';
  pageType?: string;
};

type ActiveNudge = NudgeResponse & { id: number };

let nudgeIdCounter = 0;

/* ── Main Overlay Component ── */
export function NudgeOverlay({ orgId, apiBase, mode = 'customer', pageType }: NudgeOverlayProps) {
  const [nudge, setNudge] = useState<ActiveNudge | null>(null);
  const [exiting, setExiting] = useState(false);
  const trackerRef = useRef<BehaviorTracker | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setNudge(null);
      setExiting(false);
    }, 300);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const showNudge = useCallback(
    (n: NudgeResponse) => {
      const active: ActiveNudge = { ...n, id: ++nudgeIdCounter };
      setExiting(false);
      setNudge(active);
      // Auto-dismiss after 8 seconds
      dismissTimerRef.current = setTimeout(dismiss, 8000);
    },
    [dismiss]
  );

  useEffect(() => {
    const base = apiBase || (typeof window !== 'undefined' ? window.location.origin : '');
    const tracker = new BehaviorTracker({
      apiBase: base,
      orgId,
      pageType: pageType || (mode === 'admin' ? 'admin' : 'widget'),
      onNudge: showNudge,
    });
    trackerRef.current = tracker;

    return () => {
      tracker.destroy();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [orgId, apiBase, mode, showNudge]);

  if (!nudge) return null;

  const positionClasses = getPositionClasses(nudge.position);
  const animationClass = exiting ? 'nudge-exit' : 'nudge-enter';

  return (
    <div className={`fixed z-[9999] pointer-events-none ${positionClasses}`}>
      <div
        className={`pointer-events-auto ${animationClass}`}
        role="status"
        aria-live="polite"
      >
        {nudge.type === 'banner' ? (
          <BannerNudge message={nudge.message || ''} onDismiss={dismiss} />
        ) : (
          <ToastNudge message={nudge.message || ''} onDismiss={dismiss} />
        )}
      </div>

      <style>{`
        .nudge-enter {
          animation: nudgeSlideIn 0.3s ease-out forwards;
        }
        .nudge-exit {
          animation: nudgeFadeOut 0.3s ease-in forwards;
        }
        @keyframes nudgeSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes nudgeFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Toast Nudge ── */
function ToastNudge({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="max-w-sm rounded-lg bg-white dark:bg-[#1a1a1a] shadow-lg border border-gray-100 dark:border-white/10 border-l-[3px] border-l-[#FF4F00] p-4">
      <div className="flex items-start gap-3">
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {message}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3.5 3.5l7 7m-7 0l7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Banner Nudge ── */
function BannerNudge({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="w-screen max-w-lg mx-auto rounded-lg bg-white dark:bg-[#1a1a1a] shadow-md border border-gray-100 dark:border-white/10 border-l-[3px] border-l-[#FF4F00] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
          {message}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3.5 3.5l7 7m-7 0l7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Position helpers ── */
function getPositionClasses(position?: string): string {
  switch (position) {
    case 'top-center':
      return 'top-4 left-4 right-4 flex justify-center';
    case 'inline':
      return 'bottom-20 right-4 sm:bottom-4 sm:right-4';
    case 'bottom-right':
    default:
      return 'bottom-4 right-4 sm:bottom-6 sm:right-6';
  }
}

/* ── Export tracker for manual use ── */
export { BehaviorTracker } from '@/lib/nudge/tracker';

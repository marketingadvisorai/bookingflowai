'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SetupIssue, SetupProgress } from '@/lib/ai-guide/analyze-setup';

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('bf_dismissed_guide');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function dismissId(id: string) {
  const set = getDismissedIds();
  set.add(id);
  localStorage.setItem('bf_dismissed_guide', JSON.stringify([...set]));
}

const severityStyles = {
  critical: {
    border: 'border-l-[#FF4A00]',
    bg: 'bg-[#FF4A00]/[0.04]',
    dot: 'bg-[#FF4A00]',
    icon: '⚠️',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/[0.04]',
    dot: 'bg-amber-500',
    icon: '⚡',
  },
  tip: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/[0.04]',
    dot: 'bg-emerald-500',
    icon: '💡',
  },
};

function IssueCard({ issue, onDismiss }: { issue: SetupIssue; onDismiss: () => void }) {
  const style = severityStyles[issue.severity];

  return (
    <div
      className={`relative rounded-lg border border-border/50 border-l-[3px] ${style.border} ${style.bg} p-4 animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 text-[#93908C] hover:text-[#574E4C] transition-colors"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        {issue.severity === 'critical' && (
          <span className="relative mt-0.5 flex h-2 w-2 shrink-0">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-75`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`} />
          </span>
        )}
        {issue.severity !== 'critical' && (
          <span className={`mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#201515]">{issue.title}</div>
          <p className="mt-0.5 text-xs text-[#6F6765] leading-relaxed">{issue.description}</p>
          {issue.action && (
            <Link
              href={issue.action.href}
              className={`mt-2 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                issue.severity === 'critical'
                  ? 'bg-[#FF4A00] text-white hover:bg-[#E64700]'
                  : 'bg-[#F0EEEC] text-[#413735] hover:bg-[#E7E5E4]'
              }`}
            >
              {issue.action.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function SetupGuideClient({
  issues,
  progress,
  showProgress,
}: {
  issues: SetupIssue[];
  progress?: SetupProgress;
  showProgress?: boolean;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDismissed(getDismissedIds());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const visible = issues.filter((i) => !dismissed.has(i.id));
  const allDone = progress && progress.percent === 100;

  if (visible.length === 0 && !showProgress) return null;

  return (
    <div className="space-y-3">
      {/* Progress bar on overview */}
      {showProgress && progress && !allDone && (
        <div className="rounded-lg border border-border/50 bg-card/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#201515]">Setup Progress</span>
            <span className="text-xs font-medium text-[#6F6765]">{progress.percent}% complete</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F0EEEC] overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-[#FF4A00] transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <ProgressItem emoji="🎮" label="Games" status={progress.games.label} done={progress.games.done} />
            <ProgressItem emoji="🚪" label="Rooms" status={progress.rooms.label} done={progress.rooms.done} />
            <ProgressItem emoji="💰" label="Pricing" status={progress.pricing.label} done={progress.pricing.done} />
            <ProgressItem emoji="📅" label="Schedules" status={progress.schedules.label} done={progress.schedules.done} />
            <ProgressItem emoji="💳" label="Stripe" status={progress.stripe.label} done={progress.stripe.done} />
          </div>
        </div>
      )}

      {/* Issue cards */}
      {visible.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onDismiss={() => {
            dismissId(issue.id);
            setDismissed((prev) => new Set([...prev, issue.id]));
          }}
        />
      ))}
    </div>
  );
}

function ProgressItem({ emoji, label, status, done }: { emoji: string; label: string; status: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span>{emoji}</span>
      <span className="font-medium text-[#413735]">{label}:</span>
      <span className={done ? 'text-emerald-600' : 'text-[#FF4A00]'}>
        {done ? '✓' : '✗'} {status}
      </span>
    </div>
  );
}

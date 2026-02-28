'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Recommendation } from '@/lib/ai-guide/recommendations';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  revenue: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Revenue' },
  engagement: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Engagement' },
  setup: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', label: 'Setup' },
  optimization: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'Optimization' },
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

export function RecommendationsList({ orgId }: { orgId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRecommendations = useCallback(async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      const url = `/api/dashboard/recommendations${force ? '?force=1' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-5 w-16 rounded bg-muted" />
              <div className="h-2 w-2 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-3 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">Could not load recommendations</p>
        <button
          onClick={() => fetchRecommendations(true)}
          className="mt-2 text-sm font-medium text-[#FF4A00] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">No recommendations yet. Add more data to get insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const style = CATEGORY_STYLES[rec.category] || CATEGORY_STYLES.optimization;
        const dot = PRIORITY_DOT[rec.priority] || PRIORITY_DOT.low;
        return (
          <div
            key={rec.id}
            className="rounded-lg border border-border/50 bg-card/30 p-4 transition-colors hover:bg-card/50 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              <span className={`h-2 w-2 rounded-full ${dot}`} title={`${rec.priority} priority`} />
            </div>
            <div className="text-sm font-medium">{rec.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{rec.description}</div>
            {rec.action && (
              <a
                href={rec.action.href}
                className="mt-2 inline-block text-xs font-medium text-[#FF4A00] hover:underline"
              >
                {rec.action.label} →
              </a>
            )}
          </div>
        );
      })}
      <button
        onClick={() => fetchRecommendations(true)}
        className="w-full rounded-lg border border-border/50 p-2 text-center text-xs text-muted-foreground transition-colors hover:bg-card/50 dark:hover:bg-white/[0.04]"
      >
        Refresh recommendations
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Observation {
  id: string;
  timestamp: string;
  provider: 'anthropic' | 'together';
  type: string;
  severity: Severity;
  orgId: string;
  summary: string;
  details: string;
  userMessage?: string;
  resolved: boolean;
}

interface Summary {
  total: number;
  unresolved: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function ObservationsClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterProvider, setFilterProvider] = useState('');

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterSeverity) params.set('severity', filterSeverity);
    if (filterProvider) params.set('provider', filterProvider);

    const res = await fetch(`/api/dashboard/admin/observations?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setSummary(data.summary);
    setObservations(data.observations);
    setLoading(false);
  }, [filterType, filterSeverity, filterProvider]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleResolve(id: string) {
    await fetch('/api/dashboard/admin/observations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'resolve' }),
    });
    fetchData();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading observations...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.unresolved}</div>
            <div className="text-xs text-red-600">Unresolved</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.bySeverity.critical ?? 0}</div>
            <div className="text-xs text-red-500">Critical</div>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.bySeverity.high ?? 0}</div>
            <div className="text-xs text-orange-500">High</div>
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {summary && Object.keys(summary.byType).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => (
              <span
                key={type}
                className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs"
              >
                {type}: {count}
              </span>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          {['error', 'tool_failure', 'user_confusion', 'booking_dropout', 'unanswered', 'feature_request', 'bug_report', 'conversion', 'insight', 'prompt_gap'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Severities</option>
          {['critical', 'high', 'medium', 'low'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Providers</option>
          <option value="anthropic">Claude (Anthropic)</option>
          <option value="together">Together.ai</option>
        </select>
      </div>

      {/* Observations List */}
      <div className="space-y-2">
        {observations.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No observations found. The AI agents haven&apos;t logged anything yet.
          </p>
        )}
        {observations.map((obs) => (
          <div
            key={obs.id}
            className="rounded-lg border border-border/50 bg-card/50 transition-colors hover:bg-card/70"
          >
            <button
              onClick={() => setExpandedId(expandedId === obs.id ? null : obs.id)}
              className="flex w-full items-start gap-3 p-3 text-left"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[obs.severity]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${SEVERITY_COLORS[obs.severity]}`}>
                    {obs.severity}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{obs.type}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                    {obs.provider === 'anthropic' ? 'Claude' : 'Together.ai'}
                  </span>
                  {obs.resolved && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">resolved</span>
                  )}
                </div>
                <p className="mt-1 text-sm">{obs.summary}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(obs.timestamp).toLocaleString()} &middot; {obs.orgId}
                </p>
              </div>
            </button>

            {expandedId === obs.id && (
              <div className="border-t border-border/50 px-3 pb-3 pt-2">
                {obs.userMessage && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-muted-foreground">User Message</div>
                    <p className="mt-0.5 rounded bg-muted/50 p-2 text-sm">{obs.userMessage}</p>
                  </div>
                )}
                <div className="mb-2">
                  <div className="text-xs font-medium text-muted-foreground">Details</div>
                  <pre className="mt-0.5 max-h-40 overflow-auto rounded bg-muted/50 p-2 text-xs">
                    {obs.details}
                  </pre>
                </div>
                {!obs.resolved && (
                  <button
                    onClick={() => handleResolve(obs.id)}
                    className="rounded-md bg-[#FF4A00] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e04400]"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

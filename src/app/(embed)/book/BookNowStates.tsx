'use client';

export function LoadingSkeleton() {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] backdrop-blur-xl p-4 animate-pulse">
          <div className="h-40 bg-slate-100 dark:bg-white/[0.06] rounded-xl mb-4" />
          <div className="h-5 bg-slate-200 dark:bg-white/[0.08] rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-100 dark:bg-white/[0.03] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <div className="text-sm font-semibold text-red-700 dark:text-red-300">Couldn&apos;t load games</div>
          <div className="text-xs text-red-600 dark:text-[rgba(255,255,255,0.55)] mt-1">Error: {error}</div>
          <button onClick={() => window.location.reload()} className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline transition-all duration-200">
            Try reloading the page
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-[#1a1a1d] backdrop-blur-xl p-8 text-center animate-in fade-in duration-500">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-white/[0.03] mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 dark:text-[rgba(255,255,255,0.35)]">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-[#fafaf9] mb-2">No games available yet</h3>
      <p className="text-sm text-slate-500 dark:text-[rgba(255,255,255,0.55)]">
        The venue owner needs to add games in the dashboard before bookings can be made.
      </p>
    </div>
  );
}

export function MissingOrgError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-slate-900 dark:bg-[#0a0a0b] dark:text-[#fafaf9]">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/30 dark:bg-red-500/10 max-w-md">
        <div className="text-2xl mb-3">⚠️</div>
        <div className="text-sm font-semibold text-red-700 dark:text-red-300">Missing Organization ID</div>
        <div className="text-xs text-red-600 dark:text-[rgba(255,255,255,0.55)] mt-2">
          Please provide an <code className="bg-red-100 dark:bg-red-500/20 px-1 py-0.5 rounded">orgId</code> query parameter.
        </div>
      </div>
    </main>
  );
}

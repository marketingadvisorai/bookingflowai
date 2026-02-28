'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, MoonIcon } from '@hugeicons/core-free-icons';

import { BookingWidgetDemo } from '@/app/(embed)/widget/_components/booking-widget-demo';
import { useThemeToggle } from './useThemeToggle';
import { GameCard, type CatalogGame } from './GameCard';
import { LoadingSkeleton, ErrorDisplay, EmptyState, MissingOrgError } from './BookNowStates';

type CatalogResp = {
  ok: boolean;
  orgId: string;
  org: { name: string; timezone: string } | null;
  games: CatalogGame[];
};

export function BookNowClient() {
  const sp = useSearchParams();
  const orgId = sp.get('orgId');
  if (!orgId) return <MissingOrgError />;
  return <BookNowInner orgId={orgId} themeParam={sp.get('theme')} />;
}

function BookNowInner({ orgId, themeParam }: { orgId: string; themeParam: string | null }) {
  const { theme, toggleTheme } = useThemeToggle(themeParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CatalogResp | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const title = useMemo(() => data?.org?.name ?? 'Book Now', [data]);

  useEffect(() => {
    if (!activeGameId) return;
    // Hide background scroll without position:fixed (which breaks modal scrolling)
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeGameId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/catalog?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' });
        const body = (await res.json().catch(() => null)) as CatalogResp | null;
        if (!res.ok || !body?.ok) throw new Error('catalog_failed');
        if (!cancelled) setData(body);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  return (
    <main className={(theme === 'dark' ? 'dark ' : '') + 'min-h-screen ' + (theme === 'dark' ? 'bg-[#0a0a0b] text-[#fafaf9] [color-scheme:dark]' : 'bg-white text-slate-900')}>
      <div className="border-b border-slate-100 bg-white dark:border-white/[0.06] dark:bg-[#0a0a0b] dark:text-[#fafaf9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-sm font-semibold">{title}</div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-[rgba(255,255,255,0.55)]">Powered by BookingFlow</div>
            <button type="button" onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/[0.06] dark:bg-[#1a1a1d] dark:text-[#fafaf9] dark:hover:bg-[#222225] transition-all duration-200" aria-label="Toggle theme">
              {theme === 'dark' ? <HugeiconsIcon icon={MoonIcon} size={16} strokeWidth={1.8} /> : <HugeiconsIcon icon={Sun01Icon} size={16} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </div>

      {activeGameId && (
        <div className="fixed inset-0 z-50 w-screen max-w-[100vw] overflow-x-hidden overflow-y-auto overscroll-contain bg-black/70 p-4 md:p-10" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex items-center justify-between text-white">
              <div className="text-sm font-medium">Choose a time</div>
              <button type="button" onClick={() => setActiveGameId(null)} className="rounded-full bg-white/10 px-4 py-2 text-sm">Close</button>
            </div>
            <BookingWidgetDemo orgId={orgId} gameId={activeGameId} theme={theme} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-10 bg-transparent dark:bg-transparent">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold tracking-tight dark:text-[#fafaf9]">Choose a game</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-[rgba(255,255,255,0.55)]">Pick the experience you want, then choose a time slot.</p>
        </div>
        {loading && <LoadingSkeleton />}
        {error && <ErrorDisplay error={error} />}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(data?.games ?? []).map((g) => <GameCard key={g.gameId} game={g} onBook={setActiveGameId} />)}
        </div>
        {!loading && (data?.games?.length ?? 0) === 0 && <EmptyState />}
      </div>
    </main>
  );
}

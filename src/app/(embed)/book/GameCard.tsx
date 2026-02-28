'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameImageCarousel } from './GameImageCarousel';

export type CatalogGame = {
  gameId: string;
  name: string;
  durationMins: number;
  minPlayers: number;
  maxPlayers: number;
  allowPrivate: boolean;
  allowPublic: boolean;
  heroImageThumbUrl?: string | null;
  heroImageUrl?: string | null;
  previewVideoUrl?: string | null;
  galleryImageUrls?: string[] | null;
  startingUnitAmountCents?: number | null;
  pricingCurrency?: string;
};

export function GameCard({ game, onBook }: { game: CatalogGame; onBook: (gameId: string) => void }) {
  const g = game;
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/[0.06] dark:bg-[#1a1a1d] backdrop-blur-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <GameImageCarousel
        heroImageUrl={g.heroImageUrl}
        heroImageThumbUrl={g.heroImageThumbUrl}
        galleryImageUrls={g.galleryImageUrls}
        previewVideoUrl={g.previewVideoUrl}
        gameName={g.name}
      />
      <CardHeader>
        <CardTitle className="text-lg dark:text-[#fafaf9]">{g.name}</CardTitle>
        <CardDescription className="dark:text-[rgba(255,255,255,0.55)] flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {g.durationMins} mins
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {g.minPlayers}–{g.maxPlayers} players
          </span>
          {(g.allowPrivate || g.allowPublic) && (
            <span className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {g.allowPrivate ? 'Private' : ''}{g.allowPrivate && g.allowPublic ? ' · ' : ''}{g.allowPublic ? 'Public' : ''}
            </span>
          )}
          {g.startingUnitAmountCents && g.startingUnitAmountCents > 0 ? (
            <span className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-green-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              From ${(g.startingUnitAmountCents / 100).toFixed(2)}/person
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-500 dark:text-[rgba(255,255,255,0.55)]">Select a time slot next</div>
          {g.previewVideoUrl ? (
            <a className="text-xs font-medium text-slate-700 underline dark:text-[rgba(255,255,255,0.55)] hover:dark:text-[#fafaf9] transition-all duration-200" href={g.previewVideoUrl} target="_blank" rel="noreferrer">Watch preview</a>
          ) : null}
        </div>
        <Button type="button" onClick={() => onBook(g.gameId)} className="transition-all duration-200 hover:scale-105">Book Now</Button>
      </CardContent>
    </Card>
  );
}

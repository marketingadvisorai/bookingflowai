import { LayoutSwitcher } from './_components/layouts';
import { getDb } from '@/lib/db';
import { NudgeOverlay } from '@/components/nudge/nudge-overlay';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LayoutType = 'original' | 'wizard' | 'classic';
const VALID_LAYOUTS = new Set<LayoutType>(['original', 'wizard', 'classic']);

export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const theme = sp.theme === 'light' ? 'light' : 'dark';

  const layoutParam = typeof sp.layout === 'string' ? sp.layout : 'original';
  const layout: LayoutType = VALID_LAYOUTS.has(layoutParam as LayoutType)
    ? (layoutParam as LayoutType)
    : 'original';

  const primaryColor = typeof sp.primaryColor === 'string' ? sp.primaryColor : undefined;
  const radius = typeof sp.radius === 'string' ? sp.radius : undefined;
  const orgId = typeof sp.orgId === 'string' ? sp.orgId : undefined;
  let gameId = typeof sp.gameId === 'string' ? sp.gameId : undefined;

  // When no gameId provided but orgId exists, auto-select first game for single-game widget view.
  // For all-games "Book Now" page, use /book?orgId=... route instead.
  if (!gameId && orgId) {
    try {
      const games = await getDb().listGames(orgId);
      if (games.length > 0) {
        gameId = games[0].gameId;
      }
    } catch {
      // If fetch fails, leave gameId undefined
    }
  }

  return (
    <div className={`min-h-screen bg-liquid-radial overflow-hidden${theme === 'dark' ? ' dark' : ''}`}>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <LayoutSwitcher
          layout={layout}
          orgId={orgId}
          gameId={gameId}
          theme={theme}
          primaryColor={primaryColor}
          radius={radius}
        />
        {orgId && <NudgeOverlay orgId={orgId} />}
      </div>
    </div>
  );
}

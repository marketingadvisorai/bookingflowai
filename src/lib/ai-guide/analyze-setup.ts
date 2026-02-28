import { getDb } from '@/lib/db';
import type { Game, Room, Schedule, Org } from '@/lib/booking/types';

export type SetupIssue = {
  id: string;
  severity: 'critical' | 'warning' | 'tip';
  page: 'overview' | 'games' | 'rooms' | 'schedules' | 'embed' | 'settings';
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export type SetupProgress = {
  games: { done: boolean; count: number; label: string };
  rooms: { done: boolean; missing: number; label: string };
  pricing: { done: boolean; missing: number; label: string };
  schedules: { done: boolean; missing: number; label: string };
  stripe: { done: boolean; label: string };
  percent: number;
};

export async function analyzeOrgSetup(orgId: string): Promise<{
  issues: SetupIssue[];
  progress: SetupProgress;
}> {
  const db = getDb();
  const [org, games, rooms, schedules] = await Promise.all([
    db.getOrg(orgId),
    db.listGames(orgId),
    db.listRooms(orgId),
    db.listSchedules(orgId),
  ]);

  const issues: SetupIssue[] = [];

  // --- CRITICAL: No games ---
  if (games.length === 0) {
    issues.push({
      id: 'no-games',
      severity: 'critical',
      page: 'overview',
      title: 'Create your first game',
      description:
        'You need at least one game before customers can book. It only takes a minute!',
      action: { label: 'Create Game', href: '/dashboard/games' },
    });
  }

  // --- CRITICAL: Games without rooms ---
  const gamesWithoutRooms: Game[] = [];
  for (const game of games) {
    const gameRooms = rooms.filter((r) => r.gameId === game.gameId);
    if (gameRooms.length === 0) {
      gamesWithoutRooms.push(game);
      issues.push({
        id: `no-rooms-${game.gameId}`,
        severity: 'critical',
        page: 'games',
        title: `"${game.name}" has no rooms`,
        description:
          'Each game needs at least one room to accept bookings. Think of rooms as the physical spaces where the game happens.',
        action: { label: 'Add Room', href: '/dashboard/rooms' },
      });
    }
  }

  // --- CRITICAL: Games without pricing ---
  const gamesWithoutPricing: Game[] = [];
  for (const game of games) {
    if (!game.pricingTiers || game.pricingTiers.length === 0) {
      gamesWithoutPricing.push(game);
      issues.push({
        id: `no-pricing-${game.gameId}`,
        severity: 'critical',
        page: 'games',
        title: `"${game.name}" has no pricing`,
        description:
          'Without pricing, your booking widget will show "pricing not configured." Set a price per player for each group size.',
        action: { label: 'Edit Game', href: '/dashboard/games' },
      });
    }
  }

  // --- CRITICAL: No schedules ---
  const gamesWithSchedules = new Set(schedules.map((s) => s.gameId));
  const gamesWithoutSchedules: Game[] = [];
  for (const game of games) {
    if (!gamesWithSchedules.has(game.gameId)) {
      gamesWithoutSchedules.push(game);
      issues.push({
        id: `no-schedule-${game.gameId}`,
        severity: 'critical',
        page: 'schedules',
        title: `"${game.name}" has no schedule`,
        description:
          'Without a schedule, there are no available time slots for customers to book.',
        action: { label: 'Create Schedule', href: '/dashboard/schedules' },
      });
    }
  }

  // --- WARNING: Stripe not connected ---
  const stripeConnected = !!(org?.stripeAccountId && org?.stripeChargesEnabled);
  if (!stripeConnected) {
    issues.push({
      id: 'no-stripe',
      severity: 'warning',
      page: 'settings',
      title: 'Connect Stripe to accept payments',
      description:
        "Without Stripe, customers can't pay online. They'll need to contact you directly.",
      action: { label: 'Connect Stripe', href: '/dashboard/settings/payments' },
    });
  }

  // --- TIP: No bookings yet ---
  if (games.length > 0 && rooms.length > 0) {
    const bookingCount = await db.countBookingsForOrg(orgId);
    if (bookingCount === 0) {
      issues.push({
        id: 'no-bookings',
        severity: 'tip',
        page: 'overview',
        title: 'Ready for your first booking!',
        description:
          'Everything looks set up. Share your booking link or embed the widget on your website to start getting bookings.',
        action: { label: 'Get Embed Code', href: '/dashboard/embed' },
      });
    }
  }

  // --- Progress calculation ---
  const totalSteps = 5;
  let completed = 0;

  const gamesOk = games.length > 0;
  if (gamesOk) completed++;

  const roomsOk = games.length > 0 && gamesWithoutRooms.length === 0;
  if (roomsOk) completed++;

  const pricingOk = games.length > 0 && gamesWithoutPricing.length === 0;
  if (pricingOk) completed++;

  const schedulesOk = games.length > 0 && gamesWithoutSchedules.length === 0;
  if (schedulesOk) completed++;

  if (stripeConnected) completed++;

  const progress: SetupProgress = {
    games: {
      done: gamesOk,
      count: games.length,
      label: gamesOk ? `${games.length} created` : 'No games yet',
    },
    rooms: {
      done: roomsOk,
      missing: gamesWithoutRooms.length,
      label: roomsOk
        ? 'All games have rooms'
        : `${gamesWithoutRooms.length} game${gamesWithoutRooms.length === 1 ? '' : 's'} missing rooms`,
    },
    pricing: {
      done: pricingOk,
      missing: gamesWithoutPricing.length,
      label: pricingOk
        ? 'All games have pricing'
        : `${gamesWithoutPricing.length} game${gamesWithoutPricing.length === 1 ? '' : 's'} missing pricing`,
    },
    schedules: {
      done: schedulesOk,
      missing: gamesWithoutSchedules.length,
      label: schedulesOk
        ? 'All games have schedules'
        : `${gamesWithoutSchedules.length} game${gamesWithoutSchedules.length === 1 ? '' : 's'} missing schedules`,
    },
    stripe: {
      done: stripeConnected,
      label: stripeConnected ? 'Connected' : 'Not connected',
    },
    percent: games.length === 0 ? 0 : Math.round((completed / totalSteps) * 100),
  };

  return { issues, progress };
}

/**
 * Filter and sequence issues for a specific page.
 * Only shows the next 1-2 actionable steps to avoid overwhelming the admin.
 */
export function getIssuesForPage(
  issues: SetupIssue[],
  page: 'overview' | 'games' | 'rooms' | 'schedules' | 'embed' | 'settings',
): SetupIssue[] {
  if (page === 'overview') {
    // Show the next 2 most important issues in sequence order
    const priority = ['no-games', 'no-rooms-', 'no-pricing-', 'no-schedule-', 'no-stripe', 'no-bookings'];
    const sorted = [...issues].sort((a, b) => {
      const aIdx = priority.findIndex((p) => a.id.startsWith(p));
      const bIdx = priority.findIndex((p) => b.id.startsWith(p));
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    return sorted.slice(0, 2);
  }

  // For specific pages, show issues relevant to that page
  return issues.filter((i) => i.page === page);
}

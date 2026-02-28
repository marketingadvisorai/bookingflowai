import { NextResponse } from 'next/server';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { getDb } from '@/lib/db';
import { generateRecommendations } from '@/lib/ai-guide/recommendations';
import { getCachedRecommendations, setCachedRecommendations } from '@/lib/ai-guide/recommendation-cache';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { orgId } = await requireDashboardSession();

    // Check for force refresh
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === '1';

    // Return cached if available
    if (!force) {
      const cached = getCachedRecommendations(orgId);
      if (cached) {
        return NextResponse.json({ ok: true, recommendations: cached, cached: true });
      }
    }

    const db = getDb();

    // Fetch org stats in parallel
    const [org, games, rooms, totalBookings, revenueCents, recentBookingsList, schedules] = await Promise.all([
      db.getOrg(orgId),
      db.listGames(orgId),
      db.listRooms(orgId),
      db.countBookingsForOrg(orgId),
      db.getTotalRevenue(orgId),
      db.getRecentBookings(orgId, 50),
      db.listSchedules(orgId),
    ]);

    // Calculate stats from recent bookings
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentCount = recentBookingsList.filter(
      (b) => new Date(b.createdAt || b.startAt).getTime() > weekAgo
    ).length;

    const avgPlayers = recentBookingsList.length > 0
      ? Math.round(recentBookingsList.reduce((sum, b) => sum + (b.players || 0), 0) / recentBookingsList.length)
      : 0;

    // Calculate peak days/hours
    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};
    for (const b of recentBookingsList) {
      const d = new Date(b.startAt);
      const day = d.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    const peakDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => d);

    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([h]) => h);

    // Check for Stripe connection
    const hasStripe = !!(org?.stripeAccountId);

    const recommendations = await generateRecommendations({
      orgName: org?.name || 'Unknown',
      gameCount: games.length,
      roomCount: rooms.length,
      bookingCount: totalBookings,
      totalRevenue: revenueCents / 100,
      hasStripe,
      hasPricing: games.some((g) => (g as Record<string, unknown>).priceCents),
      hasSchedules: schedules.length > 0,
      recentBookings: recentCount,
      avgPlayersPerBooking: avgPlayers,
      peakDays,
      peakHours,
    });

    setCachedRecommendations(orgId, recommendations);

    return NextResponse.json({ ok: true, recommendations, cached: false });
  } catch (error) {
    // requireDashboardSession throws redirect — let it propagate
    throw error;
  }
}

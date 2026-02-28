import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { getDb } from '@/lib/db';
import { DashboardUI } from './_components/dashboard-ui';
import { checkOnboardingComplete } from '@/lib/auth/check-onboarding';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getTimeBasedGreeting(timezone: string): string {
  const hour = new Date().toLocaleString('en-US', { timeZone: timezone, hour12: false, hour: 'numeric' });
  const hourNum = parseInt(hour, 10);
  
  if (hourNum >= 5 && hourNum < 12) return 'Good morning';
  if (hourNum >= 12 && hourNum < 17) return 'Good afternoon';
  if (hourNum >= 17 && hourNum < 22) return 'Good evening';
  return 'Welcome back';
}

export default async function DashboardHome() {
  const { orgId, userId } = await requireDashboardSession({ nextPath: '/dashboard' });
  
  // Check if onboarding is complete
  await checkOnboardingComplete(orgId, '/dashboard');
  
  const db = getDb();

  // Fetch all data in parallel
  const [user, org, games, rooms, totalBookings, revenueCents, recentBookings] = await Promise.all([
    db.getUserById(userId),
    db.getOrg(orgId),
    db.listGames(orgId),
    db.listRooms(orgId),
    db.countBookingsForOrg(orgId),
    db.getTotalRevenue(orgId),
    db.getRecentBookings(orgId, 10),
  ]);

  // Create game lookup map
  const gameById = new Map(games.map((g) => [g.gameId, g]));

  const stats = {
    totalBookings,
    activeGames: games.length,
    totalRooms: rooms.length,
    revenueCents,
  };

  // Personalized greeting
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'there';
  const timezone = org?.timezone || 'Asia/Dhaka';
  const greeting = `${getTimeBasedGreeting(timezone)}, ${displayName}`;

  return (
    <>
      <SetupGuide orgId={orgId} page="overview" />
      <DashboardUI 
        stats={stats} 
        recentBookings={recentBookings} 
        gameById={gameById} 
        greeting={greeting}
        hasGames={games.length > 0}
        hasBookings={totalBookings > 0}
        orgId={orgId}
      />
    </>
  );
}

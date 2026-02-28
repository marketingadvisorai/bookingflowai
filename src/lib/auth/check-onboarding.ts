import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';

// Anti-loop protection: track redirect attempts per orgId
// Key: orgId, Value: array of redirect timestamps
const redirectAttempts = new Map<string, number[]>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  for (const [orgId, timestamps] of redirectAttempts.entries()) {
    const recent = timestamps.filter(t => t > fiveMinutesAgo);
    if (recent.length === 0) {
      redirectAttempts.delete(orgId);
    } else {
      redirectAttempts.set(orgId, recent);
    }
  }
}, 10 * 60 * 1000);

/**
 * Check if the organization has completed onboarding.
 * Redirects to /onboarding if not complete.
 *
 * Smart check: if the org already has games, rooms, businessName, or Stripe connected,
 * it was clearly set up — skip onboarding and back-fill the flag.
 *
 * Anti-loop protection: if we've redirected to onboarding 3+ times in 5 minutes,
 * assume there's a bug and let them through.
 *
 * @param orgId - The organization ID to check
 * @param currentPath - The current path (to avoid redirect loops)
 */
export async function checkOnboardingComplete(orgId: string, currentPath: string) {
  // Don't check if already on onboarding page (avoid redirect loop)
  if (currentPath === '/onboarding') return;

  // Anti-loop protection: check redirect history
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const attempts = redirectAttempts.get(orgId) || [];
  const recentAttempts = attempts.filter(t => t > fiveMinutesAgo);
  
  if (recentAttempts.length >= 3) {
    // Too many redirects — something is wrong, let them through
    console.warn(`[checkOnboardingComplete] Anti-loop triggered for org ${orgId} (${recentAttempts.length} attempts in 5min)`);
    redirectAttempts.delete(orgId); // Reset counter
    return;
  }

  const db = getDb();
  const org = await db.getOrg(orgId);

  // If org doesn't exist, something is very wrong — redirect to login
  if (!org) {
    redirect('/login');
  }

  // Fast path: flag already set
  if (org.onboardingComplete === true) {
    return;
  }

  // Smart detection: if the org has any of these, it was set up before the flag existed
  const hasBusinessName = !!org.businessName && org.businessName.trim().length > 0;
  const hasStripe = !!org.stripeAccountId;
  
  // Check for games/rooms in parallel
  const [games, rooms] = await Promise.all([
    db.listGames(orgId),
    db.listRooms(orgId),
  ]);

  const hasGames = games.length > 0;
  const hasRooms = rooms.length > 0;

  // Debug: games=${hasGames}, rooms=${hasRooms}, businessName=${hasBusinessName}, stripe=${hasStripe}

  // If ANY of these signals exist, consider onboarding complete and FORCE return (don't redirect)
  if (hasGames || hasRooms || hasBusinessName || hasStripe) {
    // Smart detection passed — allowing through
    // Back-fill the flag in the background (non-blocking)
    db.putOrg({ ...org, onboardingComplete: true }).catch((err) => {
      console.error('[checkOnboardingComplete] Failed to back-fill onboardingComplete:', err);
    });
    return;
  }

  // Org truly hasn't been set up yet — record attempt and redirect
  // No setup detected, redirecting to onboarding
  recentAttempts.push(now);
  redirectAttempts.set(orgId, recentAttempts);
  
  redirect('/onboarding');
}

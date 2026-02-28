import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { log } from '@/lib/logging';

/**
 * Cron endpoint to clean up stale holds.
 * 
 * Finds all holds where status='active' AND expires_at < NOW(),
 * and updates them to status='expired'.
 * 
 * Security: Requires Bearer token matching CRON_SECRET env var.
 * Can also be called with ?force=1 in development for testing.
 * 
 * Usage:
 *   - External cron: POST with Authorization: Bearer <CRON_SECRET>
 *   - Vercel cron: Configure in vercel.json
 *   - Manual: GET with ?secret=<CRON_SECRET>
 */

function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  
  // Allow in development without secret
  if (process.env.NODE_ENV === 'development' && !secret) {
    return true;
  }
  
  if (!secret) {
    // No secret configured = endpoint disabled
    return false;
  }
  
  // Check Authorization header
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) {
    return true;
  }
  
  // Check query param (for easier manual testing)
  const url = new URL(req.url);
  if (url.searchParams.get('secret') === secret) {
    return true;
  }
  
  return false;
}

export async function GET(req: Request) {
  return handleCleanup(req);
}

export async function POST(req: Request) {
  return handleCleanup(req);
}

async function handleCleanup(req: Request) {
  const startTime = Date.now();
  
  // Verify authentication
  if (!verifyCronAuth(req)) {
    log.warn('cron.cleanup-holds', 'unauthorized', { ip: req.headers.get('x-forwarded-for') });
    return NextResponse.json(
      { ok: false, error: 'unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }
  
  try {
    const db = getDb();
    
    // Get stats before cleanup
    const activeBeforeCount = await db.countActiveHolds();
    
    // Expire stale holds
    const expiredCount = await db.expireStaleHolds();
    
    // Get stats after cleanup
    const activeAfterCount = await db.countActiveHolds();
    
    const durationMs = Date.now() - startTime;
    
    log.info('cron.cleanup-holds', 'completed', {
      expiredCount,
      activeBeforeCount,
      activeAfterCount,
      durationMs,
    });
    
    return NextResponse.json({
      ok: true,
      expiredCount,
      activeHoldsRemaining: activeAfterCount,
      durationMs,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    const durationMs = Date.now() - startTime;
    
    log.error('cron.cleanup-holds', 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs,
    });
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'cleanup_failed', 
        message: 'Failed to clean up stale holds. Check server logs.',
        durationMs,
      },
      { status: 500 }
    );
  }
}

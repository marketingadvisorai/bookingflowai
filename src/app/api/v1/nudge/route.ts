import { NextResponse } from 'next/server';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getDb } from '@/lib/db';
import { analyzeAndNudge } from '@/lib/nudge/nudge-engine';
import type { BehaviorEvent } from '@/lib/nudge/tracker';

// Simple rate limiter: 6 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 6;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;

  // Kill switch
  if (process.env.BF_AI_NUDGES === 'false') {
    return NextResponse.json({ show: false }, { headers });
  }

  // Rate limit
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ show: false }, { status: 429, headers });
  }

  try {
    const body = await req.json();
    const { orgId, events, pageType } = body as {
      orgId?: string;
      events?: BehaviorEvent[];
      pageType?: string;
    };

    if (!orgId || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ show: false }, { headers });
    }

    // Limit events to 20
    const trimmed = events.slice(-20);

    // Get org context
    const db = getDb();
    const [games, org] = await Promise.all([
      db.listGames(orgId),
      db.getOrg(orgId),
    ]);

    // Find most popular game (first game as simple heuristic)
    let popularGame: string | undefined;
    if (games.length > 0) {
      popularGame = games[0].name;
    }

    // Check if Stripe is connected
    const hasStripe = !!(org && 'stripeAccountId' in org && (org as Record<string, unknown>).stripeAccountId);

    const nudge = await analyzeAndNudge(trimmed, {
      orgId,
      hasGames: games.length > 0,
      gameCount: games.length,
      popularGame,
      pageType: pageType || 'widget',
      hasStripe,
    });

    return NextResponse.json(nudge, { headers });
  } catch {
    return NextResponse.json({ show: false }, { headers });
  }
}

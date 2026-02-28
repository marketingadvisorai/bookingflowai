import { NextResponse } from 'next/server';
import { createHoldBodySchema } from '@/lib/booking/validators';
import { createId } from '@paralleldrive/cuid2';
import { overlaps } from '@/lib/booking/time';
import { computeHoldPricing } from '@/lib/booking/pricing';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { addRateLimitHeaders } from '@/lib/http/errors';

function nowIso() {
  return new Date().toISOString();
}

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  
  const headers = new Headers();
  // Add CORS headers
  Object.entries(cors.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Rate limiting: 5 requests per minute per IP (hold creation is sensitive)
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `holds:create:${ip}`, limit: 20, windowMs: 60_000 });
  addRateLimitHeaders(headers, { limit: 5, remaining: rl.remaining, resetAt: rl.resetAt });
  
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: 'Too many hold creation requests. Please slow down.' },
      { status: 429, headers }
    );
  }
  
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers });
  }
  
  const parsed = createHoldBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers });
  }

  const { orgId, gameId, roomId, bookingType, startAt, endAt, players, customer } = parsed.data;
  
  // Validate orgId format to prevent injection attacks
  if (!orgId || typeof orgId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(orgId)) {
    return NextResponse.json({ ok: false, error: 'invalid_org_id' }, { status: 400, headers });
  }
  
  // Sanitize customer input
  if (customer.name) customer.name = customer.name.trim().slice(0, 100);
  if (customer.email) customer.email = customer.email.trim().toLowerCase().slice(0, 255);
  if (customer.phone) customer.phone = customer.phone.trim().slice(0, 50);
  
  const db = getDb();

  // Parallelize: fetch org, game, room, holds, bookings together
  const [org, game, room, allHolds, allBookings] = await Promise.all([
    db.getOrg(orgId),
    db.getGame(orgId, gameId),
    db.getRoom(orgId, roomId),
    db.listHoldsForGame(orgId, gameId),
    db.listBookingsForGame(orgId, gameId),
  ]);

  if (!game) return NextResponse.json({ ok: false, error: 'game_not_found', message: 'This game could not be found.' }, { status: 404, headers });
  if (!room || room.gameId !== gameId) return NextResponse.json({ ok: false, error: 'room_not_found', message: 'This room could not be found.' }, { status: 404, headers });

  const maxAllowed = Math.min(game.maxPlayers, room.maxPlayers);
  if (players < game.minPlayers || players > maxAllowed) {
    return NextResponse.json(
      { ok: false, error: 'invalid_party_size', message: `This game requires ${game.minPlayers}-${maxAllowed} players.`, minPlayers: game.minPlayers, maxPlayers: maxAllowed },
      { status: 400, headers }
    );
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!(start < end)) return NextResponse.json({ ok: false, error: 'invalid_time_window', message: 'The selected time slot is invalid.' }, { status: 400, headers });

  // Filter to room-specific active holds (exclude expired) and confirmed bookings
  const nowMs = Date.now();
  const activeHolds = allHolds.filter((h) => h.roomId === roomId && h.status === 'active' && new Date(h.expiresAt).getTime() > nowMs);
  const bookings = allBookings.filter((b) => b.roomId === roomId && b.status === 'confirmed');

  const overlapping = [
    ...activeHolds.map((h) => ({ start: new Date(h.startAt), end: new Date(h.endAt), bookingType: h.bookingType, players: h.players })),
    ...bookings.map((b) => ({ start: new Date(b.startAt), end: new Date(b.endAt), bookingType: b.bookingType, players: b.players })),
  ].filter((x) => overlaps(start, end, x.start, x.end));

  if (bookingType === 'private') {
    if (overlapping.length > 0) {
      const hasPrivate = overlapping.some((x) => x.bookingType === 'private');
      return NextResponse.json({
        ok: false,
        error: 'slot_unavailable',
        message: hasPrivate
          ? 'This time slot is reserved for a private booking.'
          : 'This time slot already has bookings. Private bookings require an empty slot.',
      }, { status: 409, headers });
    }
  } else {
    if (overlapping.some((x) => x.bookingType === 'private')) {
      return NextResponse.json({ ok: false, error: 'slot_unavailable', message: 'This time slot is reserved for a private booking.' }, { status: 409, headers });
    }
    const usedPlayers = overlapping.filter((x) => x.bookingType === 'public').reduce((a, x) => a + x.players, 0);
    const remaining = room.maxPlayers - usedPlayers;
    if (players > remaining) {
      return NextResponse.json({
        ok: false,
        error: 'slot_capacity_exceeded',
        message: remaining > 0 ? `Only ${remaining} spot${remaining === 1 ? '' : 's'} remaining for this time slot.` : 'This time slot is fully booked. Please try a different time.',
        remainingPlayers: remaining,
      }, { status: 409, headers });
    }
  }

  const pricing = computeHoldPricing({ org, game, players });
  if (!pricing.ok) {
    return NextResponse.json({ ok: false, error: pricing.error, message: pricing.message }, { status: 409, headers });
  }

  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString(); // 10 min hold

  const hold = {
    orgId,
    holdId: createId(),
    gameId,
    roomId,
    bookingType,
    startAt,
    endAt,
    players,
    status: 'active' as const,
    createdAt,
    expiresAt,

    currency: pricing.currency,
    subtotalCents: pricing.subtotalCents,
    processingFeeCents: pricing.processingFeeCents,
    totalCents: pricing.totalCents,
    processingFeeBps: pricing.processingFeeBps,
    processingFeeLabel: pricing.processingFeeLabel,

    customer,

    // Pass max capacity for atomic public booking check (stripped before storage by DB layer)
    ...(bookingType === 'public' ? { maxPlayersForSlot: room.maxPlayers } : {}),
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.putHold(orgId, hold as any);
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
      return NextResponse.json({ ok: false, error: 'slot_unavailable', message: 'This slot was just taken. Please try a different time.' }, { status: 409, headers });
    }
    console.error('Hold creation error:', err);
    return NextResponse.json({ ok: false, error: 'server_error', message: 'Something went wrong creating your hold. Please try again.' }, { status: 500, headers });
  }

  // Return trimmed hold (exclude internal fields)
  const { maxPlayersForSlot: _, ...safeHold } = hold as Record<string, unknown>;
  return NextResponse.json({ ok: true, hold: safeHold }, { headers });
}

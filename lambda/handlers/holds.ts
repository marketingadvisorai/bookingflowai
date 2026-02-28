import { createHoldBodySchema } from '@/lib/booking/validators';
import { overlaps } from '@/lib/booking/time';
import { createId } from '@paralleldrive/cuid2';
import { getDb } from '@/lib/db';
import { corsHeaders } from '@/lib/http/cors';

function nowIso() {
  return new Date().toISOString();
}

function json(statusCode: number, body: unknown, origin: string | null) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(origin),
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: unknown) {
  const e = event as Record<string, unknown>;
  const requestContext = (e.requestContext as Record<string, unknown> | undefined) ?? undefined;
  const http = (requestContext?.http as Record<string, unknown> | undefined) ?? undefined;
  const method = http?.method;
  const headers = (e.headers as Record<string, unknown> | undefined) ?? undefined;
  const origin = typeof headers?.origin === 'string' ? headers.origin : null;
  if (method === 'OPTIONS') return json(204, null, origin);

  const rawBody = typeof e.body === 'string' ? e.body : null;
  const body = rawBody ? JSON.parse(rawBody) : null;
  const parsed = createHoldBodySchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_request', details: parsed.error.flatten() }, origin);
  }

  const db = getDb();
  const { orgId, gameId, roomId, bookingType, startAt, endAt, players, customer } = parsed.data;

  const game = await db.getGame(orgId, gameId);
  if (!game) return json(404, { ok: false, error: 'game_not_found' }, origin);

  const room = await db.getRoom(orgId, roomId);
  if (!room || room.gameId !== gameId) return json(404, { ok: false, error: 'room_not_found' }, origin);

  if (players < game.minPlayers || players > game.maxPlayers || players > room.maxPlayers) {
    return json(
      400,
      {
        ok: false,
        error: 'invalid_party_size',
        minPlayers: game.minPlayers,
        maxPlayers: Math.min(game.maxPlayers, room.maxPlayers),
      },
      origin
    );
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!(start < end)) return json(400, { ok: false, error: 'invalid_time_window' }, origin);

  const activeHolds = (await db.listHoldsForGame(orgId, gameId)).filter((h) => h.roomId === roomId && h.status === 'active');
  const bookings = (await db.listBookingsForGame(orgId, gameId)).filter((b) => b.roomId === roomId && b.status === 'confirmed');

  const overlapping = [
    ...activeHolds.map((h) => ({ start: new Date(h.startAt), end: new Date(h.endAt), bookingType: h.bookingType, players: h.players })),
    ...bookings.map((b) => ({ start: new Date(b.startAt), end: new Date(b.endAt), bookingType: b.bookingType, players: b.players })),
  ].filter((x) => overlaps(start, end, x.start, x.end));

  if (bookingType === 'private') {
    if (overlapping.length > 0) return json(409, { ok: false, error: 'slot_unavailable' }, origin);
  } else {
    if (overlapping.some((x) => x.bookingType === 'private')) return json(409, { ok: false, error: 'slot_unavailable' }, origin);
    const usedPlayers = overlapping.filter((x) => x.bookingType === 'public').reduce((a, x) => a + x.players, 0);
    const remaining = room.maxPlayers - usedPlayers;
    if (players > remaining)
      return json(409, { ok: false, error: 'slot_capacity_exceeded', remainingPlayers: remaining }, origin);
  }

  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

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
    customer,
  };

  try {
    await db.putHold(orgId, hold);
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
      return json(409, { ok: false, error: 'slot_unavailable' }, origin);
    }
    throw err;
  }
  return json(200, { ok: true, hold }, origin);
}

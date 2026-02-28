import { availabilityQuerySchema } from '@/lib/booking/validators';
import { computeSlots } from '@/lib/booking/availability';
import { getDb } from '@/lib/db';
import { corsHeaders } from '@/lib/http/cors';

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

  const q = (e.queryStringParameters as Record<string, unknown> | undefined) ?? {};
  const parsed = availabilityQuerySchema.safeParse(q);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_request', details: parsed.error.flatten() }, origin);
  }

  const { orgId, gameId, date, type, players } = parsed.data;
  const db = getDb();

  const game = await db.getGame(orgId, gameId);
  if (!game) return json(404, { ok: false, error: 'game_not_found' }, origin);

  if (type === 'private' && !game.allowPrivate) return json(400, { ok: false, error: 'booking_type_not_allowed' }, origin);
  if (type === 'public' && !game.allowPublic) return json(400, { ok: false, error: 'booking_type_not_allowed' }, origin);

  if (players < game.minPlayers || players > game.maxPlayers) {
    return json(400, { ok: false, error: 'invalid_party_size', minPlayers: game.minPlayers, maxPlayers: game.maxPlayers }, origin);
  }

  const schedules = await db.listSchedules(orgId);
  const schedule = schedules.find((s) => s.gameId === gameId) ?? null;
  if (!schedule) return json(404, { ok: false, error: 'schedule_not_found' }, origin);

  const rooms = (await db.listRooms(orgId)).filter((r) => r.gameId === gameId);
  const holds = await db.listHoldsForGame(orgId, gameId);
  const bookings = await db.listBookingsForGame(orgId, gameId);

  const slots = computeSlots({
    game,
    rooms,
    schedule,
    date,
    bookingType: type,
    players,
    holds,
    bookings,
  });

  return json(200, { ok: true, orgId, gameId, date, type, players, slots }, origin);
}

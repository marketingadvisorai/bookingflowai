import { z } from 'zod';

import { getDb } from '@/lib/db';
import { corsHeaders } from '@/lib/http/cors';
import { computeSlots } from '@/lib/booking/availability';

const schema = z.object({
  orgId: z.string().min(1),
  gameId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  type: z.enum(['private', 'public']),
  players: z.coerce.number().int().min(1).max(100),
});

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
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

  const qs = (e.queryStringParameters as Record<string, unknown> | undefined) ?? {};
  const parsed = schema.safeParse(qs);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_request', details: parsed.error.flatten() }, origin);
  }

  const { orgId, gameId, month, type, players } = parsed.data;
  const [yyyyStr, mmStr] = month.split('-');
  const year = Number(yyyyStr);
  const monthIndex0 = Number(mmStr) - 1;

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

  const totalDays = daysInMonth(year, monthIndex0);
  const availableDates: string[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const dd = String(d).padStart(2, '0');
    const date = `${month}-${dd}`;

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

    if (slots.length > 0) availableDates.push(date);
  }

  return json(200, { ok: true, orgId, gameId, month, type, players, availableDates }, origin);
}

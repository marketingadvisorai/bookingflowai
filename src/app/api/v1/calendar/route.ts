import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/lib/db';
import { computeSlots } from '@/lib/booking/availability';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';

const schema = z.object({
  orgId: z.string().min(1),
  gameId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  type: z.enum(['private', 'public']),
  players: z.coerce.number().int().min(1).max(100),
});

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;
  const url = new URL(req.url);
  const parsed = schema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { orgId, gameId, month, type, players } = parsed.data;
  const [yyyyStr, mmStr] = month.split('-');
  const year = Number(yyyyStr);
  const monthIndex0 = Number(mmStr) - 1;

  const db = getDb();
  const game = await db.getGame(orgId, gameId);
  if (!game) return NextResponse.json({ ok: false, error: 'game_not_found' }, { status: 404, headers });

  if (type === 'private' && !game.allowPrivate) {
    return NextResponse.json({ ok: false, error: 'booking_type_not_allowed' }, { status: 400, headers });
  }
  if (type === 'public' && !game.allowPublic) {
    return NextResponse.json({ ok: false, error: 'booking_type_not_allowed' }, { status: 400, headers });
  }

  if (players < game.minPlayers || players > game.maxPlayers) {
    return NextResponse.json(
      { ok: false, error: 'invalid_party_size', minPlayers: game.minPlayers, maxPlayers: game.maxPlayers },
      { status: 400, headers }
    );
  }

  const schedules = await db.listSchedules(orgId);
  const schedule = schedules.find((s) => s.gameId === gameId) ?? null;
  if (!schedule) return NextResponse.json({ ok: false, error: 'schedule_not_found' }, { status: 404, headers });

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

  return NextResponse.json({ ok: true, orgId, gameId, month, type, players, availableDates }, { headers });
}

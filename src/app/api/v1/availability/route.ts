import { NextResponse } from 'next/server';
import { availabilityQuerySchema } from '@/lib/booking/validators';
import { computeSlots } from '@/lib/booking/availability';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { logError } from '@/lib/logging';

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  
  const headers = new Headers();
  Object.entries(cors.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });

  try {
    const url = new URL(req.url);
    const parsed = availabilityQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map(issue => ({
        field: issue.path.join('.') || String(issue.path[0] ?? 'unknown'),
        message: issue.message,
        code: issue.code,
      }));
      const missingFields = fieldErrors.filter(e => e.code === 'invalid_type' || e.message.toLowerCase().includes('required'));
      const errorMessage = missingFields.length > 0
        ? `Missing required fields: ${missingFields.map(e => e.field).join(', ')}`
        : `Validation failed: ${fieldErrors.map(e => `${e.field} - ${e.message}`).join('; ')}`;
      return NextResponse.json({ 
        ok: false, 
        error: 'invalid_request', 
        message: errorMessage,
        fields: fieldErrors.map(({ field, message }) => ({ field, message })),
      }, { status: 400, headers });
    }

    const { orgId, gameId, date, type, players } = parsed.data;

    if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) {
      return NextResponse.json({ ok: false, error: 'invalid_org_id' }, { status: 400, headers });
    }

    const db = getDb();

    const game = await db.getGame(orgId, gameId);
    if (!game) return NextResponse.json({ ok: false, error: 'game_not_found', message: 'This game could not be found.' }, { status: 404, headers });

    if (type === 'private' && !game.allowPrivate) {
      return NextResponse.json({ ok: false, error: 'booking_type_not_allowed', message: 'Private bookings are not available for this game.' }, { status: 400, headers });
    }
    if (type === 'public' && !game.allowPublic) {
      return NextResponse.json({ ok: false, error: 'booking_type_not_allowed', message: 'Public bookings are not available for this game.' }, { status: 400, headers });
    }

    if (players < game.minPlayers || players > game.maxPlayers) {
      return NextResponse.json(
        { ok: false, error: 'invalid_party_size', message: `This game requires ${game.minPlayers}-${game.maxPlayers} players.`, minPlayers: game.minPlayers, maxPlayers: game.maxPlayers },
        { status: 400, headers }
      );
    }

    // Parallelize all independent DB fetches
    const [schedules, allRooms, holds, bookings] = await Promise.all([
      db.listSchedules(orgId),
      db.listRooms(orgId),
      db.listHoldsForGame(orgId, gameId),
      db.listBookingsForGame(orgId, gameId),
    ]);

    const schedule = schedules.find((s) => s.gameId === gameId) ?? null;
    if (!schedule) return NextResponse.json({ ok: false, error: 'schedule_not_found', message: 'No schedule found for this game.' }, { status: 404, headers });

    const rooms = allRooms.filter((r) => r.gameId === gameId);
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

    const slots = computeSlots({
      game,
      rooms,
      schedule,
      date,
      bookingType: type,
      players,
      holds,
      bookings: confirmedBookings,
    });

    return NextResponse.json({ ok: true, slots }, { headers });
  } catch (err) {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId') ?? 'unknown';
    logError('api.availability', 'failed', err, { orgId, endpoint: '/api/v1/availability' });
    return NextResponse.json({ ok: false, error: 'server_error', message: 'Something went wrong. Please try again in a moment.' }, { status: 500, headers });
  }
}

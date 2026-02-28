import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';

const querySchema = z.object({
  orgId: z.string().min(1),
});

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request, ctx: { params: Promise<{ bookingId: string }> }) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { bookingId } = await ctx.params;
  const { orgId } = parsed.data;

  const db = getDb();
  const booking = await db.getBooking(orgId, bookingId);
  if (!booking) return NextResponse.json({ ok: false, error: 'booking_not_found' }, { status: 404, headers });

  // Public-safe shape (avoid leaking unnecessary PII)
  const publicBooking = {
    orgId: booking.orgId,
    bookingId: booking.bookingId,
    gameId: booking.gameId,
    roomId: booking.roomId,
    bookingType: booking.bookingType,
    startAt: booking.startAt,
    endAt: booking.endAt,
    players: booking.players,
    status: booking.status,
    createdAt: booking.createdAt,
    customer: booking.customer ? { name: booking.customer.name } : undefined,
  };

  return NextResponse.json({ ok: true, booking: publicBooking }, { status: 200, headers });
}

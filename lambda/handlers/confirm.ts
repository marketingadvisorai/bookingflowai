import { confirmBookingBodySchema } from '@/lib/booking/validators';
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
  const parsed = confirmBookingBodySchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_request', details: parsed.error.flatten() }, origin);
  }

  const { orgId, holdId } = parsed.data;
  const db = getDb();

  const hold = await db.getHold(orgId, holdId);
  if (!hold) return json(404, { ok: false, error: 'hold_not_found' }, origin);

  if (hold.status === 'active' && new Date(hold.expiresAt).getTime() <= Date.now()) {
    hold.status = 'expired';
  }

  if (hold.status !== 'active') {
    return json(409, { ok: false, error: 'hold_not_active', status: hold.status }, origin);
  }

  hold.status = 'confirmed';

  const booking = {
    orgId,
    bookingId: createId(),
    holdId: hold.holdId,
    gameId: hold.gameId,
    roomId: hold.roomId,
    bookingType: hold.bookingType,
    startAt: hold.startAt,
    endAt: hold.endAt,
    players: hold.players,
    status: 'confirmed' as const,
    createdAt: nowIso(),
    customer: hold.customer,
  };

  try {
    await db.putBooking(orgId, booking);
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
      return json(409, { ok: false, error: 'slot_unavailable' }, origin);
    }
    throw err;
  }

  await db.putHold(orgId, hold);

  return json(200, { ok: true, booking }, origin);
}

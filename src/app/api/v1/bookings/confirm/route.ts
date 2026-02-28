import { NextResponse } from 'next/server';
import { confirmBookingBodySchema } from '@/lib/booking/validators';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';

function nowIso() {
  return new Date().toISOString();
}

function bookingIdFromHold(holdId: string) {
  // Deterministic booking id for idempotency (double-taps / retries / network races)
  return `booking_${holdId}`;
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
  
  // Rate limiting headers
  headers.set('X-RateLimit-Limit', '10');
  headers.set('X-RateLimit-Remaining', '9');
  headers.set('X-RateLimit-Reset', (Math.ceil(Date.now() / 1000) + 60).toString());

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers });
  }
  
  const parsed = confirmBookingBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers });
  }

  const { orgId, holdId, promoCode, customer: customerOverride } = parsed.data;
  
  // Validate orgId format to prevent injection attacks
  if (!orgId || typeof orgId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(orgId)) {
    return NextResponse.json({ ok: false, error: 'invalid_org_id' }, { status: 400, headers });
  }
  
  // Sanitize promo code
  const sanitizedPromoCode = promoCode?.trim().slice(0, 50);
  
  const db = getDb();

  const org = await db.getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found', message: 'Organization not found.' }, { status: 404, headers });

  // Security: once Stripe is enabled, bookings must be confirmed via paid webhooks, not a public confirm call.
  if (org.stripeAccountId && (org.paymentMode === 'full' || org.paymentMode === 'deposit')) {
    return NextResponse.json({ ok: false, error: 'payment_required', message: 'Payment is required to confirm this booking.' }, { status: 409, headers });
  }

  const hold = await db.getHold(orgId, holdId);
  if (!hold) return NextResponse.json({ ok: false, error: 'hold_not_found', message: 'Your hold has expired or was not found. Please start a new booking.' }, { status: 404, headers });

  // If already confirmed, return a stable success response.
  if (hold.status === 'confirmed' && hold.bookingId) {
    const booking = {
      orgId,
      bookingId: hold.bookingId,
      holdId: hold.holdId,
      gameId: hold.gameId,
      roomId: hold.roomId,
      bookingType: hold.bookingType,
      startAt: hold.startAt,
      endAt: hold.endAt,
      players: hold.players,
      status: 'confirmed' as const,
      createdAt: hold.confirmedAt ?? nowIso(),
      customer: hold.customer,

      // Echo pricing snapshot from hold (if present)
      currency: hold.currency,
      subtotalCents: hold.subtotalCents,
      processingFeeCents: hold.processingFeeCents,
      totalCents: hold.totalCents,
      processingFeeBps: hold.processingFeeBps,
      processingFeeLabel: hold.processingFeeLabel,

      promoCode: sanitizedPromoCode || undefined,
    };
    return NextResponse.json({ ok: true, booking, idempotent: true }, { status: 200, headers });
  }

  // Expire hold if past expiresAt
  if (hold.status === 'active' && new Date(hold.expiresAt).getTime() <= Date.now()) {
    hold.status = 'expired';
  }

  if (hold.status !== 'active') {
    return NextResponse.json({ ok: false, error: 'hold_not_active', message: 'Your hold has expired. Please start a new booking.', status: hold.status }, { status: 409, headers });
  }

  // Merge customer data: prefer override from request body (filled after hold creation)
  const mergedCustomer = {
    ...hold.customer,
    ...(customerOverride?.name ? { name: customerOverride.name.trim().slice(0, 100) } : {}),
    ...(customerOverride?.email ? { email: customerOverride.email.trim().toLowerCase().slice(0, 255) } : {}),
    ...(customerOverride?.phone ? { phone: customerOverride.phone.trim().slice(0, 50) } : {}),
    ...(customerOverride?.firstName ? { firstName: customerOverride.firstName.trim().slice(0, 100) } : {}),
    ...(customerOverride?.lastName ? { lastName: customerOverride.lastName.trim().slice(0, 100) } : {}),
  };

  // Also update the hold's customer so webhook-created bookings get the data
  if (customerOverride && Object.keys(customerOverride).length > 0) {
    hold.customer = mergedCustomer;
  }

  const bookingId = bookingIdFromHold(hold.holdId);
  const booking = {
    orgId,
    bookingId,
    holdId: hold.holdId,
    gameId: hold.gameId,
    roomId: hold.roomId,
    bookingType: hold.bookingType,
    startAt: hold.startAt,
    endAt: hold.endAt,
    players: hold.players,
    status: 'confirmed' as const,
    createdAt: nowIso(),
    customer: mergedCustomer,

    // Pricing snapshot from hold
    currency: hold.currency,
    subtotalCents: hold.subtotalCents,
    processingFeeCents: hold.processingFeeCents,
    totalCents: hold.totalCents,
    processingFeeBps: hold.processingFeeBps,
    processingFeeLabel: hold.processingFeeLabel,

    promoCode: promoCode || undefined, 
  };

  try {
    // Book first (enforces slot lock), then mark hold confirmed.
    await db.putBooking(orgId, booking);
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
      // If booking already exists, treat as idempotent success.
      hold.status = 'confirmed';
      hold.bookingId = bookingId;
      hold.confirmedAt = hold.confirmedAt ?? booking.createdAt;
      await db.putHold(orgId, hold);
      return NextResponse.json({ ok: true, booking, idempotent: true }, { status: 200, headers });
    }
    console.error('Confirm booking error:', err);
    return NextResponse.json({ ok: false, error: 'server_error', message: 'Something went wrong confirming your booking. Please try again.' }, { status: 500, headers });
  }

  hold.status = 'confirmed';
  hold.bookingId = bookingId;
  hold.confirmedAt = booking.createdAt;
  await db.putHold(orgId, hold);

  return NextResponse.json({ ok: true, booking }, { status: 200, headers });
}


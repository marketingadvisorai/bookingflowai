import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { z } from 'zod';

import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getDb } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe/client';
import { calcDepositCents } from '@/lib/stripe/money';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { addRateLimitHeaders } from '@/lib/http/errors';
import { explainError } from '@/lib/error-explainer';

const bodySchema = z.object({
  orgId: z.string().min(1),
  holdId: z.string().min(1),
  // Optional: where Stripe should redirect after payment.
  returnUrl: z.string().url().optional(),
  // Gift card: partial coverage reduces Stripe amount
  giftCardCode: z.string().optional(),
  giftCardAmountCents: z.number().int().min(1).optional(),
});

function safeReturnBase(req: Request, returnUrl?: string) {
  if (!returnUrl) return null;
  try {
    const u = new URL(returnUrl);
    const origin = req.headers.get('origin');
    // Only allow returning to the embedding origin to avoid open redirects.
    if (origin && u.origin === origin) return u;
    return null;
  } catch {
    return null;
  }
}

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  
  const headers = new Headers();
  Object.entries(cors.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Rate limiting: 3 requests per minute per IP (payment creation is highly sensitive)
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `stripe:checkout:${ip}`, limit: 5, windowMs: 60_000 });
  addRateLimitHeaders(headers, { limit: 5, remaining: rl.remaining, resetAt: rl.resetAt });
  
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: await explainError('rate_limited') },
      { status: 429, headers }
    );
  }

  const stripe = getStripeClient();
  if (!stripe) return NextResponse.json({ ok: false, error: 'stripe_not_configured', message: await explainError('stripe_not_configured') }, { status: 501, headers });

  // Parse and validate request body
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { orgId, holdId, returnUrl, giftCardCode, giftCardAmountCents } = parsed.data;
  const db = getDb();

  // Fetch org and hold from database
  let org, hold;
  try {
    org = await db.getOrg(orgId);
    hold = await db.getHold(orgId, holdId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown_error';
    console.error('[stripe/checkout/create] Database error fetching org/hold:', msg, { orgId, holdId });
    
    if (msg.includes('TimeoutError') || msg.includes('NetworkingError')) {
      return NextResponse.json(
        { ok: false, error: 'database_timeout', message: 'Database temporarily unavailable. Please try again in a moment.' },
        { status: 503, headers }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: 'database_error', message: 'Could not fetch booking data. Please try again.' },
      { status: 500, headers }
    );
  }

  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404, headers });
  if (!org.stripeAccountId) {
    return NextResponse.json({ ok: false, error: 'stripe_not_connected', message: 'Payment provider not connected. Please contact the venue.' }, { status: 409, headers });
  }

  if (!hold) return NextResponse.json({ ok: false, error: 'hold_not_found', message: await explainError('hold_not_found') }, { status: 404, headers });

  // Only active holds can be checked out.
  if (hold.status !== 'active') {
    // If already confirmed, client can show a stable success screen.
    if (hold.status === 'confirmed' && hold.bookingId) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true, bookingId: hold.bookingId }, { status: 200, headers });
    }
    return NextResponse.json({ ok: false, error: 'hold_not_active', status: hold.status, message: await explainError('hold_not_active') }, { status: 409, headers });
  }

  // Expire holds if past expiresAt.
  if (new Date(hold.expiresAt).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, error: 'hold_expired', message: await explainError('hold_expired') }, { status: 409, headers });
  }

  // Extend hold TTL to 10 minutes from now.
  const extendedExpiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  if (new Date(hold.expiresAt).getTime() < new Date(extendedExpiresAt).getTime()) {
    hold.expiresAt = extendedExpiresAt;
    try {
      await db.extendHoldTTL(orgId, hold.holdId, extendedExpiresAt);
    } catch (err: unknown) {
      // Non-critical — log but continue with checkout
      const msg = err instanceof Error ? err.message : 'unknown_error';
      console.warn('[stripe/checkout/create] Failed to extend hold TTL (non-critical):', msg, { orgId, holdId });
    }
  }

  const totalCents = hold.totalCents ?? hold.subtotalCents ?? null;
  const currency = (hold.currency ?? 'usd').toLowerCase();
  if (totalCents == null || !Number.isFinite(totalCents)) {
    return NextResponse.json({ ok: false, error: 'missing_price' }, { status: 400, headers });
  }

  const mode = org.paymentMode ?? 'full';
  const depositPercent = org.depositPercent ?? 50;

  const baseAmountCents = mode === 'deposit' ? calcDepositCents(totalCents, depositPercent) : totalCents;
  
  // Reduce by gift card amount if provided
  const gcDeduction = giftCardAmountCents && giftCardAmountCents > 0 ? Math.min(giftCardAmountCents, baseAmountCents) : 0;
  const amountAfterGc = baseAmountCents - gcDeduction;
  
  // If gift card covers full amount, no Stripe session needed
  if (amountAfterGc <= 0) {
    return NextResponse.json({ ok: true, fullyCovered: true, holdId }, { status: 200, headers });
  }

  const unitAmount = Math.max(50, Math.round(amountAfterGc));

  const base = safeReturnBase(req, returnUrl);

  // Default fallback for dashboard/manual testing.
  const fallbackBase = new URL(`${process.env.BF_PUBLIC_BASE_URL || 'https://bookingflowai.com'}/widget`);

  const returnBase = new URL(base?.toString() ?? fallbackBase.toString());
  returnBase.searchParams.set('orgId', orgId);
  returnBase.searchParams.set('holdId', holdId);
  if (hold.gameId) returnBase.searchParams.set('gameId', hold.gameId);
  returnBase.searchParams.set('stripe', 'success');
  returnBase.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

  // Stripe needs literal {CHECKOUT_SESSION_ID} — URL class encodes curly braces
  const returnUrlFinal = returnBase.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}');

  // Platform fee: configurable via env var (default 5%)
  const feePercent = Number(process.env.BF_PLATFORM_FEE_PERCENT ?? '5');
  const applicationFeeAmount = feePercent > 0 ? Math.round(unitAmount * (feePercent / 100)) : undefined;

  // Create Stripe checkout session
  let session;
  try {
    session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    // MVP: keep payment methods synchronous to avoid long-running async payments outliving our short hold TTL.
    payment_method_types: ['card'],
    return_url: returnUrlFinal,
    client_reference_id: holdId,
    payment_intent_data: {
      transfer_data: { destination: org.stripeAccountId },
      ...(applicationFeeAmount ? { application_fee_amount: applicationFeeAmount } : {}),
      metadata: {
        orgId,
        holdId,
        paymentMode: mode,
        depositPercent: String(depositPercent),
        expectedAmountCents: String(unitAmount),
        expectedCurrency: currency,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: unitAmount,
          product_data: {
            name: mode === 'deposit' ? 'Booking deposit' : 'Booking payment',
            description:
              mode === 'deposit' ? `Deposit (${depositPercent}%) for booking ${holdId}` : `Booking ${holdId}`,
          },
        },
      },
    ],
    metadata: {
      orgId,
      holdId,
      paymentMode: mode,
      depositPercent: String(depositPercent),
      expectedAmountCents: String(unitAmount),
      expectedCurrency: currency,
      // Gift card info for webhook processing
      giftCardCode: giftCardCode ?? '',
      giftCardAmountCents: gcDeduction > 0 ? String(gcDeduction) : '',
      // Extra fields for fallback booking creation if hold expires/is deleted
      gameId: hold.gameId ?? '',
      roomId: hold.roomId ?? '',
      startAt: hold.startAt ?? '',
      endAt: hold.endAt ?? '',
      players: String(hold.players ?? 1),
      bookingType: hold.bookingType ?? 'private',
      customerName: hold.customer?.name ?? '',
      customerEmail: hold.customer?.email ?? '',
      customerPhone: hold.customer?.phone ?? '',
    },
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown_error';
    console.error('[stripe/checkout/create] Stripe API error:', msg, { orgId, holdId });
    
    // Parse Stripe-specific errors
    if (msg.includes('No such account') || msg.includes('invalid account')) {
      return NextResponse.json(
        { ok: false, error: 'stripe_account_invalid', message: 'Payment provider account is invalid. Please contact the venue.' },
        { status: 409, headers }
      );
    }
    
    if (msg.includes('account is not currently due for capabilities')) {
      return NextResponse.json(
        { ok: false, error: 'stripe_account_not_ready', message: 'Payment provider is not fully set up. Please contact the venue.' },
        { status: 409, headers }
      );
    }
    
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return NextResponse.json(
        { ok: false, error: 'stripe_rate_limited', message: 'Too many payment requests. Please wait a moment and try again.' },
        { status: 429, headers }
      );
    }
    
    if (msg.includes('Invalid currency')) {
      return NextResponse.json(
        { ok: false, error: 'invalid_currency', message: 'Invalid payment currency. Please contact the venue.' },
        { status: 400, headers }
      );
    }
    
    // Generic Stripe error
    return NextResponse.json(
      { ok: false, error: 'stripe_error', message: 'Could not create payment session. Please try again or contact the venue.' },
      { status: 500, headers }
    );
  }

  return NextResponse.json({ ok: true, clientSecret: session.client_secret, id: session.id }, { status: 200, headers });
}

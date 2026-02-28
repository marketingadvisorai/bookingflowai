import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe/client';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { addRateLimitHeaders } from '@/lib/http/errors';
import { generateGiftCardCode } from '@/lib/gift-card-utils';
import { createGiftCardCheckoutSession } from './stripe-session';

const purchaseSchema = z.object({
  orgId: z.string().min(1),
  amountCents: z.number().int().min(1000).max(100000),
  purchaserName: z.string().min(1).max(100).optional(),
  purchaserEmail: z.string().email().max(255),
  recipientName: z.string().min(1).max(100).optional(),
  recipientEmail: z.string().email().max(255).optional(),
  personalMessage: z.string().max(500).optional(),
  deliveryDate: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = new Headers();
  Object.entries(cors.headers).forEach(([key, value]) => { headers.set(key, value); });

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `gift-cards:purchase:${ip}`, limit: 5, windowMs: 60_000 });
  addRateLimitHeaders(headers, { limit: 5, remaining: rl.remaining, resetAt: rl.resetAt });
  if (!rl.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers });

  const stripe = getStripeClient();
  if (!stripe) return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501, headers });

  const body = await req.json().catch(() => null);
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });

  const { orgId, amountCents, purchaserEmail, purchaserName, recipientEmail, recipientName, personalMessage, deliveryDate, returnUrl } = parsed.data;

  const db = getDb();
  const org = await db.getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404, headers });
  if (!org.stripeAccountId) return NextResponse.json({ ok: false, error: 'stripe_not_connected' }, { status: 409, headers });

  let code = generateGiftCardCode();
  for (let i = 0; i < 5; i++) {
    if (!(await db.getGiftCardByCode(code))) break;
    code = generateGiftCardCode();
    if (i === 4) return NextResponse.json({ ok: false, error: 'code_generation_failed' }, { status: 500, headers });
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const card = await db.createGiftCard({
    orgId, code, initialAmountCents: amountCents, remainingAmountCents: amountCents,
    currency: 'usd', purchaserEmail, purchaserName, recipientEmail, recipientName,
    personalMessage, deliveryDate, expiresAt: expiresAt.toISOString(), status: 'active',
  });

  try {
    const session = await createGiftCardCheckoutSession({
      stripe, orgStripeAccountId: org.stripeAccountId, cardId: card.id,
      code: card.code, orgId, amountCents, returnUrl,
    });
    return NextResponse.json({ ok: true, clientSecret: session.client_secret, sessionId: session.id, giftCardId: card.id, code: card.code }, { status: 200, headers });
  } catch (err) {
    console.error('Stripe checkout creation error:', err);
    return NextResponse.json({ ok: false, error: 'stripe_error' }, { status: 500, headers });
  }
}

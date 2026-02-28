import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { z } from 'zod';

import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getStripeClient } from '@/lib/stripe/client';
import { getDb } from '@/lib/db';

const bodySchema = z.object({
  orgId: z.string().min(1),
  code: z.string().min(1).max(64),
});

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501, headers });
  }

  const { orgId } = parsed.data;
  const code = parsed.data.code.trim().toUpperCase().replace(/\s+/g, '');

  // Prefer org-scoped promos stored in our DB.
  const db = getDb();
  const org = await db.getOrg(orgId);
  const match = (org?.promotions ?? []).find((p) => p.enabled && p.code === code);
  if (match) {
    return NextResponse.json(
      { ok: true, promotionCodeId: match.stripePromotionCodeId, couponId: match.stripeCouponId },
      { status: 200, headers }
    );
  }

  // Fallback: legacy lookup in Stripe (not org-scoped).
  const res = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
  const promo = res.data[0];
  if (!promo) return NextResponse.json({ ok: false, error: 'promo_not_found' }, { status: 404, headers });

  const couponField = (promo as unknown as { coupon?: unknown }).coupon;
  const couponId = typeof couponField === 'object' && couponField !== null
    ? (couponField as { id: string }).id
    : typeof couponField === 'string' ? couponField : null;

  return NextResponse.json(
    { ok: true, promotionCodeId: promo.id, couponId },
    { status: 200, headers }
  );
}

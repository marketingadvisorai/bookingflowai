import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { z } from 'zod';

import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getDb } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe/client';

const bodySchema = z.object({
  orgId: z.string().min(1),
  holdId: z.string().min(1),
  code: z.string().min(1).max(64),
});

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;

  const stripe = getStripeClient();
  if (!stripe) return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501, headers });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { orgId, holdId, code } = parsed.data;
  const db = getDb();

  const org = await db.getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404, headers });

  const hold = await db.getHold(orgId, holdId);
  if (!hold) return NextResponse.json({ ok: false, error: 'hold_not_found' }, { status: 404, headers });

  if (hold.status !== 'active') {
    return NextResponse.json({ ok: false, error: 'hold_not_active', status: hold.status }, { status: 409, headers });
  }

  const subtotalCents = hold.subtotalCents ?? null;
  const feeCents = hold.processingFeeCents ?? 0;
  const currency = (hold.currency ?? 'usd').toLowerCase();

  if (subtotalCents == null || !Number.isFinite(subtotalCents)) {
    return NextResponse.json({ ok: false, error: 'missing_price' }, { status: 400, headers });
  }

  // Minimum subtotal default: the minimum price for 1 player.
  // Best-effort calculation based on the current hold.
  const minSubtotalCents = Math.max(1, Math.ceil(subtotalCents / Math.max(1, hold.players || 1)));
  if (subtotalCents < minSubtotalCents) {
    return NextResponse.json(
      { ok: false, error: 'promo_min_total_not_met', minSubtotalCents },
      { status: 409, headers }
    );
  }

  const normCode = code.trim().toUpperCase().replace(/\s+/g, '');

  // Prefer org-scoped promo mapping from DB.
  const match = (org.promotions ?? []).find((p) => p.enabled && p.code === normCode);
  const promoId = match?.stripePromotionCodeId ?? null;

  // Validate promo code via Stripe.
  const promo = promoId ? await stripe.promotionCodes.retrieve(promoId) : (await stripe.promotionCodes.list({ code: normCode, active: true, limit: 1 })).data[0];
  if (!promo) return NextResponse.json({ ok: false, error: 'promo_not_found' }, { status: 404, headers });

  // Stripe returns coupon as expanded object on PromotionCode
  const couponField = (promo as unknown as { coupon?: unknown }).coupon;
  const coupon = typeof couponField === 'object' && couponField !== null
    ? (couponField as { id: string; percent_off?: number | null; amount_off?: number | null; currency?: string | null })
    : typeof couponField === 'string'
      ? await stripe.coupons.retrieve(couponField)
      : null;
  if (!coupon) {
    return NextResponse.json({ ok: false, error: 'promo_invalid_coupon' }, { status: 409, headers });
  }

  // Compute discount against subtotal (recommended).
  let discountCents = 0;

  const percentOff = typeof coupon.percent_off === 'number' ? coupon.percent_off : null;
  const amountOff = typeof coupon.amount_off === 'number' ? coupon.amount_off : null;
  const couponCurrency = typeof coupon.currency === 'string' ? coupon.currency.toLowerCase() : null;

  if (percentOff != null) {
    discountCents = Math.round((subtotalCents * clampInt(percentOff, 0, 100)) / 100);
  } else if (amountOff != null) {
    if (couponCurrency && couponCurrency !== currency) {
      return NextResponse.json({ ok: false, error: 'promo_currency_mismatch', expectedCurrency: currency, couponCurrency }, { status: 409, headers });
    }
    discountCents = amountOff;
  } else {
    return NextResponse.json({ ok: false, error: 'promo_unsupported' }, { status: 409, headers });
  }

  discountCents = clampInt(discountCents, 0, subtotalCents);

  const discountedSubtotalCents = subtotalCents - discountCents;

  // Recompute processing fee (if fee is defined as bps of subtotal) when possible.
  // If we have bps, re-apply it to the discounted subtotal.
  const bps = typeof hold.processingFeeBps === 'number' ? hold.processingFeeBps : null;
  const processingFeeCents = bps != null ? Math.round((discountedSubtotalCents * bps) / 10_000) : feeCents;

  const totalCents = discountedSubtotalCents + processingFeeCents;

  const next = {
    ...(hold as unknown as Record<string, unknown>),
    promoCode: code,
    promoDiscountCents: discountCents,
    discountedSubtotalCents,
    processingFeeCents,
    totalCents,
    promoAppliedAt: new Date().toISOString(),
  };

  await db.putHold(orgId, next as typeof hold);

  return NextResponse.json(
    {
      ok: true,
      orgId,
      holdId,
      code,
      currency,
      subtotalCents,
      discountCents,
      discountedSubtotalCents,
      processingFeeCents,
      totalCents,
    },
    { status: 200, headers }
  );
}

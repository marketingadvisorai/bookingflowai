import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { z } from 'zod';

import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe/client';

const createSchema = z
  .object({
    code: z.string().min(1).max(32),
    type: z.enum(['percent', 'fixed']),
    percentOff: z.number().min(1).max(100).optional(),
    amountOffCents: z.number().int().min(1).max(1_000_000).optional(),
    currency: z.string().min(3).max(10).optional(),
  })
  .refine((v) => (v.type === 'percent' ? typeof v.percentOff === 'number' : typeof v.amountOffCents === 'number'), {
    message: 'Missing discount value',
  });

function normCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  return NextResponse.json({ ok: true, promotions: org?.promotions ?? [] });
}

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const stripe = getStripeClient();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  const code = normCode(parsed.data.code);
  const existing = (org.promotions ?? []).find((p) => p.code === code);
  if (existing) return NextResponse.json({ ok: false, error: 'promo_exists' }, { status: 409 });

  const currency = (parsed.data.currency ?? 'usd').toLowerCase();

  // Create Stripe coupon + promotion code (fallback to DB-only if Stripe fails)
  let stripeCouponId: string | null = null;
  let stripePromotionCodeId: string | null = null;

  if (stripe) try {
    const coupon = await stripe.coupons.create({
      percent_off: parsed.data.type === 'percent' ? parsed.data.percentOff : undefined,
      amount_off: parsed.data.type === 'fixed' ? parsed.data.amountOffCents : undefined,
      currency: parsed.data.type === 'fixed' ? currency : undefined,
      duration: 'once',
      metadata: { orgId: sess.orgId, code },
    });

    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      active: true,
      metadata: { orgId: sess.orgId, code },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    stripeCouponId = coupon.id;
    stripePromotionCodeId = promo.id;
  } catch (err) {
    console.error('[promotions] Stripe error:', err);
    // Continue without Stripe — promo will be DB-only
  }

  const next = {
    ...(org as unknown as Record<string, unknown>),
    promotions: [
      ...(org.promotions ?? []),
      {
        code,
        type: parsed.data.type,
        percentOff: parsed.data.type === 'percent' ? parsed.data.percentOff : undefined,
        amountOffCents: parsed.data.type === 'fixed' ? parsed.data.amountOffCents : undefined,
        currency,
        stripeCouponId,
        stripePromotionCodeId,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  await db.putOrg(next as typeof org);

  return NextResponse.json({ ok: true, code, stripePromotionCodeId, stripeCouponId });
}

const toggleSchema = z.object({ code: z.string().min(1).max(32), enabled: z.boolean() });

export async function PATCH(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  const code = normCode(parsed.data.code);
  const promotions = (org.promotions ?? []).map((p) => (p.code === code ? { ...p, enabled: parsed.data.enabled } : p));

  await db.putOrg({ ...(org as unknown as Record<string, unknown>), promotions } as typeof org);
  return NextResponse.json({ ok: true });
}

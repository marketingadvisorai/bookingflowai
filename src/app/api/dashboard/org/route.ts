import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

const updateSchema = z.object({
  feeLabel: z.string().min(1).max(64).optional(),
  serviceFeePercent: z.number().min(0).max(20).optional(), // customer-facing fee percent
  paymentMode: z.enum(['full', 'deposit']).optional(),
  depositPercent: z.number().int().min(1).max(100).optional(),
});

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    org: {
      orgId: org.orgId,
      name: org.name,
      timezone: org.timezone,
      feeLabel: org.feeLabel ?? 'Processing Fee',
      serviceFeeBps: org.serviceFeeBps ?? 0,
      paymentMode: org.paymentMode ?? 'full',
      depositPercent: org.depositPercent ?? 50,
    },
  });
}

export async function PUT(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  const next = { ...org };

  if (typeof parsed.data.feeLabel === 'string') next.feeLabel = parsed.data.feeLabel;
  if (typeof parsed.data.serviceFeePercent === 'number') next.serviceFeeBps = Math.round(parsed.data.serviceFeePercent * 100);

  if (parsed.data.paymentMode) {
    next.paymentMode = parsed.data.paymentMode;
    if (parsed.data.paymentMode === 'deposit') {
      next.depositPercent = typeof parsed.data.depositPercent === 'number' ? parsed.data.depositPercent : next.depositPercent ?? 50;
    }
  }

  await db.putOrg(next);

  return NextResponse.json({ ok: true });
}

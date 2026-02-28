import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { z } from 'zod';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';
import { generateGiftCardCode } from '@/lib/gift-card-utils';

const createSchema = z.object({
  amountCents: z.number().int().min(100).max(100_000),
  currency: z.string().min(3).max(10).default('usd'),
  recipientName: z.string().max(100).optional(),
  recipientEmail: z.string().email().max(255).optional(),
});

export async function GET(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const url = new URL(req.url);
  const cardId = url.searchParams.get('cardId');

  // If cardId provided, return transactions for that card
  if (cardId) {
    try {
      const transactions = await db.listGiftCardTransactions(cardId);
      return NextResponse.json({ ok: true, transactions });
    } catch {
      return NextResponse.json({ ok: true, transactions: [] });
    }
  }

  try {
    const giftCards = await db.listGiftCardsByOrg(sess.orgId);
    return NextResponse.json({ ok: true, giftCards });
  } catch {
    return NextResponse.json({ ok: true, giftCards: [] });
  }
}

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const { amountCents, currency, recipientName, recipientEmail } = parsed.data;

  // Generate unique code
  let code = generateGiftCardCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.getGiftCardByCode(code);
    if (!existing) break;
    code = generateGiftCardCode();
    attempts++;
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const card = await db.createGiftCard({
    orgId: sess.orgId,
    code,
    initialAmountCents: amountCents,
    remainingAmountCents: amountCents,
    currency: currency || 'usd',
    status: 'active',
    recipientName,
    recipientEmail,
    expiresAt: expiresAt.toISOString(),
  });

  return NextResponse.json({ ok: true, giftCard: card });
}

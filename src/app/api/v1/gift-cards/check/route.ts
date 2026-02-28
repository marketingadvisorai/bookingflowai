import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { normalizeGiftCardCode, validateGiftCardCode } from '@/lib/gift-card-utils';

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  
  const headers = new Headers();
  Object.entries(cors.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const orgId = url.searchParams.get('orgId');

  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'missing_code', message: 'Gift card code is required' },
      { status: 400, headers }
    );
  }

  if (!validateGiftCardCode(code)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_code', message: 'Invalid gift card code format' },
      { status: 400, headers }
    );
  }

  const db = getDb();
  const normalized = normalizeGiftCardCode(code);
  const card = await db.getGiftCardByCode(normalized);

  if (!card) {
    return NextResponse.json(
      { ok: false, error: 'not_found', message: 'Gift card not found' },
      { status: 404, headers }
    );
  }

  // If orgId provided, validate gift card belongs to this org
  if (orgId && card.orgId !== orgId) {
    return NextResponse.json(
      { ok: false, error: 'wrong_org', message: 'This gift card is not valid for this venue' },
      { status: 400, headers }
    );
  }

  // Check expiration
  const now = new Date();
  const isExpired = card.expiresAt ? new Date(card.expiresAt) < now : false;

  return NextResponse.json({
    ok: true,
    giftCard: {
      code: card.code,
      orgId: card.orgId,
      remainingAmountCents: card.remainingAmountCents,
      initialAmountCents: card.initialAmountCents,
      currency: card.currency,
      status: isExpired ? 'expired' : card.status,
      expiresAt: card.expiresAt,
    },
  }, { status: 200, headers });
}

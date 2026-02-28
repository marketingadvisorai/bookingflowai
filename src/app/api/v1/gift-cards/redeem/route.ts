import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { normalizeGiftCardCode, validateGiftCardCode } from '@/lib/gift-card-utils';

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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { ok: false, error: 'invalid_request' },
      { status: 400, headers }
    );
  }

  const { code, bookingId, amountCents } = body;

  // Validate inputs
  if (!code || !bookingId || typeof amountCents !== 'number') {
    return NextResponse.json(
      { ok: false, error: 'missing_fields', message: 'code, bookingId, and amountCents are required' },
      { status: 400, headers }
    );
  }

  if (!validateGiftCardCode(code)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_code', message: 'Invalid gift card code format' },
      { status: 400, headers }
    );
  }

  if (amountCents <= 0) {
    return NextResponse.json(
      { ok: false, error: 'invalid_amount', message: 'Amount must be greater than 0' },
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

  // Check card status
  if (card.status !== 'active') {
    return NextResponse.json(
      { ok: false, error: 'card_not_active', message: `Gift card is ${card.status}` },
      { status: 409, headers }
    );
  }

  // Check expiration
  if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
    return NextResponse.json(
      { ok: false, error: 'card_expired', message: 'Gift card has expired' },
      { status: 409, headers }
    );
  }

  // Check balance
  if (card.remainingAmountCents < amountCents) {
    return NextResponse.json(
      {
        ok: false,
        error: 'insufficient_balance',
        message: 'Insufficient gift card balance',
        remainingAmountCents: card.remainingAmountCents,
      },
      { status: 409, headers }
    );
  }

  try {
    const result = await db.redeemGiftCard(card.id, amountCents, bookingId);
    
    return NextResponse.json({
      ok: true,
      redemption: {
        amountCents,
        newBalance: result.newBalance,
        cardCode: card.code,
      },
    }, { status: 200, headers });
  } catch (err) {
    console.error('Gift card redemption error:', err);
    return NextResponse.json(
      { ok: false, error: 'redemption_failed', message: 'Failed to redeem gift card' },
      { status: 500, headers }
    );
  }
}

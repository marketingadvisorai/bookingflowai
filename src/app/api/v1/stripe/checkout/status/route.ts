import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { explainError } from '@/lib/error-explainer';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ ok: false, error: 'session_not_found', message: await explainError('session_not_found') }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: 'stripe_not_configured', message: await explainError('stripe_not_configured') }, { status: 501 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const md = session.metadata ?? {};

    return NextResponse.json({
      ok: true,
      data: {
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email ?? null,
        customerName: session.customer_details?.name ?? null,
        holdId: md.holdId ?? null,
        orgId: md.orgId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'session_not_found', message: await explainError('session_not_found') }, { status: 404 });
  }
}

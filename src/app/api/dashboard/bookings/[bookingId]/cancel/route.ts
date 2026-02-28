import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe/client';

export async function POST(_req: Request, ctx: { params: Promise<{ bookingId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { bookingId } = await ctx.params;
  const db = getDb();

  const booking = await db.getBooking(sess.orgId, bookingId);
  if (!booking) return NextResponse.json({ ok: false, error: 'booking_not_found' }, { status: 404 });

  if (booking.status === 'canceled') return NextResponse.json({ ok: true, status: 'canceled' });

  // Attempt Stripe refund if payment was made
  let refunded = false;
  const paymentIntentId =
    (booking as Record<string, unknown>).stripePaymentIntentId as string | undefined;

  if (paymentIntentId) {
    const stripe = getStripeClient();
    if (stripe) {
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
        refunded = true;
      } catch (err) {
        // Log but don't block cancellation — refund can be retried manually
        console.error('[cancel] Stripe refund failed:', err instanceof Error ? err.message : err);
      }
    }
  }

  booking.status = 'canceled';
  (booking as Record<string, unknown>).canceledAt = new Date().toISOString();
  if (refunded) {
    (booking as Record<string, unknown>).refundStatus = 'refunded';
  }
  await db.putBooking(sess.orgId, booking);

  return NextResponse.json({ ok: true, status: 'canceled', refunded });
}

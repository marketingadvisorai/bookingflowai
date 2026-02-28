import { getDb } from '@/lib/db';
import { sendBookingConfirmation } from '@/lib/email/send';

function nowIso() {
  return new Date().toISOString();
}

function bookingIdFromHold(holdId: string) {
  return `booking_${holdId}`;
}

export async function confirmHoldToBooking({
  orgId,
  holdId,
  promoCode,
  payment,
}: {
  orgId: string;
  holdId: string;
  promoCode?: string;
  payment?: {
    paymentStatus: 'deposit_paid' | 'paid_full' | 'unpaid';
    paidCents: number;
    remainingCents: number;
    paidAt: string;
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    paymentMode?: 'full' | 'deposit';
    depositPercent?: number;
  };
}) {
  const db = getDb();
  const hold = await db.getHold(orgId, holdId);
  if (!hold) return { ok: false as const, error: 'hold_not_found' };

  if (hold.status === 'confirmed' && hold.bookingId) {
    const booking = await db.getBooking?.(orgId, hold.bookingId).catch(() => null);
    return { ok: true as const, bookingId: hold.bookingId, booking: booking ?? null, idempotent: true };
  }

  // When payment was already collected (webhook path), force-confirm even if hold expired.
  const paidViaStripe = !!payment?.stripeCheckoutSessionId;

  if (hold.status === 'active' && new Date(hold.expiresAt).getTime() <= Date.now()) {
    if (!paidViaStripe) {
      hold.status = 'expired';
    }
    // If paid via Stripe, keep status as 'active' so we can confirm below.
  }

  if (hold.status !== 'active') {
    if (!paidViaStripe) {
      return { ok: false as const, error: 'hold_not_active', status: hold.status };
    }
    // Paid holds that were marked expired/canceled — force reactivate for confirmation.
    hold.status = 'active';
  }

  const bookingId = bookingIdFromHold(hold.holdId);
  const createdAt = nowIso();

  const booking = {
    orgId,
    bookingId,
    holdId: hold.holdId,
    gameId: hold.gameId,
    roomId: hold.roomId,
    bookingType: hold.bookingType,
    startAt: hold.startAt,
    endAt: hold.endAt,
    players: hold.players,
    status: 'confirmed' as const,
    createdAt,
    customer: hold.customer,

    currency: hold.currency,
    subtotalCents: hold.subtotalCents,
    processingFeeCents: hold.processingFeeCents,
    totalCents: hold.totalCents,
    processingFeeBps: hold.processingFeeBps,
    processingFeeLabel: hold.processingFeeLabel,

    promoCode: promoCode || undefined,

    ...(payment
      ? {
          paymentStatus: payment.paymentStatus,
          paidCents: payment.paidCents,
          remainingCents: payment.remainingCents,
          paidAt: payment.paidAt,
          stripeCheckoutSessionId: payment.stripeCheckoutSessionId,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          paymentMode: payment.paymentMode,
          depositPercent: payment.depositPercent,
        }
      : null),
  };

  try {
    await db.putBooking(orgId, booking);
  } catch (err) {
    const name = err instanceof Error ? err.name : '';
    if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
      hold.status = 'confirmed';
      hold.bookingId = bookingId;
      hold.confirmedAt = hold.confirmedAt ?? createdAt;
      await db.putHold(orgId, hold);
      return { ok: true as const, bookingId, booking, idempotent: true };
    }
    throw err;
  }

  hold.status = 'confirmed';
  hold.bookingId = bookingId;
  hold.confirmedAt = createdAt;
  await db.putHold(orgId, hold);

  // Send confirmation email (non-blocking)
  if (hold.customer?.email) {
    const org = await db.getOrg(orgId).catch(() => null);
    const game = hold.gameId ? await db.getGame(orgId, hold.gameId).catch(() => null) : null;
    const start = new Date(hold.startAt);
    sendBookingConfirmation({
      customerName: hold.customer.name || 'Guest',
      customerEmail: hold.customer.email,
      gameName: game?.name || 'Your Experience',
      date: start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      players: hold.players ?? 1,
      confirmationId: bookingId,
      venueName: org?.name || 'the venue',
      venueAddress: org?.address,
      totalFormatted: booking.totalCents ? `$${(booking.totalCents / 100).toFixed(2)}` : undefined,
    });
  }

  return { ok: true as const, bookingId, booking, idempotent: false };
}

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import Stripe from 'stripe';

import { getStripeClient } from '@/lib/stripe/client';
import { getDb } from '@/lib/db';
import { confirmHoldToBooking } from '@/lib/booking/confirm-hold';
import { calcDepositCents } from '@/lib/stripe/money';
import { claimStripeEvent, releaseStripeEvent } from '@/lib/stripe/idempotency';

function nowIso() {
  return new Date().toISOString();
}

export async function POST(req: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
  }

  // Idempotency: Stripe may retry the same event.
  const claimed = await claimStripeEvent(event.id);
  if (!claimed) {
    return NextResponse.json({ ok: true, received: true, type: event.type, idempotent: true });
  }

  // Thin payload: verify signature, then fetch the canonical object from Stripe.
  try {
    if (event.type === 'account.updated' || event.type === 'account.application.deauthorized') {
      const obj = event.data.object as Stripe.Account;
      const accountId = obj.id;

      const acct = await stripe.accounts.retrieve(accountId);

      const orgId =
        typeof acct === 'object' && 'metadata' in acct && (acct.metadata as Record<string, string> | null)?.orgId
          ? String((acct.metadata as Record<string, string>).orgId)
          : null;

      if (orgId) {
        const db = getDb();
        const org = await db.getOrg(orgId);
        if (org) {
          const next = {
            ...(org as unknown as Record<string, unknown>),
            stripeAccountId: accountId,
            stripeChargesEnabled: Boolean((acct as Stripe.Account).charges_enabled),
            stripePayoutsEnabled: Boolean((acct as Stripe.Account).payouts_enabled),
            stripeRequirements:
              typeof (acct as Stripe.Account).requirements === 'object' && (acct as Stripe.Account).requirements
                ? {
                    currentlyDue: (acct as Stripe.Account).requirements?.currently_due ?? [],
                    eventuallyDue: (acct as Stripe.Account).requirements?.eventually_due ?? [],
                    pastDue: (acct as Stripe.Account).requirements?.past_due ?? [],
                  }
                : undefined,
            stripeUpdatedAt: nowIso(),
          };

          await db.putOrg(next as unknown as typeof org);
        }
      }

      return NextResponse.json({ ok: true, received: true, type: event.type });
    }

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const obj = event.data.object as Stripe.Checkout.Session;
      const sessionId = obj.id;

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      const md = (session.metadata ?? {}) as Record<string, string>;
      const orgId = md.orgId;

      // --- Gift card purchase handling ---
      if (md.type === 'gift_card_purchase' && md.giftCardId) {
        if (event.type === 'checkout.session.async_payment_failed') {
          // Mark gift card as cancelled on payment failure.
          try {
            const db = getDb();
            await db.updateGiftCardStatus(md.giftCardId, 'cancelled');
          } catch { /* best effort */ }
          return NextResponse.json({ ok: true, received: true, type: event.type, giftCard: 'cancelled' });
        }
        if (session.payment_status === 'paid') {
          try {
            const db = getDb();
            const piId = typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent && typeof session.payment_intent === 'object' && 'id' in session.payment_intent
                ? String((session.payment_intent as Stripe.PaymentIntent).id)
                : undefined;
            // Update gift card with payment intent ID — confirms payment completed.
            if (piId) {
              const { createDrizzle } = await import('@/lib/db/postgres/client');
              const drizzle = createDrizzle();
              const { sql } = await import('drizzle-orm');
              await drizzle.execute(
                sql`UPDATE gift_cards SET stripe_payment_intent_id = ${piId}, updated_at = ${nowIso()} WHERE id = ${md.giftCardId}`
              );
            }
            console.log(`[stripe/webhook] Gift card payment confirmed: ${md.giftCardId}`);
          } catch (e) {
            console.error('[stripe/webhook] Gift card update error:', e instanceof Error ? e.message : e);
          }
        }
        return NextResponse.json({ ok: true, received: true, type: event.type, giftCard: 'processed' });
      }

      const holdId = md.holdId;
      const paymentMode = md.paymentMode === 'deposit' ? 'deposit' : 'full';
      const depositPercent = Number(md.depositPercent ?? '50');

      if (!orgId || !holdId) {
        return NextResponse.json({ ok: true, received: true, type: event.type, ignored: 'missing_metadata' });
      }

      // Only confirm on success.
      if (event.type === 'checkout.session.async_payment_failed') {
        return NextResponse.json({ ok: true, received: true, type: event.type, ignored: 'payment_failed' });
      }

      // Basic paid check.
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ ok: true, received: true, type: event.type, ignored: 'not_paid' });
      }

      const db = getDb();
      const [org, hold] = await Promise.all([db.getOrg(orgId), db.getHold(orgId, holdId)]);
      if (!org) {
        console.error(`[stripe/webhook] Org not found: orgId=${orgId}, sessionId=${sessionId}, holdId=${holdId}`);
        return NextResponse.json({ ok: true, received: true, type: event.type, ignored: 'missing_org' });
      }
      if (!hold) {
        // FALLBACK: Hold expired/deleted by DynamoDB TTL but payment succeeded.
        // Create booking directly from Stripe session metadata.
        console.error(`[stripe/webhook] Hold not found but payment succeeded — creating booking from metadata. orgId=${orgId}, holdId=${holdId}, sessionId=${sessionId}`);
        const gameId = md.gameId;
        const roomId = md.roomId;
        const startAt = md.startAt;
        const endAt = md.endAt;
        const players = Number(md.players || '1');
        const bookingType = (md.bookingType || 'private') as 'private' | 'public';
        const customerName = md.customerName || '';
        const customerEmail = md.customerEmail || '';
        const customerPhone = md.customerPhone || '';

        if (!gameId || !roomId || !startAt || !endAt) {
          console.error(`[stripe/webhook] Cannot create fallback booking — missing metadata fields. sessionId=${sessionId}`);
          return NextResponse.json({ ok: false, error: 'missing_metadata_for_fallback', type: event.type }, { status: 500 });
        }

        const bookingId = `booking_${holdId}`;
        const paidAt = nowIso();
        const totalCents = typeof session.amount_total === 'number' ? session.amount_total : 0;
        const currency = (session.currency ?? 'usd').toLowerCase();

        const fallbackBooking = {
          orgId,
          bookingId,
          holdId,
          gameId,
          roomId,
          bookingType,
          startAt,
          endAt,
          players,
          status: 'confirmed' as const,
          createdAt: paidAt,
          customer: { name: customerName, email: customerEmail, phone: customerPhone },
          currency,
          subtotalCents: totalCents,
          processingFeeCents: 0,
          totalCents,
          paymentStatus: (paymentMode === 'deposit' ? 'deposit_paid' : 'paid_full') as 'deposit_paid' | 'paid_full',
          paidCents: totalCents,
          remainingCents: 0,
          paidAt,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent && typeof session.payment_intent === 'object' && 'id' in session.payment_intent
                ? String((session.payment_intent as Stripe.PaymentIntent).id)
                : undefined,
          paymentMode: paymentMode as 'full' | 'deposit',
        };

        try {
          await db.putBooking(orgId, fallbackBooking as any);
          console.error(`[stripe/webhook] Fallback booking created: ${bookingId}`);
          return NextResponse.json({ ok: true, received: true, type: event.type, confirmed: true, fallback: true });
        } catch (fallbackErr) {
          console.error(`[stripe/webhook] Fallback booking creation failed:`, fallbackErr);
          return NextResponse.json({ ok: false, error: 'fallback_booking_failed', type: event.type }, { status: 500 });
        }
      }

      const totalCents = hold.totalCents ?? hold.subtotalCents ?? null;
      const currency = (hold.currency ?? 'usd').toLowerCase();
      if (totalCents == null) {
        return NextResponse.json({ ok: true, received: true, type: event.type, ignored: 'missing_price' });
      }

      const expectedCents =
        paymentMode === 'deposit' ? calcDepositCents(totalCents, Number.isFinite(depositPercent) ? depositPercent : 50) : totalCents;

      const stripeAmount = typeof session.amount_total === 'number' ? session.amount_total : null;
      const stripeCurrency = (session.currency ?? '').toLowerCase();
      if (stripeAmount !== expectedCents || stripeCurrency !== currency) {
        return NextResponse.json({
          ok: true,
          received: true,
          type: event.type,
          ignored: 'amount_mismatch',
          expectedCents,
          stripeAmount,
          expectedCurrency: currency,
          stripeCurrency,
        });
      }

      const paidAt = nowIso();
      const paidCents = expectedCents;
      const remainingCents = Math.max(0, totalCents - paidCents);

      await confirmHoldToBooking({
        orgId,
        holdId,
        promoCode: (hold as unknown as { promoCode?: string }).promoCode,
        payment: {
          paymentStatus: paymentMode === 'deposit' ? 'deposit_paid' : 'paid_full',
          paidCents,
          remainingCents,
          paidAt,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent && typeof session.payment_intent === 'object' && 'id' in session.payment_intent
                ? String((session.payment_intent as Stripe.PaymentIntent).id)
                : undefined,
          paymentMode,
          depositPercent: paymentMode === 'deposit' ? depositPercent : undefined,
        },
      });

      return NextResponse.json({ ok: true, received: true, type: event.type, confirmed: true });
    }
  } catch (err) {
    console.error('[stripe/webhook] Error processing event:', event.type, event.id, err instanceof Error ? err.stack : err);
    // Return 500 so Stripe retries (up to 3 days). The idempotency guard (claimStripeEvent)
    // will prevent duplicate processing on retry — delete the claim so retry can proceed.
    try {
      await releaseStripeEvent(event.id);
    } catch { /* best effort */ }
    return NextResponse.json({ ok: false, error: 'processing_error', type: event.type }, { status: 500 });
  }

  return NextResponse.json({ ok: true, received: true, type: event.type });
}

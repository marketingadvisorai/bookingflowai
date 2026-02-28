import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import { explainError } from '@/lib/error-explainer';
import { getDb } from '@/lib/db';

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
    const orgId = md.orgId ?? null;
    const holdId = md.holdId ?? null;

    // Fetch hold + game details for richer confirmation page
    let gameName: string | null = null;
    let startAt: string | null = null;
    let endAt: string | null = null;
    let players: number | null = null;
    let venueName: string | null = null;
    let timezone: string | null = null;
    let bookingId: string | null = null;

    if (orgId && holdId) {
      const db = getDb();
      try {
        const [hold, org] = await Promise.all([
          db.getHold(orgId, holdId),
          db.getOrg(orgId),
        ]);
        if (hold) {
          startAt = hold.startAt;
          endAt = hold.endAt;
          players = hold.players;
          bookingId = hold.bookingId ?? null;
          // Fetch game name
          const games = await db.listGames(orgId);
          const game = games.find((g) => g.gameId === hold.gameId);
          if (game) gameName = game.name;
        }
        if (org) {
          venueName = org.name;
          timezone = org.timezone;
        }
      } catch {
        // Non-critical: confirmation still works without enrichment
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email ?? null,
        customerName: session.customer_details?.name ?? null,
        holdId,
        orgId,
        gameName,
        venueName,
        timezone,
        startAt,
        endAt,
        players,
        bookingId,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'session_not_found', message: await explainError('session_not_found') }, { status: 404 });
  }
}

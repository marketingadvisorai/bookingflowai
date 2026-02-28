import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getStripeClient } from '@/lib/stripe/client';
import { getDb } from '@/lib/db';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';

const querySchema = z.object({
  orgId: z.string().min(1),
});

export async function GET() {
  // orgId comes from session, not query params — prevents IDOR.
  const session = await requireDashboardSession({ nextPath: '/dashboard/settings/payments' });

  const { orgId } = session;
  const db = getDb();
  const org = await db.getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  const stripeAccountId = org.stripeAccountId ?? null;
  if (!stripeAccountId) {
    return NextResponse.json({ ok: true, connected: false, stripeAccountId: null });
  }

  const stripe = getStripeClient();
  if (!stripe) return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501 });

  const acct = await stripe.accounts.retrieve(stripeAccountId);
  const chargesEnabled = typeof acct === 'object' && 'charges_enabled' in acct ? Boolean(acct.charges_enabled) : false;
  const payoutsEnabled = typeof acct === 'object' && 'payouts_enabled' in acct ? Boolean(acct.payouts_enabled) : false;

  return NextResponse.json({
    ok: true,
    connected: Boolean(chargesEnabled),
    stripeAccountId,
    chargesEnabled,
    payoutsEnabled,
  });
}

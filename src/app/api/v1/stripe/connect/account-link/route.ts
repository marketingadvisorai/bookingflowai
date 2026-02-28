import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getStripeClient } from '@/lib/stripe/client';
import { getDb } from '@/lib/db';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';

const bodySchema = z.object({
  orgId: z.string().min(1),
});

export async function POST() {
  // Owner-only: require dashboard session — orgId comes from session, not request body.
  const session = await requireDashboardSession({ nextPath: '/dashboard/settings/payments' });

  const stripe = getStripeClient();
  if (!stripe) return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 501 });

  const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL;
  const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL;
  if (!returnUrl || !refreshUrl) {
    return NextResponse.json({ ok: false, error: 'connect_urls_not_configured' }, { status: 500 });
  }

  const { orgId } = session;
  const db = getDb();

  // For MVP we create a fresh Express account when none exists.
  const org = await db.getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  let acct = org.stripeAccountId;
  if (!acct) {
    const created = await stripe.accounts.create({
      type: 'express',
      metadata: { orgId },
    });
    acct = created.id;

    await db.putOrg({ ...(org as unknown as Record<string, unknown>), stripeAccountId: acct } as typeof org);
  }

  const link = await stripe.accountLinks.create({
    account: acct,
    type: 'account_onboarding',
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });

  return NextResponse.json({ ok: true, url: link.url, stripeAccountId: acct });
}

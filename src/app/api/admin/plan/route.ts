import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

function isAdmin(email: string): boolean {
  const adminEmail = process.env.BF_ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function PATCH(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { orgId, plan } = body as { orgId: string; plan: string };
  const validPlans = ['free', 'pro', 'business', 'enterprise'];
  if (!orgId || !validPlans.includes(plan)) {
    return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 });
  }

  const org = await db.getOrg(orgId);
  if (!org) {
    return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });
  }

  await db.putOrg({ ...org, plan });
  return NextResponse.json({ ok: true, orgId, plan });
}

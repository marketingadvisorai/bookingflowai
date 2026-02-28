import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { checkCsrf } from '@/lib/http/csrf';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

function nowIso() {
  return new Date().toISOString();
}

export async function POST(req: Request) {
  const csrf = checkCsrf(req);
  if (csrf) return csrf;

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `auth:signup:${ip}`, limit: 10, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password.trim();
  const firstName = parsed.data.firstName?.trim() ?? '';
  const lastName = parsed.data.lastName?.trim() ?? '';

  const db = getDb();
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ ok: false, error: 'email_in_use' }, { status: 409 });
  }

  const userId = `user_${createId()}`;

  const tenantMode = (process.env.BF_TENANT_MODE ?? 'multi').toLowerCase();
  const orgId = tenantMode === 'multi' ? `org_${createId()}` : 'org_demo';

  const passwordHash = await bcrypt.hash(password, 12);

  // In demo mode, ensure org_demo exists (but do NOT overwrite seeded demo data).
  // In multi mode, create a new org for this owner.
  const defaultOrgName = firstName ? `${firstName}'s Venue` : 'My Business';
  const existingOrg = await db.getOrg(orgId);
  if (!existingOrg) {
    await db.putOrg({ orgId, name: tenantMode === 'multi' ? defaultOrgName : 'Demo Escape', timezone: 'America/New_York' });
  }

  const user = {
    userId,
    orgId,
    email,
    passwordHash,
    role: 'owner' as const,
    createdAt: nowIso(),
    authProvider: 'password' as const,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  };

  await db.putUser(user);

  const sessionToken = `sess_${createId()}`;
  const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
  await db.putSession({ sessionToken, userId, orgId, createdAt: nowIso(), expiresAt });

  const res = NextResponse.json({ ok: true, user: { userId, orgId, email, role: user.role } });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  });
  return res;
}

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
  password: z.string().min(1).max(100),
});

function nowIso() {
  return new Date().toISOString();
}

export async function POST(req: Request) {
  const csrf = checkCsrf(req);
  if (csrf) return csrf;

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `auth:login:${ip}`, limit: 20, windowMs: 15 * 60_000 });
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

  const db = getDb();
  const user = await db.getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ ok: false, error: 'use_google_login' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }

  // Update login tracking
  const updatedUser = {
    ...user,
    lastLoginAt: nowIso(),
    loginCount: (user.loginCount ?? 0) + 1,
  };
  await db.putUser(updatedUser);

  const sessionToken = `sess_${createId()}`;
  const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
  await db.putSession({ sessionToken, userId: user.userId, orgId: user.orgId, createdAt: nowIso(), expiresAt });

  const res = NextResponse.json({ ok: true, user: { userId: user.userId, orgId: user.orgId, email: user.email, role: user.role } });
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

import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { requireSession } from '@/lib/auth/require-session';
import { checkCsrf } from '@/lib/http/csrf';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user) {
    // If the user was deleted, treat the session as invalid.
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: { userId: user.userId, orgId: user.orgId, email: user.email, role: user.role } });
}

const putSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(100).optional(),
});

export async function PUT(req: Request) {
  const csrf = checkCsrf(req);
  if (csrf) return csrf;

  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `auth:me:put:${sess.userId}:${ip}`, limit: 20, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const { firstName, lastName, phone, currentPassword, newPassword } = parsed.data;

  // Handle password change
  if (newPassword) {
    if (user.authProvider === 'google') {
      return NextResponse.json({ ok: false, error: 'Google accounts cannot change password' }, { status: 400 });
    }
    if (!currentPassword) {
      return NextResponse.json({ ok: false, error: 'Current password is required' }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Current password is incorrect' }, { status: 403 });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  // Handle profile updates
  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (phone !== undefined) user.phone = phone.trim() || undefined;

  await db.putUser(user);

  return NextResponse.json({
    ok: true,
    user: { userId: user.userId, orgId: user.orgId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
  });
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/session';

function clearSessionCookie(res: NextResponse) {
  // name+path identify the cookie; other attributes are not required to clear,
  // but setting them avoids surprises across environments.
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function unauthenticated() {
  const res = NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  clearSessionCookie(res);
  return res;
}

function isExpired(expiresAt: string) {
  const ts = Date.parse(expiresAt);
  if (!Number.isFinite(ts)) return true;
  return ts <= Date.now();
}

export async function requireSession(): Promise<{ userId: string; orgId: string } | NextResponse> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) return unauthenticated();

  const db = getDb();
  const ses = await db.getSession(token);
  if (!ses) return unauthenticated();

  if (isExpired(ses.expiresAt)) {
    // Best-effort cleanup (don't leak whether token existed).
    await db.deleteSession(token).catch(() => null);
    return unauthenticated();
  }

  return { userId: ses.userId, orgId: ses.orgId };
}

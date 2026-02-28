import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (token) {
    const db = getDb();
    await db.deleteSession(token).catch(() => null);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

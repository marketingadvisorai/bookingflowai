import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';

export const SESSION_COOKIE = 'bf_session';
export const SESSION_MAX_AGE_MS = 30 * 60_000; // 30 minutes

function isExpired(expiresAt: string) {
  const ts = Date.parse(expiresAt);
  if (!Number.isFinite(ts)) return true;
  return ts <= Date.now();
}

export async function getSessionFromCookies() {
  // Primary: normal cookie access.
  let token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;

  // Fallback: middleware copies cookie -> request header for SSR environments
  // that don't reliably forward Cookie headers.
  if (!token) {
    const { headers } = await import('next/headers');
    token = (await headers()).get('x-bf-session');
  }

  if (!token) return null;

  const db = getDb();
  const ses = await db.getSession(token);
  if (!ses) return null;

  if (isExpired(ses.expiresAt)) {
    await db.deleteSession(token).catch(() => null);
    return null;
  }

  // Sliding window: extend session by 30 minutes on every access
  const newExpiry = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();
  await db.putSession({ ...ses, expiresAt: newExpiry }).catch(() => null);

  return { ...ses, expiresAt: newExpiry };
}

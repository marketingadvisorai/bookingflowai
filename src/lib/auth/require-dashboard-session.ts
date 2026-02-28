import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

/**
 * Validate the dashboard session by reading the cookie directly and looking up
 * the session in database. No HTTP self-call needed.
 */
export async function requireDashboardSession(opts?: { nextPath?: string }): Promise<{ orgId: string; userId: string }> {
  const h = await headers();
  const headerToken = h.get('x-bf-session');
  const cookieToken = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const token = headerToken ?? cookieToken;

  if (!token) {
    const next = opts?.nextPath ? `?next=${encodeURIComponent(opts.nextPath)}` : '';
    redirect(`/login${next}`);
  }

  const db = getDb();
  const session = await db.getSession(token);

  if (!session) {
    const next = opts?.nextPath ? `?next=${encodeURIComponent(opts.nextPath)}` : '';
    redirect(`/login${next}`);
  }

  // getSession already checks expiry in the dynamo implementation,
  // but double-check for memory DB.
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.deleteSession(token).catch(() => null);
    const next = opts?.nextPath ? `?next=${encodeURIComponent(opts.nextPath)}` : '';
    redirect(`/login${next}`);
  }

  return { orgId: session.orgId, userId: session.userId };
}

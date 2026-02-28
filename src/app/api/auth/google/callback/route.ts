import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

import { getDb } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/session';

const STATE_COOKIE = 'bf_google_oauth_state';
const NEXT_COOKIE = 'bf_google_oauth_next';

function nowIso() {
  return new Date().toISOString();
}

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const schema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const baseUrl = getRequiredEnv('BF_PUBLIC_BASE_URL');

  const parsed = schema.safeParse({
    code: url.searchParams.get('code'),
    state: url.searchParams.get('state'),
  });
  if (!parsed.success) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_invalid', baseUrl).toString());
  }

  const cookies = req.headers.get('cookie') ?? '';
  const stateCookie = cookies
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${STATE_COOKIE}=`));
  const expectedState = stateCookie ? decodeURIComponent(stateCookie.split('=')[1] ?? '') : null;

  if (!expectedState || expectedState !== parsed.data.state) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_state', baseUrl).toString());
  }

  const clientId = getRequiredEnv('BF_GOOGLE_CLIENT_ID');
  const clientSecret = getRequiredEnv('BF_GOOGLE_CLIENT_SECRET');

  const redirectUri = new URL('/api/auth/google/callback', baseUrl).toString();

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: parsed.data.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  const tokenBody = (await tokenRes.json().catch(() => null)) as unknown;
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_token', baseUrl).toString());
  }

  const accessToken =
    typeof tokenBody === 'object' && tokenBody && 'access_token' in tokenBody && typeof (tokenBody as { access_token?: unknown }).access_token === 'string'
      ? String((tokenBody as { access_token?: unknown }).access_token)
      : null;
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_token', baseUrl).toString());
  }

  // Fetch user profile
  const meRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const me = (await meRes.json().catch(() => null)) as unknown;
  if (!meRes.ok) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_userinfo', baseUrl).toString());
  }

  const email =
    typeof me === 'object' && me && 'email' in me && typeof (me as { email?: unknown }).email === 'string'
      ? String((me as { email?: unknown }).email).trim().toLowerCase()
      : null;
  const emailVerified =
    typeof me === 'object' && me && 'email_verified' in me && (me as { email_verified?: unknown }).email_verified === true;

  if (!email || !emailVerified) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_email', baseUrl).toString());
  }

  // Extract rich Google profile data
  const googleProfile = me as Record<string, unknown>;
  const name = typeof googleProfile.name === 'string' ? googleProfile.name.trim() : '';
  const picture = typeof googleProfile.picture === 'string' ? googleProfile.picture.trim() : undefined;
  const locale = typeof googleProfile.locale === 'string' ? googleProfile.locale.trim() : undefined;

  const db = getDb();
  const existing = await db.getUserByEmail(email);

  const tenantMode = (process.env.BF_TENANT_MODE ?? 'multi').toLowerCase();

  let userId = existing?.userId ?? null;
  let orgId = existing?.orgId ?? null;

  if (!existing) {
    // First-time signup: Create user + org
    userId = `user_${createId()}`;
    orgId = tenantMode === 'multi' ? `org_${createId()}` : 'org_demo';

    const existingOrg = await db.getOrg(orgId);
    if (!existingOrg) {
      // Pre-fill org name from Google profile name if available
      const orgName = name ? `${name}'s Business` : 'My Business';
      await db.putOrg({ 
        orgId, 
        name: tenantMode === 'multi' ? orgName : 'Demo Escape', 
        timezone: 'Asia/Dhaka' 
      });
    }

    // Split name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    await db.putUser({
      userId,
      orgId,
      email,
      passwordHash: '',
      role: 'owner',
      createdAt: nowIso(),
      authProvider: 'google',
      firstName,
      lastName,
      picture,
      locale,
      lastLoginAt: nowIso(),
      loginCount: 1,
    });
  } else {
    // Existing user: Update profile photo, name, locale, and login tracking
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const updatedUser = {
      ...existing,
      firstName: firstName || existing.firstName, // Update name from Google (may change)
      lastName: lastName || existing.lastName,
      picture, // Update profile photo (can change over time)
      locale: locale || existing.locale,
      lastLoginAt: nowIso(),
      loginCount: (existing.loginCount ?? 0) + 1,
    };
    await db.putUser(updatedUser);
  }

  // Create session
  const sessionToken = `sess_${createId()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString();
  await db.putSession({ sessionToken, userId: userId!, orgId: orgId!, createdAt: nowIso(), expiresAt });

  // Determine next
  const nextCookie = cookies
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${NEXT_COOKIE}=`));
  const nextPath = nextCookie ? decodeURIComponent(nextCookie.split('=')[1] ?? '') : '/dashboard';

  const res = NextResponse.redirect(new URL(nextPath, baseUrl).toString());
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  });

  // Clear oauth cookies
  res.cookies.set({ name: STATE_COOKIE, value: '', path: '/', expires: new Date(0) });
  res.cookies.set({ name: NEXT_COOKIE, value: '', path: '/', expires: new Date(0) });

  return res;
  } catch {
    const fallbackBase = process.env.BF_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/login?error=google_oauth_failed', fallbackBase).toString());
  }
}

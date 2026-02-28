import { NextResponse } from 'next/server';
import { createId } from '@paralleldrive/cuid2';

const STATE_COOKIE = 'bf_google_oauth_state';
const NEXT_COOKIE = 'bf_google_oauth_next';

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET(req: Request) {
  try {
  const url = new URL(req.url);
  const nextPath = url.searchParams.get('next') || '/dashboard';

  const clientId = getRequiredEnv('BF_GOOGLE_CLIENT_ID');
  const baseUrl = getRequiredEnv('BF_PUBLIC_BASE_URL');

  const state = `st_${createId()}`;

  const redirectUri = new URL('/api/auth/google/callback', baseUrl).toString();
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });
  res.cookies.set({
    name: NEXT_COOKIE,
    value: nextPath,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  });
  return res;
  } catch {
    const fallbackBase = process.env.BF_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/login?error=google_not_configured', fallbackBase).toString());
  }
}

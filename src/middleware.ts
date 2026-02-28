import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  /* ── Embed routes: skip ALL middleware processing ── */
  /* Widget, book, embed, standalone pages are public — no auth, no session leakage */
  if (
    pathname.startsWith('/widget') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/embed') ||
    pathname.startsWith('/standalone') ||
    pathname.startsWith('/gift-cards')
  ) {
    return NextResponse.next();
  }

  /* ── Domain-based routing: escapeboost.com → /escapeboost/* ── */
  if (hostname === 'escapeboost.com' || hostname === 'www.escapeboost.com') {
    if (!pathname.startsWith('/escapeboost') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone();
      url.pathname = '/escapeboost' + pathname;
      return NextResponse.rewrite(url);
    }
  }

  /* ── Session cookie → header passthrough for SSR (dashboard only) ── */
  const token = req.cookies.get('bf_session')?.value;
  if (!token) return NextResponse.next();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-bf-session', token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/api/dashboard/:path*', '/escapeboost/:path*', '/features', '/pricing', '/blog/:path*', '/about', '/contact', '/login', '/signup', '/forgot-password', '/reset-password', '/onboarding', '/widget/:path*', '/book/:path*', '/embed/:path*', '/standalone/:path*', '/gift-cards/:path*'],
};

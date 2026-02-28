import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  /* ── Domain-based routing: escapeboost.com → /escapeboost/* ── */
  if (hostname === 'escapeboost.com' || hostname === 'www.escapeboost.com') {
    if (!pathname.startsWith('/escapeboost') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone();
      url.pathname = '/escapeboost' + pathname;
      return NextResponse.rewrite(url);
    }
  }

  /* ── Session cookie → header passthrough for SSR ── */
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
  matcher: ['/', '/dashboard/:path*', '/api/dashboard/:path*', '/escapeboost/:path*', '/features', '/pricing', '/blog/:path*', '/about', '/contact', '/login', '/signup', '/forgot-password', '/reset-password', '/onboarding', '/widget', '/book', '/embed/:path*', '/standalone/:path*'],
};

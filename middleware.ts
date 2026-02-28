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

  /* ── Marketing domain: redirect auth/dashboard routes to dash.bookingflowai.com ── */
  const effectiveHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host || '').replace(/:\d+$/, '').toLowerCase();
  const isMarketingDomain = effectiveHost === 'bookingflowai.com' || effectiveHost === 'www.bookingflowai.com';
  const authRoutes = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/api/dashboard');
  
  if (isMarketingDomain && authRoutes) {
    const target = `https://dash.bookingflowai.com${pathname}${req.nextUrl.search}`;
    return NextResponse.redirect(target);
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
  matcher: ['/((?!_next/static|_next/image|favicon\\.png|images|robots\\.txt|sitemap\\.xml).*)'],
};

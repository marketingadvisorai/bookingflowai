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
    return NextResponse.redirect(`https://dash.bookingflowai.com${pathname}${req.nextUrl.search}`);
  }

  /* ── Dashboard domain: redirect marketing pages to bookingflowai.com ── */
  const isDashDomain = effectiveHost === 'dash.bookingflowai.com';
  if (isDashDomain && !authRoutes && !pathname.startsWith('/api') && !pathname.startsWith('/widget') && !pathname.startsWith('/book') && !pathname.startsWith('/embed') && !pathname.startsWith('/standalone') && !pathname.startsWith('/gift-cards')) {
    return NextResponse.redirect(`https://bookingflowai.com${pathname}${req.nextUrl.search}`);
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

  /* ── Redirect logged-in users away from /login and /signup ── */
  if (pathname === '/login' || pathname === '/signup') {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.search = '';
    const redirectRes = NextResponse.redirect(dashUrl);
    // Renew cookie with sliding window
    redirectRes.cookies.set({
      name: 'bf_session',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 60, // 30 minutes
    });
    return redirectRes;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-bf-session', token);

  /* ── Sliding window: renew cookie expiry on every request ── */
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.cookies.set({
    name: 'bf_session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 60, // 30 minutes
  });
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.png|images|robots\\.txt|sitemap\\.xml).*)'],
};

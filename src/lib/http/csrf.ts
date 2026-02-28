import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  process.env.BF_PUBLIC_BASE_URL || 'https://bookingflowai.com',
  'https://bookingflowai.com',
  'https://escapeboost.com',
]);

/**
 * Simple CSRF protection: verify Origin or Referer header matches allowed domains.
 * Returns a 403 response if the check fails, or null if OK.
 */
export function checkCsrf(req: Request): NextResponse | null {
  // Only check state-changing methods
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

  // In development, skip CSRF checks
  if (process.env.NODE_ENV !== 'production') return null;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // Origin header is most reliable
  if (origin) {
    if (ALLOWED_ORIGINS.has(origin)) return null;
    return NextResponse.json({ ok: false, error: 'csrf_origin_mismatch' }, { status: 403 });
  }

  // Fall back to Referer
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.has(refOrigin)) return null;
    } catch {
      // invalid URL
    }
    return NextResponse.json({ ok: false, error: 'csrf_referer_mismatch' }, { status: 403 });
  }

  // No Origin or Referer — allow for now (API clients, curl, etc.)
  // In production with a real domain, tighten this check
  return null;
}

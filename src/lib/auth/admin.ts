import { NextResponse } from 'next/server';

export function requireAdminKey(req: Request): NextResponse | null {
  const key = process.env.BF_ADMIN_API_KEY;
  const isProd = process.env.NODE_ENV === 'production';
  if (!key) {
    // Fail closed in production to avoid accidental exposure.
    if (isProd) return NextResponse.json({ ok: false, error: 'admin_not_configured' }, { status: 503 });
    return null; // dev mode
  }

  const got = req.headers.get('x-admin-key');
  if (got && got === key) return null;

  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

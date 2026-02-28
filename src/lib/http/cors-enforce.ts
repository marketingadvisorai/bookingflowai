import { NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/http/cors';

/**
 * Enforce CORS for public widget endpoints.
 * - If Origin is missing: treat as server-to-server and allow (no CORS headers).
 * - If Origin is present but not allowed: return 403.
 * - If allowed: include CORS headers.
 */
function isSameOrigin(req: Request, origin: string) {
  try {
    const o = new URL(origin);

    // On some platforms (e.g. Amplify/CloudFront), req.url may reflect an internal host
    // while the browser Origin reflects the public host. Prefer forwarded host/proto.
    const xfHost = req.headers.get('x-forwarded-host');
    const xfProto = req.headers.get('x-forwarded-proto');
    const host = req.headers.get('host');

    const proto = (xfProto || 'https').replace(/:$/, '');
    const effHost = xfHost || host;

    // If we can't determine effective host, fall back to req.url.
    const effectiveUrl = effHost
      ? `${proto}://${effHost}${new URL(req.url).pathname}${new URL(req.url).search}`
      : req.url;

    const u = new URL(effectiveUrl);

    // Compare protocol + hostname + port (normalize empty ports to default)
    const oPort = o.port || (o.protocol === 'https:' ? '443' : '80');
    const uPort = u.port || (u.protocol === 'https:' ? '443' : '80');

    return o.protocol === u.protocol && o.hostname === u.hostname && oPort === uPort;
  } catch {
    return false;
  }
}

export function enforceCors(req: Request): { headers: Record<string, string> } | NextResponse {
  const origin = req.headers.get('origin');
  if (!origin) return { headers: {} };

  // Always allow same-origin requests (dashboard, local dev), regardless of embed allowlist.
  if (isSameOrigin(req, origin)) return { headers: {} };

  const headers = corsHeaders(origin);
  if (!headers) {
    return NextResponse.json({ ok: false, error: 'cors_not_allowed' }, { status: 403 });
  }

  return { headers: headers as unknown as Record<string, string> };
}

export function corsOptions(req: Request): NextResponse {
  const origin = req.headers.get('origin');
  if (!origin) return new NextResponse(null, { status: 204 });

  if (isSameOrigin(req, origin)) return new NextResponse(null, { status: 204 });

  const headers = corsHeaders(origin);
  if (!headers) return new NextResponse(null, { status: 403 });

  return new NextResponse(null, { status: 204, headers: headers as unknown as Record<string, string> });
}

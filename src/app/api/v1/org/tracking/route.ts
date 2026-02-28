import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireSession } from '@/lib/auth/require-session';

// NOTE: These settings may include tokens (secrets). In production we should
// encrypt-at-rest (KMS) and restrict access by role. For now, we store them in
// the Org record to unblock integrations.

type TrackingSettings = {
  enabled?: boolean;
  allowedOrigins?: string[];
  consentMode?: 'inherit_cmp' | 'bookingflow_prompt' | 'none';

  google?: {
    gtmContainerId?: string;
    ga4MeasurementId?: string;
    adsConversionId?: string;
    adsConversionLabel?: string;
  };

  meta?: {
    pixelId?: string;
    capiToken?: string;
  };

  tiktok?: {
    pixelId?: string;
    advertiserId?: string;
    eventsApiToken?: string;
  };
};

function ok(headers?: HeadersInit) {
  return NextResponse.json({ ok: true }, { headers });
}

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  const tracking = org && 'tracking' in org ? (org as unknown as { tracking?: unknown }).tracking : null;
  return NextResponse.json({ ok: true, tracking: tracking ?? null });
}

export async function PUT(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const tracking = (body as { tracking?: unknown }).tracking;
  if (tracking != null && typeof tracking !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_tracking' }, { status: 400 });
  }

  const db = getDb();
  const org = await db.getOrg(sess.orgId);
  if (!org) return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });

  // Minimal sanitation: keep only expected keys.
  const t = tracking as TrackingSettings | null;
  const sanitized: TrackingSettings | null =
    t == null
      ? null
      : {
          enabled: Boolean(t.enabled),
          allowedOrigins: Array.isArray(t.allowedOrigins)
            ? t.allowedOrigins.filter((x) => typeof x === 'string').map((s) => s.trim()).filter(Boolean)
            : [],
          consentMode: t.consentMode,
          google: t.google
            ? {
                gtmContainerId: t.google.gtmContainerId?.trim(),
                ga4MeasurementId: t.google.ga4MeasurementId?.trim(),
                adsConversionId: t.google.adsConversionId?.trim(),
                adsConversionLabel: t.google.adsConversionLabel?.trim(),
              }
            : undefined,
          meta: t.meta
            ? {
                pixelId: t.meta.pixelId?.trim(),
                capiToken: t.meta.capiToken?.trim(),
              }
            : undefined,
          tiktok: t.tiktok
            ? {
                pixelId: t.tiktok.pixelId?.trim(),
                advertiserId: t.tiktok.advertiserId?.trim(),
                eventsApiToken: t.tiktok.eventsApiToken?.trim(),
              }
            : undefined,
        };

  await db.putOrg({ ...(org as unknown as Record<string, unknown>), tracking: sanitized } as unknown as typeof org);

  return ok();
}

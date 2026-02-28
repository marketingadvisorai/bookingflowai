'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function normalizeOrigins(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TrackingSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [consentMode, setConsentMode] = useState<TrackingSettings['consentMode']>('inherit_cmp');
  const [allowedOriginsRaw, setAllowedOriginsRaw] = useState('');

  const [gtmContainerId, setGtmContainerId] = useState('');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('');
  const [adsConversionId, setAdsConversionId] = useState('');
  const [adsConversionLabel, setAdsConversionLabel] = useState('');

  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaCapiToken, setMetaCapiToken] = useState('');

  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState('');
  const [tiktokEventsApiToken, setTiktokEventsApiToken] = useState('');

  const allowedOrigins = useMemo(() => normalizeOrigins(allowedOriginsRaw), [allowedOriginsRaw]);

  const gtmSnippet = useMemo(() => {
    const origins = allowedOrigins.length ? allowedOrigins : ['https://YOUR_DOMAIN.com'];
    return `<!-- BookingFlow Tracking Bridge (GTM Custom HTML) -->\n<script>\n(function(){\n  var ALLOWED = ${JSON.stringify(origins, null, 2)};\n  function okOrigin(origin){\n    try { return ALLOWED.indexOf(origin) !== -1; } catch(e){ return false; }\n  }\n  function push(obj){\n    window.dataLayer = window.dataLayer || [];\n    window.dataLayer.push(obj);\n  }\n\n  window.addEventListener('message', function(ev){\n    if(!okOrigin(ev.origin)) return;\n    var d = ev.data || {};\n\n    if(d.type === 'bf:event') {\n      push({\n        event: 'bf_event',\n        bf_name: d.name,\n        orgId: d.orgId,\n        gameId: d.gameId,\n        holdId: d.holdId,\n        bookingId: d.bookingId,\n        roomId: d.roomId,\n        startAt: d.startAt,\n        endAt: d.endAt,\n        date: d.date,\n        type: d.type,\n        players: d.players,\n        slotsCount: d.slotsCount\n      });\n      return;\n    }\n\n    if(d.type === 'bf:conversion') {\n      push({\n        event: 'bf_conversion',\n        bf_event: d.event || 'purchase',\n        bf_event_id: d.event_id,\n        transaction_id: d.transaction_id,\n        value: d.value,\n        currency: d.currency,\n        orgId: d.orgId,\n        gameId: d.gameId\n      });\n      return;\n    }\n  });\n})();\n</script>`;
  }, [allowedOrigins]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      setOk(false);
      try {
        const res = await fetch('/api/v1/org/tracking', { cache: 'no-store' });
        const body = (await res.json().catch(() => null)) as { ok?: boolean; tracking?: TrackingSettings | null } | null;
        if (!res.ok || !body?.ok) throw new Error('Failed to load');

        const t = body.tracking ?? {};
        if (cancelled) return;

        setEnabled(Boolean(t.enabled ?? true));
        setConsentMode(t.consentMode ?? 'inherit_cmp');
        setAllowedOriginsRaw((t.allowedOrigins ?? []).join('\n'));

        setGtmContainerId(t.google?.gtmContainerId ?? '');
        setGa4MeasurementId(t.google?.ga4MeasurementId ?? '');
        setAdsConversionId(t.google?.adsConversionId ?? '');
        setAdsConversionLabel(t.google?.adsConversionLabel ?? '');

        setMetaPixelId(t.meta?.pixelId ?? '');
        setMetaCapiToken(t.meta?.capiToken ?? '');

        setTiktokPixelId(t.tiktok?.pixelId ?? '');
        setTiktokAdvertiserId(t.tiktok?.advertiserId ?? '');
        setTiktokEventsApiToken(t.tiktok?.eventsApiToken ?? '');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const payload: TrackingSettings = {
        enabled,
        consentMode,
        allowedOrigins,
        google: {
          gtmContainerId,
          ga4MeasurementId,
          adsConversionId,
          adsConversionLabel,
        },
        meta: {
          pixelId: metaPixelId,
          capiToken: metaCapiToken,
        },
        tiktok: {
          pixelId: tiktokPixelId,
          advertiserId: tiktokAdvertiserId,
          eventsApiToken: tiktokEventsApiToken,
        },
      };

      const res = await fetch('/api/v1/org/tracking', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tracking: payload }),
      });

      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? 'Save failed');
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Consent & Security Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Consent & Security</CardTitle>
          <CardDescription>Configure tracking consent mode and allowed origins</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">Tracking enabled</div>
              <div className="text-xs text-muted-foreground mt-1">Turn off to disable event forwarding</div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-border"
              />
              <span>{enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consentMode" className="text-sm font-medium">
              Consent mode
            </Label>
            <select
              id="consentMode"
              value={consentMode}
              onChange={(e) => setConsentMode(e.target.value as TrackingSettings['consentMode'])}
              className="h-11 md:h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:ring-[#FF4F00]/20 focus:border-[#FF4F00] focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="inherit_cmp">Use my website CMP / Consent Mode</option>
              <option value="bookingflow_prompt">Use BookingFlow prompt (fallback)</option>
              <option value="none">No consent banner (send minimal)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              For EU/EEA, merchants should implement Google Consent Mode v2 via their CMP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedOrigins" className="text-sm font-medium">
              Allowed website origins
            </Label>
            <textarea
              id="allowedOrigins"
              value={allowedOriginsRaw}
              onChange={(e) => setAllowedOriginsRaw(e.target.value)}
              placeholder="https://www.example.com&#10;https://example.webflow.io"
              className="min-h-[100px] w-full rounded-lg border border-border bg-card p-3 text-sm focus:ring-[#FF4F00]/20 focus:border-[#FF4F00] focus-visible:outline-none focus-visible:ring-2"
            />
            <p className="text-xs text-muted-foreground">One per line. Used to validate postMessage events (security)</p>
          </div>
        </CardContent>
      </Card>

      {/* Google Integrations Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Google Integrations</CardTitle>
          <CardDescription>Google Tag Manager, GA4, and Google Ads tracking</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gtmContainerId" className="text-sm font-medium">
              GTM Container ID
            </Label>
            <Input
              id="gtmContainerId"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              placeholder="GTM-XXXXXXX (optional)"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ga4MeasurementId" className="text-sm font-medium">
              GA4 Measurement ID
            </Label>
            <Input
              id="ga4MeasurementId"
              value={ga4MeasurementId}
              onChange={(e) => setGa4MeasurementId(e.target.value)}
              placeholder="G-XXXXXXX"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adsConversionId" className="text-sm font-medium">
                Google Ads Conversion ID
              </Label>
              <Input
                id="adsConversionId"
                value={adsConversionId}
                onChange={(e) => setAdsConversionId(e.target.value)}
                placeholder="AW-123456789"
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adsConversionLabel" className="text-sm font-medium">
                Google Ads Conversion Label
              </Label>
              <Input
                id="adsConversionLabel"
                value={adsConversionLabel}
                onChange={(e) => setAdsConversionLabel(e.target.value)}
                placeholder="Conversion Label"
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Integrations Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Meta Integrations</CardTitle>
          <CardDescription>Facebook Pixel and Conversions API tracking</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaPixelId" className="text-sm font-medium">
              Meta Pixel ID
            </Label>
            <Input
              id="metaPixelId"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="Meta Pixel ID"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaCapiToken" className="text-sm font-medium">
              CAPI Access Token
            </Label>
            <Input
              id="metaCapiToken"
              type="password"
              value={metaCapiToken}
              onChange={(e) => setMetaCapiToken(e.target.value)}
              placeholder="CAPI Access Token (secret)"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
            <p className="text-xs text-muted-foreground">
              Token is stored in your org settings. We should encrypt-at-rest before production rollout
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TikTok Integrations Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">TikTok Integrations</CardTitle>
          <CardDescription>TikTok Pixel and Events API tracking</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tiktokPixelId" className="text-sm font-medium">
              TikTok Pixel ID
            </Label>
            <Input
              id="tiktokPixelId"
              value={tiktokPixelId}
              onChange={(e) => setTiktokPixelId(e.target.value)}
              placeholder="TikTok Pixel ID"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokAdvertiserId" className="text-sm font-medium">
              TikTok Advertiser ID
            </Label>
            <Input
              id="tiktokAdvertiserId"
              value={tiktokAdvertiserId}
              onChange={(e) => setTiktokAdvertiserId(e.target.value)}
              placeholder="TikTok Advertiser ID (optional)"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokEventsApiToken" className="text-sm font-medium">
              TikTok Events API Token
            </Label>
            <Input
              id="tiktokEventsApiToken"
              type="password"
              value={tiktokEventsApiToken}
              onChange={(e) => setTiktokEventsApiToken(e.target.value)}
              placeholder="TikTok Events API token (secret)"
              className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
            />
          </div>
        </CardContent>
      </Card>

      {/* GTM Snippet Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">GTM Snippet</CardTitle>
          <CardDescription>
            Paste this into a GTM Custom HTML tag on your website to bridge BookingFlow events to your Data Layer
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            {gtmSnippet}
          </pre>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(gtmSnippet);
              setOk(true);
              setTimeout(() => setOk(false), 1500);
            }}
            className="w-full md:w-auto min-h-[44px]"
          >
            Copy snippet
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto min-h-[44px]">
          {saving ? 'Saving…' : 'Save all settings'}
        </Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {ok && <div className="text-sm text-emerald-600 dark:text-emerald-300">Saved successfully</div>}
      </div>

      <p className="text-xs text-muted-foreground">
        Next: we'll add a "Send test event" button + optional server-side sends (Meta CAPI / TikTok Events API)
      </p>
    </div>
  );
}

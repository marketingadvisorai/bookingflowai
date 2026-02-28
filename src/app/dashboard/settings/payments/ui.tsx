'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Status = {
  ok?: boolean;
  connected?: boolean;
  stripeAccountId?: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  error?: string;
};

type PaymentMode = 'full' | 'deposit';

type OrgSettings = {
  ok?: boolean;
  org?: {
    paymentMode?: PaymentMode;
    depositPercent?: number;
  };
  error?: string;
};

export function PaymentsSettings({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full');
  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/v1/stripe/connect/status?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' }),
        fetch('/api/dashboard/org', { cache: 'no-store' }),
      ]);

      const body1 = (await res1.json().catch(() => null)) as Status | null;
      const body2 = (await res2.json().catch(() => null)) as OrgSettings | null;

      if (!res1.ok || !body1?.ok) {
        const e = body1?.error || 'Failed to load Stripe status';
        setError(e);
        setStatus(body1);
        return;
      }
      setStatus(body1);

      const pm = body2?.org?.paymentMode;
      const dp = body2?.org?.depositPercent;
      setPaymentMode(pm === 'deposit' ? 'deposit' : 'full');
      setDepositPercent(typeof dp === 'number' && Number.isFinite(dp) ? dp : 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect() {
    setError(null);
    try {
      const res = await fetch('/api/v1/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (!res.ok || !body?.ok || !body.url) {
        setError(body?.error || 'Failed to create Stripe onboarding link');
        return;
      }
      window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const stripeNotConfigured = status?.error === 'stripe_not_configured' || error === 'stripe_not_configured';

  return (
    <div className="space-y-6">
      {error && !stripeNotConfigured && <div className="text-sm text-destructive">{error}</div>}

      {stripeNotConfigured && (
        <Card className="rounded-xl border-destructive/50 bg-destructive/5">
          <CardContent className="p-5 md:p-6">
            <div className="text-sm text-muted-foreground">
              Stripe is not configured yet. Add environment variables:
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_RETURN_URL, STRIPE_CONNECT_REFRESH_URL
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Connect Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Stripe Connect</CardTitle>
          <CardDescription>Connect your Stripe account to accept payments</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`font-medium ${
                  status?.connected ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground'
                }`}
              >
                {status?.connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Stripe account:</span>
              <span className="font-medium break-all text-right">{status?.stripeAccountId ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Charges enabled:</span>
              <span className="font-medium">{String(status?.chargesEnabled ?? false)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payouts enabled:</span>
              <span className="font-medium">{String(status?.payoutsEnabled ?? false)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={connect} className="w-full sm:w-auto min-h-[44px]">
              {status?.connected ? 'Re-open Stripe onboarding' : 'Connect Stripe'}
            </Button>
            <Button type="button" variant="secondary" onClick={load} className="w-full sm:w-auto min-h-[44px]">
              Refresh status
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Use Stripe Connect Express. BookingFlow will create destination charges to this connected account
          </p>
        </CardContent>
      </Card>

      {/* Payment Settings Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Payment Settings</CardTitle>
          <CardDescription>Configure default payment collection mode</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment mode</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className={`
                  rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] flex-1 sm:flex-initial
                  ${
                    paymentMode === 'full'
                      ? 'bg-[#FF4F00]/10 text-[#FF4F00] border border-[#FF4F00]/30'
                      : 'border border-border bg-transparent text-muted-foreground hover:bg-foreground/[0.04]'
                  }
                `}
                onClick={() => setPaymentMode('full')}
              >
                Full payment
              </button>
              <button
                type="button"
                className={`
                  rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] flex-1 sm:flex-initial
                  ${
                    paymentMode === 'deposit'
                      ? 'bg-[#FF4F00]/10 text-[#FF4F00] border border-[#FF4F00]/30'
                      : 'border border-border bg-transparent text-muted-foreground hover:bg-foreground/[0.04]'
                  }
                `}
                onClick={() => setPaymentMode('deposit')}
              >
                Deposit
              </button>
            </div>

            {paymentMode === 'deposit' ? (
              <p className="text-xs text-muted-foreground">
                Deposit percent: {depositPercent}% (MVP default). Full customization coming soon
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Customers pay 100% at booking time</p>
            )}
          </div>

          <Button
            type="button"
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                const res = await fetch('/api/dashboard/org', {
                  method: 'PUT',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    paymentMode,
                    depositPercent: paymentMode === 'deposit' ? depositPercent : undefined,
                  }),
                });

                const body = (await res.json().catch(() => null)) as { error?: string } | null;
                if (!res.ok) {
                  setError(body?.error || 'Save failed');
                  return;
                }
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {saving ? 'Saving…' : 'Save payment settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

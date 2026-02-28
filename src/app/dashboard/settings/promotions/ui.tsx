'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Promo = {
  code: string;
  type: 'percent' | 'fixed';
  percentOff?: number;
  amountOffCents?: number;
  currency?: string;
  enabled: boolean;
  createdAt: string;
};

export function PromotionsSettings({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [percentOff, setPercentOff] = useState(10);
  const [amountOff, setAmountOff] = useState(500);
  const [currency, setCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);

  const normalizedCode = useMemo(() => code.trim().toUpperCase().replace(/\s+/g, ''), [code]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/promotions', { cache: 'no-store' });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; promotions?: Promo[]; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setError(body?.error || 'Failed to load promotions');
        return;
      }
      setPromos(body.promotions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createPromo() {
    setSaving(true);
    setError(null);
    try {
      const payload:
        | { code: string; type: 'percent'; currency: string; percentOff: number }
        | { code: string; type: 'fixed'; currency: string; amountOffCents: number } =
        type === 'percent'
          ? { code: normalizedCode, type: 'percent', currency, percentOff }
          : { code: normalizedCode, type: 'fixed', currency, amountOffCents: amountOff };

      const res = await fetch('/api/dashboard/promotions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setError(body?.error || 'Failed to create promo');
        return;
      }

      setCode('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(p: Promo, enabled: boolean) {
    setError(null);
    const prev = promos;
    setPromos((xs) => xs.map((x) => (x.code === p.code ? { ...x, enabled } : x)));
    try {
      const res = await fetch('/api/dashboard/promotions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: p.code, enabled }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        setPromos(prev);
        setError(body?.error || 'Failed to update promo');
      }
    } catch (e) {
      setPromos(prev);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Create Promo Code Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Create Promo Code</CardTitle>
          <CardDescription>Create a new discount code for your customers</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Code Input */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Code
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SAVE10"
                className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
              />
              <p className="text-xs text-muted-foreground">Normalized: {normalizedCode || ' - '}</p>
            </div>

            {/* Type Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`
                    rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px]
                    ${
                      type === 'percent'
                        ? 'bg-[#FF4F00]/10 text-[#FF4F00] border border-[#FF4F00]/30'
                        : 'border border-border bg-transparent text-muted-foreground hover:bg-foreground/[0.04]'
                    }
                  `}
                  onClick={() => setType('percent')}
                >
                  Percent
                </button>
                <button
                  type="button"
                  className={`
                    rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px]
                    ${
                      type === 'fixed'
                        ? 'bg-[#FF4F00]/10 text-[#FF4F00] border border-[#FF4F00]/30'
                        : 'border border-border bg-transparent text-muted-foreground hover:bg-foreground/[0.04]'
                    }
                  `}
                  onClick={() => setType('fixed')}
                >
                  Fixed
                </button>
              </div>
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                Value
              </Label>
              {type === 'percent' ? (
                <Input
                  id="value"
                  type="number"
                  min={1}
                  max={100}
                  value={percentOff}
                  onChange={(e) => setPercentOff(Number(e.target.value))}
                  className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
                  placeholder="10"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={amountOff}
                    onChange={(e) => setAmountOff(Number(e.target.value))}
                    className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
                    placeholder="Amount"
                  />
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
                    placeholder="USD"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {type === 'percent' ? `${percentOff}% off` : `$${(amountOff / 100).toFixed(2)} ${currency} off`}
              </p>
            </div>
          </div>

          <Button type="button" onClick={createPromo} disabled={saving || !normalizedCode} className="w-full md:w-auto min-h-[44px]">
            {saving ? 'Creating…' : 'Create promo'}
          </Button>

          <p className="text-xs text-muted-foreground">
            This creates the Coupon + Promotion Code in Stripe for this org. Works for both Private and Public bookings
          </p>
        </CardContent>
      </Card>

      {/* Existing Promos Card */}
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Existing Promos</CardTitle>
          <CardDescription>Manage your active and inactive promotion codes</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          {promos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No promo codes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first promo code above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promos
                .slice()
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((p) => (
                  <div
                    key={p.code}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold">{p.code}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.type === 'percent'
                          ? `${p.percentOff ?? 0}% off`
                          : `${((p.amountOffCents ?? 0) / 100).toFixed(2)} ${p.currency?.toUpperCase() ?? 'USD'} off`}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`
                        w-full rounded-lg px-4 py-2.5 text-xs font-medium transition-all min-h-[44px] sm:w-auto
                        ${
                          p.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                            : 'border border-border bg-transparent text-muted-foreground hover:bg-foreground/[0.04]'
                        }
                      `}
                      onClick={() => toggle(p, !p.enabled)}
                    >
                      {p.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Org: {orgId}</p>
    </div>
  );
}

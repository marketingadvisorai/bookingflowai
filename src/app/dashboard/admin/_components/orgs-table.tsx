'use client';

import { useState } from 'react';
import { PlanBadge } from './plan-badge';

type AdminOrg = {
  orgId: string; name: string; timezone: string; plan: string;
  stripeAccountId?: string; stripeChargesEnabled: boolean;
  businessName?: string; website?: string; phone?: string;
  city?: string; country?: string; businessType?: string;
  gameCount: number; bookingCount: number; revenue: number;
};

const PLANS = ['free', 'pro', 'business', 'enterprise'];

export function OrgsTable({ orgs }: { orgs: AdminOrg[] }) {
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [orgPlans, setOrgPlans] = useState<Record<string, string>>({});

  const getPlan = (o: AdminOrg) => orgPlans[o.orgId] ?? o.plan ?? 'free';

  async function handlePlanChange(orgId: string, newPlan: string) {
    setChangingPlan(orgId);
    try {
      const res = await fetch('/api/dashboard/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, plan: newPlan }),
      });
      if (res.ok) setOrgPlans((prev) => ({ ...prev, [orgId]: newPlan }));
    } finally {
      setChangingPlan(null);
    }
  }

  const stripeStatus = (o: AdminOrg) => (
    <span className="flex items-center gap-1.5 text-xs">
      <span className={`inline-block h-2 w-2 rounded-full ${o.stripeChargesEnabled ? 'bg-green-500' : 'bg-red-400'}`} />
      {o.stripeChargesEnabled ? 'Connected' : 'Not connected'}
    </span>
  );

  return (
    <div className="space-y-3">
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Plan</th>
              <th className="pb-2 pr-4">Stripe</th>
              <th className="pb-2 pr-4">Games</th>
              <th className="pb-2 pr-4">Bookings</th>
              <th className="pb-2 pr-4">City</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.orgId} className="border-b border-border/20">
                <td className="py-2 pr-4 font-medium">{o.businessName || o.name}</td>
                <td className="py-2 pr-4">
                  <PlanDropdown
                    plan={getPlan(o)} orgId={o.orgId}
                    changing={changingPlan === o.orgId}
                    onSelect={(p) => handlePlanChange(o.orgId, p)}
                  />
                </td>
                <td className="py-2 pr-4">{stripeStatus(o)}</td>
                <td className="py-2 pr-4">{o.gameCount}</td>
                <td className="py-2 pr-4">{o.bookingCount}</td>
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {[o.city, o.country].filter(Boolean).join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {orgs.map((o) => (
          <div key={o.orgId} className="rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{o.businessName || o.name}</span>
              <PlanDropdown
                plan={getPlan(o)} orgId={o.orgId}
                changing={changingPlan === o.orgId}
                onSelect={(p) => handlePlanChange(o.orgId, p)}
              />
            </div>
            <div className="grid gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stripe:</span>
                {stripeStatus(o)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Games / Bookings:</span>
                <span>{o.gameCount} / {o.bookingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">City:</span>
                <span className="text-xs">{[o.city, o.country].filter(Boolean).join(', ') || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanDropdown({ plan, orgId, changing, onSelect }: {
  plan: string; orgId: string; changing: boolean;
  onSelect: (plan: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} disabled={changing} className="cursor-pointer">
        {changing ? <span className="text-xs text-muted-foreground">...</span> : <PlanBadge plan={plan} />}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-border/50 bg-card shadow-lg">
          {PLANS.map((p) => (
            <button key={p} onClick={() => { onSelect(p); setOpen(false); }}
              className={`block w-full px-4 py-1.5 text-left text-xs hover:bg-card/80 ${p === plan ? 'font-semibold' : ''}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

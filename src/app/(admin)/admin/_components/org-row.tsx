'use client';

import { useState } from 'react';
import { PlanBadge } from './plan-badge';

interface OrgRowProps {
  orgId: string;
  name: string;
  plan: string;
  ownerEmail: string;
  stripeChargesEnabled: boolean;
  gameCount: number;
  bookingCount: number;
  revenue: number;
  city: string;
}

const validPlans = ['free', 'pro', 'business', 'enterprise'];

export function OrgRow(props: OrgRowProps) {
  const { orgId, name, ownerEmail, stripeChargesEnabled, gameCount, bookingCount, revenue, city } = props;
  const [plan, setPlan] = useState(props.plan || 'free');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function changePlan(newPlan: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, plan: newPlan }),
      });
      if (res.ok) setPlan(newPlan);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const planCell = editing ? (
    <select
      className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      value={plan}
      disabled={saving}
      onChange={(e) => changePlan(e.target.value)}
      onBlur={() => setEditing(false)}
      autoFocus
    >
      {validPlans.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  ) : (
    <button onClick={() => setEditing(true)} title="Click to change plan">
      <PlanBadge plan={plan} />
    </button>
  );

  const stripe = stripeChargesEnabled
    ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" title="Active" />
    : <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" title="Inactive" />;

  const rev = `$${(revenue ?? 0).toLocaleString()}`;

  return (
    <>
      <tr className="hidden border-b border-neutral-100 dark:border-neutral-800 md:table-row">
        <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">{name || '—'}</td>
        <td className="px-4 py-3">{planCell}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{ownerEmail || '—'}</td>
        <td className="px-4 py-3 text-center">{stripe}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{gameCount}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{bookingCount}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{rev}</td>
        <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{city || '—'}</td>
      </tr>
      <tr className="md:hidden">
        <td colSpan={8} className="px-0 py-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral-900 dark:text-white">{name || '—'}</p>
              {planCell}
            </div>
            <p className="mt-1 text-sm text-neutral-500">{ownerEmail}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
              <span>{stripe} Stripe</span>
              <span>{gameCount} games</span>
              <span>{bookingCount} bookings</span>
              <span>{rev}</span>
              {city && <span>{city}</span>}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

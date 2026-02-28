'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '../_components/admin-header';
import { OrgRow } from '../_components/org-row';

interface Org {
  orgId: string; name: string; plan: string; stripeChargesEnabled: boolean;
  gameCount: number; bookingCount: number; revenue: number; city?: string;
}
interface User { email: string; orgId?: string; role?: string }

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => { if (d.ok) { setOrgs(d.orgs); setUsers(d.users); } })
      .finally(() => setLoading(false));
  }, []);

  // Find owner email per org
  const ownerMap: Record<string, string> = {};
  users.forEach((u) => {
    if (u.orgId && u.role === 'owner') ownerMap[u.orgId] = u.email;
  });

  if (loading) return <div className="flex h-64 items-center justify-center text-neutral-400">Loading...</div>;

  return (
    <>
      <AdminHeader title="Workspaces" subtitle={`${orgs.length} workspaces`} />
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <table className="w-full">
          <thead className="hidden border-b border-neutral-200 dark:border-neutral-700 md:table-header-group">
            <tr className="text-left text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Owner</th><th className="px-4 py-3 text-center">Stripe</th>
              <th className="px-4 py-3">Games</th><th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Revenue</th><th className="px-4 py-3">City</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <OrgRow
                key={o.orgId}
                orgId={o.orgId}
                name={o.name}
                plan={o.plan}
                ownerEmail={ownerMap[o.orgId] ?? '—'}
                stripeChargesEnabled={o.stripeChargesEnabled}
                gameCount={o.gameCount}
                bookingCount={o.bookingCount}
                revenue={o.revenue}
                city={o.city ?? ''}
              />
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-400">No workspaces found.</p>
        )}
      </div>
    </>
  );
}

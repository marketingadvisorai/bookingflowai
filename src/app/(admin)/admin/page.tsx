'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from './_components/admin-header';
import { StatsCard } from './_components/stats-card';
import Link from 'next/link';

interface AdminData {
  counts: { users: number; orgs: number; bookings: number; totalRevenue: number };
  users: { email: string; firstName?: string; lastName?: string; orgId?: string; createdAt?: string }[];
  orgs: { orgId: string; name: string }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    fetch('/api/admin').then((r) => r.json()).then((d) => d.ok && setData(d));
  }, []);

  if (!data) {
    return <div className="flex h-64 items-center justify-center text-neutral-400">Loading...</div>;
  }

  const orgMap = Object.fromEntries(data.orgs.map((o) => [o.orgId, o.name]));
  const recentUsers = [...data.users]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 5);

  return (
    <>
      <AdminHeader title="System Admin" subtitle="Platform management for BookingFlow" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard emoji="👤" label="Total Users" value={data.counts.users} />
        <StatsCard emoji="🏢" label="Workspaces" value={data.counts.orgs} />
        <StatsCard emoji="📋" label="Bookings" value={data.counts.bookings} />
        <StatsCard emoji="💰" label="Revenue" value={`$${data.counts.totalRevenue.toLocaleString()}`} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Recent Signups</h2>
        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div key={u.email} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{u.email}</p>
                <p className="text-xs text-neutral-500">{orgMap[u.orgId ?? ''] || 'No workspace'}</p>
              </div>
              <span className="text-xs text-neutral-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex gap-4">
        <Link href="/admin/users" className="rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
          View All Users →
        </Link>
        <Link href="/admin/organizations" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800">
          View Workspaces →
        </Link>
      </div>
    </>
  );
}

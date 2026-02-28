'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '../_components/admin-header';
import { StatsCard } from '../_components/stats-card';

export default function AdminBookingsPage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => d.ok && setCount(d.counts.bookings));
  }, []);

  return (
    <>
      <AdminHeader title="Bookings" subtitle="All bookings across all workspaces" />
      {count !== null && (
        <div className="mb-6 max-w-xs">
          <StatsCard emoji="📋" label="Total Bookings" value={count} />
        </div>
      )}
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg text-neutral-500 dark:text-neutral-400">
          Manage all bookings from this dashboard.
        </p>
      </div>
    </>
  );
}

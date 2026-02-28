'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '../_components/admin-header';
import { UserRow } from '../_components/user-row';

interface User {
  email: string; firstName?: string; lastName?: string;
  orgId?: string; plan?: string; authProvider?: string; createdAt?: string;
}
interface Org { orgId: string; name: string; plan?: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => { if (d.ok) { setUsers(d.users); setOrgs(d.orgs); } })
      .finally(() => setLoading(false));
  }, []);

  const orgMap = Object.fromEntries(orgs.map((o) => [o.orgId, o]));
  const q = search.toLowerCase();
  const filtered = users.filter(
    (u) => u.email.toLowerCase().includes(q) || `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q)
  );

  if (loading) return <div className="flex h-64 items-center justify-center text-neutral-400">Loading...</div>;

  return (
    <>
      <AdminHeader title="Users" subtitle={`${users.length} registered users`} />
      <input
        type="text"
        placeholder="Search by email or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
      />
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <table className="w-full">
          <thead className="hidden border-b border-neutral-200 dark:border-neutral-700 md:table-header-group">
            <tr className="text-left text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400">
              <th className="px-4 py-3">Email</th><th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Workspace</th><th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Auth</th><th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const org = orgMap[u.orgId ?? ''];
              return (
                <UserRow
                  key={u.email}
                  email={u.email}
                  name={[u.firstName, u.lastName].filter(Boolean).join(' ')}
                  orgName={org?.name ?? ''}
                  plan={org?.plan ?? 'free'}
                  authProvider={u.authProvider ?? 'password'}
                  createdAt={u.createdAt ?? ''}
                />
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-400">No users found.</p>
        )}
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';

type AdminUser = {
  userId: string; email: string; orgId: string; role: string;
  createdAt: string; authProvider: string;
  firstName?: string; lastName?: string; phone?: string;
};

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.lastName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const fullName = (u: AdminUser) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || '-';

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search by email or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm outline-none focus:border-[#FF4F00]/50"
      />

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Workspace</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Auth</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.userId} className="border-b border-border/20 cursor-pointer hover:bg-card/30"
                onClick={() => setExpanded(expanded === u.userId ? null : u.userId)}>
                <td className="py-2 pr-4 font-medium">{u.email}</td>
                <td className="py-2 pr-4">{fullName(u)}</td>
                <td className="py-2 pr-4 font-mono text-xs">{u.orgId}</td>
                <td className="py-2 pr-4">{u.role}</td>
                <td className="py-2 pr-4">{u.authProvider}</td>
                <td className="py-2 text-xs text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((u) => (
          <div key={u.userId}
            className="rounded-lg border border-border/50 bg-card/50 p-3 cursor-pointer"
            onClick={() => setExpanded(expanded === u.userId ? null : u.userId)}>
            <div className="mb-1 font-medium">{u.email}</div>
            <div className="text-xs text-muted-foreground">{fullName(u)} · {u.role}</div>
            {expanded === u.userId && (
              <div className="mt-2 grid gap-1.5 border-t border-border/30 pt-2 text-sm">
                <Row label="Workspace" value={u.orgId} />
                <Row label="Auth" value={u.authProvider} />
                <Row label="Phone" value={u.phone ?? '-'} />
                <Row label="Created" value={u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">No users found.</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-xs">{value}</span>
    </div>
  );
}

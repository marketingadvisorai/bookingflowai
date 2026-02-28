import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminNav } from './_components/admin-nav';
import { StatsCards } from './_components/stats-cards';
import type { AdminData } from './_types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchAdminData(): Promise<AdminData | null> {
  const { headers, cookies } = await import('next/headers');
  const h = await headers();
  const c = await cookies();
  const host = h.get('host');
  const token = c.get('bf_session')?.value ?? h.get('x-bf-session') ?? null;
  if (!host || !token) return null;

  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const res = await fetch(`${proto}://${host}/api/dashboard/admin`, {
    headers: { cookie: `bf_session=${token}`, 'x-bf-session': token },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminPage() {
  await requireDashboardSession({ nextPath: '/dashboard/admin' });
  const data = await fetchAdminData();

  if (!data || !data.ok) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Access denied. Only the system admin can view this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const recentUsers = [...data.users]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <AdminNav />
      <Card className="glass">
        <CardHeader>
          <CardTitle>System Admin</CardTitle>
          <CardDescription>Platform overview and management.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatsCards
            users={data.counts.users}
            orgs={data.counts.orgs}
            bookings={data.counts.bookings}
            totalRevenue={data.counts.totalRevenue}
          />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.userId} className="flex items-center justify-between text-sm">
                <span>{u.email}</span>
                <span className="text-xs text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/dashboard/admin/users"
          className="rounded-xl border border-border/50 bg-card/50 p-4 text-center transition-colors hover:bg-card/70">
          <div className="text-sm font-medium">View All Users</div>
          <div className="text-xs text-muted-foreground">{data.counts.users} users</div>
        </Link>
        <Link href="/dashboard/admin/organizations"
          className="rounded-xl border border-border/50 bg-card/50 p-4 text-center transition-colors hover:bg-card/70">
          <div className="text-sm font-medium">View All Workspaces</div>
          <div className="text-xs text-muted-foreground">{data.counts.orgs} workspaces</div>
        </Link>
      </div>
    </div>
  );
}

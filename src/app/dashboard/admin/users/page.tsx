import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminNav } from '../_components/admin-nav';
import { UsersTable } from '../_components/users-table';
import type { AdminData } from '../_types';

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

export default async function AdminUsersPage() {
  await requireDashboardSession({ nextPath: '/dashboard/admin/users' });
  const data = await fetchAdminData();

  if (!data || !data.ok) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Admin</CardTitle>
          <CardDescription>Access denied.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNav />
      <Card className="glass">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>{data.counts.users} total users</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={data.users} />
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminNav } from '../_components/admin-nav';
import { ObservationsClient } from './observations-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ObservationsPage() {
  await requireDashboardSession({ nextPath: '/dashboard/admin/observations' });

  return (
    <div className="space-y-6">
      <AdminNav />
      <Card className="glass">
        <CardHeader>
          <CardTitle>AI Observations</CardTitle>
          <CardDescription>
            Monitor AI agent health, errors, and insights from both Claude and Together.ai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ObservationsClient />
        </CardContent>
      </Card>
    </div>
  );
}

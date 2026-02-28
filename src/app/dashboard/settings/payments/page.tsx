import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { PaymentsSettings } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PaymentsSettingsPage() {
  const { orgId } = await requireDashboardSession({ nextPath: '/dashboard/settings/payments' });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Connect Stripe so you can accept payments via BookingFlow (Destination charges).</CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentsSettings orgId={orgId} />
      </CardContent>
    </Card>
  );
}

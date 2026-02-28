import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PromotionsSettings } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PromotionsPage() {
  const { orgId } = await requireDashboardSession({ nextPath: '/dashboard/settings/promotions' });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Promotions</CardTitle>
        <CardDescription>Create and manage promo codes for this org and sync them to Stripe automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <PromotionsSettings orgId={orgId} />
      </CardContent>
    </Card>
  );
}

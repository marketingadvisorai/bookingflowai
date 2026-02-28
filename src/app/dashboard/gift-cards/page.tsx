import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GiftCardsManager } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GiftCardsPage() {
  await requireDashboardSession({ nextPath: '/dashboard/gift-cards' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold md:text-xl">Gift Cards</h2>
        <p className="text-sm text-muted-foreground">Create and manage gift cards for your customers</p>
      </div>
      <GiftCardsManager />
    </div>
  );
}

import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingSettingsForm } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrackingSettingsPage() {
  await requireDashboardSession({ nextPath: '/dashboard/settings/tracking' });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Tracking</CardTitle>
        <CardDescription>
          Connect Google (GTM/GA4/Ads), Meta, and TikTok so conversions can be tracked accurately. For best results with an iframe
          embed, install tags on your website and let BookingFlow send events to the parent page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TrackingSettingsForm />
      </CardContent>
    </Card>
  );
}

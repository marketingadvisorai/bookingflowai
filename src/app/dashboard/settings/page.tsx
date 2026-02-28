import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrgSettingsForm } from './ui';
import Link from 'next/link';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const { orgId } = await requireDashboardSession({ nextPath: '/dashboard/settings' });
  const db = getDb();
  const org = await db.getOrg(orgId);

  if (!org) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Org settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Org not found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SetupGuide orgId={orgId} page="settings" />
      <Card className="glass">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure tenant fees and defaults.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgSettingsForm
            initial={{
              feeLabel: org.feeLabel ?? 'Processing Fee',
              serviceFeePercent: ((org.serviceFeeBps ?? 0) / 100).toFixed(2),
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Links to Sub-Settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/settings/profile" className="block">
          <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <div className="text-sm font-medium">Profile</div>
            <div className="mt-1 text-xs text-muted-foreground">Update your name, email, and password.</div>
          </div>
        </Link>

        <Link href="/dashboard/settings/tracking" className="block">
          <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <div className="text-sm font-medium">Tracking</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Connect Google (GTM/GA4/Ads), Meta, and TikTok for accurate conversion tracking.
            </div>
          </div>
        </Link>

        <Link href="/dashboard/settings/payments" className="block">
          <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <div className="text-sm font-medium">Payments</div>
            <div className="mt-1 text-xs text-muted-foreground">Connect Stripe so you can accept payments (Destination charges).</div>
          </div>
        </Link>

        <Link href="/dashboard/settings/promotions" className="block">
          <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
            <div className="text-sm font-medium">Promotions</div>
            <div className="mt-1 text-xs text-muted-foreground">Create promo codes and sync them to Stripe automatically.</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

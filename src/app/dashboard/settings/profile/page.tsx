import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const { userId, orgId } = await requireDashboardSession({ nextPath: '/dashboard/settings/profile' });
  const db = getDb();
  const [user, org] = await Promise.all([
    db.getUserById(userId),
    db.getOrg(orgId),
  ]);

  if (!user) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">User not found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your account details.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm
          initial={{
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            phone: user.phone ?? '',
            email: user.email,
            authProvider: user.authProvider ?? 'password',
            createdAt: user.createdAt,
            picture: user.picture,
            orgName: org?.name ?? 'My Business',
            orgPlan: org?.plan ?? 'free',
            loginCount: user.loginCount ?? 0,
          }}
        />
      </CardContent>
    </Card>
  );
}

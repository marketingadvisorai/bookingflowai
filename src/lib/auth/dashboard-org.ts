import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';

/**
 * Get the org ID for the current dashboard user.
 * Previously hardcoded to 'org_demo' — now reads from the authenticated session.
 */
export async function getDashboardOrgId(pathname: string) {
  const { orgId } = await requireDashboardSession({ nextPath: pathname });
  return orgId;
}

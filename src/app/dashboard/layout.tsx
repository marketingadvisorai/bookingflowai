import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { DesktopNav } from '@/components/desktop-nav';
import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { checkOnboardingComplete } from '@/lib/auth/check-onboarding';
import { SandboxBanner } from '@/components/sandbox-banner';
import { getDb } from '@/lib/db';
import { DashboardChatWidget } from '@/components/dashboard-chat/dashboard-chat-widget';
import { NudgeOverlay } from '@/components/nudge/nudge-overlay';
import { DashboardThemeProvider } from './_components/dashboard-theme';

type NavItem = {
  href: string;
  label: string;
  comingSoon?: boolean;
  separator?: string;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/games', label: 'Games' },
  { href: '/dashboard/rooms', label: 'Rooms' },
  { href: '/dashboard/schedules', label: 'Schedules' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/holds', label: 'Holds' },
  { href: '/dashboard/embed', label: 'Embed' },
  { href: '/dashboard/gift-cards', label: 'Gift Cards' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '#', label: '', separator: 'Agents' },
  { href: '/dashboard/agents/booking', label: 'Booking Agent', comingSoon: true },
  { href: '/dashboard/agents/voice', label: 'Voice Agent', comingSoon: true },
  { href: '/dashboard/agents/social', label: 'Social Manager', comingSoon: true },
  { href: '/dashboard/agents/reviews', label: 'Review Manager', comingSoon: true },
  { href: '/dashboard/agents/email', label: 'Email Manager', comingSoon: true },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Check authentication and get session
  let userId: string;
  let orgId: string;
  
  try {
    const session = await requireDashboardSession({ nextPath: '/dashboard' });
    userId = session.userId;
    orgId = session.orgId;
    
    // Check if onboarding is complete
    await checkOnboardingComplete(orgId, '/dashboard');
  } catch (error) {
    // If requireDashboardSession redirects, it throws
    // Let it bubble up
    throw error;
  }

  // Fetch user and org data for personalization
  const db = getDb();
  const [user, org] = await Promise.all([
    db.getUserById(userId),
    db.getOrg(orgId),
  ]);

  // User display name (prioritize firstName, fallback to email)
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  
  // User avatar (Google profile photo or initials fallback)
  const avatarUrl = user?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Org name
  const orgName = org?.name || 'My Business';

  return (
    <div className="dashboard-root min-h-screen bg-liquid-radial">
      <DashboardThemeProvider />
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <SandboxBanner />
        {/* Header */}
        <header className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <MobileNav items={NAV} />
            <div>
              <div className="text-xs text-muted-foreground md:text-sm">BookingFlow</div>
              <h1 className="text-base font-semibold md:text-xl">{orgName}</h1>
            </div>
          </div>

          {/* Right: Avatar + Theme toggle + Logout */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="h-8 w-8 rounded-full ring-2 ring-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4A00] text-sm font-semibold text-white ring-2 ring-border">
                  {avatarInitial}
                </div>
              )}
              <span className="hidden text-sm font-medium md:inline">{displayName}</span>
            </div>
            
            <ThemeToggle />
            <div className="hidden text-xs text-muted-foreground sm:block">v0 (auth enabled)</div>
            <form
              action={async () => {
                'use server';

                // Use the API logout route (which we verified works) instead of
                // directly touching DynamoDB here. This avoids Amplify SSR
                // edge cases that were causing logout to error in the UI.
                const { cookies, headers } = await import('next/headers');
                const c = await cookies();
                const h = await headers();

                const host = h.get('host');
                const token = c.get('bf_session')?.value ?? null;

                if (host && token) {
                  await fetch(`https://${host}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                      cookie: `bf_session=${token}`,
                    },
                    cache: 'no-store',
                  }).catch(() => null);
                }

                // Always clear cookie client-side.
                c.set('bf_session', '', {
                  path: '/',
                  expires: new Date(0),
                  httpOnly: true,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                });

                redirect('/login');
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Main layout: Sidebar + Content */}
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Desktop sidebar - hidden on mobile */}
          <Card className="glass hidden p-3 md:block">
            <DesktopNav items={NAV} />
          </Card>

          {/* Main content */}
          <div className="min-w-0">{children}</div>
        </div>

        {/* Dashboard AI Assistant */}
        <DashboardChatWidget orgName={orgName} />

        {/* AI Nudge System for Admin */}
        <NudgeOverlay orgId={orgId} mode="admin" pageType="admin" />
      </div>
    </div>
  );
}

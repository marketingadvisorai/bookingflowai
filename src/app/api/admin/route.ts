import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

function isAdmin(email: string): boolean {
  const adminEmail = process.env.BF_ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const [users, orgs, bookingCount] = await Promise.all([
    db.scanAllUsers(),
    db.scanAllOrgs(),
    db.countAllBookings(),
  ]);

  const enrichedOrgs = await Promise.all(
    orgs.map(async (o) => {
      const [games, orgBookings, revenue] = await Promise.all([
        db.listGames(o.orgId),
        db.countBookingsForOrg(o.orgId),
        db.getTotalRevenue(o.orgId),
      ]);
      return {
        orgId: o.orgId, name: o.name, timezone: o.timezone,
        plan: o.plan ?? 'free', stripeAccountId: o.stripeAccountId,
        stripeChargesEnabled: o.stripeChargesEnabled ?? false,
        businessName: o.businessName, website: o.website,
        phone: o.phone, city: o.city, country: o.country,
        businessType: o.businessType,
        gameCount: games.length, bookingCount: orgBookings, revenue,
      };
    })
  );

  const totalRevenue = enrichedOrgs.reduce((sum, o) => sum + (o.revenue ?? 0), 0);

  return NextResponse.json({
    ok: true,
    counts: {
      users: users.length, orgs: orgs.length,
      bookings: bookingCount, totalRevenue,
    },
    users: users.map((u) => ({
      userId: u.userId, email: u.email, orgId: u.orgId,
      role: u.role, createdAt: u.createdAt,
      authProvider: u.authProvider ?? 'password',
      firstName: u.firstName, lastName: u.lastName, phone: u.phone,
    })),
    orgs: enrichedOrgs,
  });
}

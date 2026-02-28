export type AdminUser = {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  createdAt: string;
  authProvider: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type AdminOrg = {
  orgId: string;
  name: string;
  timezone: string;
  plan: string;
  stripeAccountId?: string;
  stripeChargesEnabled: boolean;
  businessName?: string;
  website?: string;
  phone?: string;
  city?: string;
  country?: string;
  businessType?: string;
  gameCount: number;
  bookingCount: number;
  revenue: number;
};

export type AdminData = {
  ok: boolean;
  counts: {
    users: number;
    orgs: number;
    bookings: number;
    totalRevenue: number;
  };
  users: AdminUser[];
  orgs: AdminOrg[];
};

import { eq } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { orgs } from '../schema';
import type { Org } from '@/lib/booking/types';

function toOrg(row: typeof orgs.$inferSelect): Org {
  const org: Org = { orgId: row.orgId, name: row.name, timezone: row.timezone };
  if (row.serviceFeeBps != null) org.serviceFeeBps = row.serviceFeeBps;
  if (row.feeLabel) org.feeLabel = row.feeLabel;
  if (row.stripeAccountId) org.stripeAccountId = row.stripeAccountId;
  if (row.stripeChargesEnabled != null) org.stripeChargesEnabled = row.stripeChargesEnabled;
  if (row.stripePayoutsEnabled != null) org.stripePayoutsEnabled = row.stripePayoutsEnabled;
  if (row.stripeRequirements) org.stripeRequirements = row.stripeRequirements as Org['stripeRequirements'];
  if (row.stripeUpdatedAt) org.stripeUpdatedAt = row.stripeUpdatedAt;
  if (row.paymentMode) org.paymentMode = row.paymentMode as Org['paymentMode'];
  if (row.depositPercent != null) org.depositPercent = row.depositPercent;
  if (row.businessName) org.businessName = row.businessName;
  if (row.website) org.website = row.website;
  if (row.phone) org.phone = row.phone;
  if (row.address) org.address = row.address;
  if (row.city) org.city = row.city;
  if (row.state) org.state = row.state;
  if (row.country) org.country = row.country;
  if (row.locationCount) org.locationCount = row.locationCount;
  if (row.roomCount) org.roomCount = row.roomCount;
  if (row.businessType) org.businessType = row.businessType;
  if (row.plan) org.plan = row.plan;
  if (row.planCycle) org.planCycle = row.planCycle;
  if (row.onboardingComplete != null) org.onboardingComplete = row.onboardingComplete;
  if (row.promotions) org.promotions = row.promotions as Org['promotions'];
  if (row.giftCards) org.giftCards = row.giftCards as Org['giftCards'];
  return org;
}

function fromOrg(org: Org) {
  return {
    orgId: org.orgId, name: org.name, timezone: org.timezone,
    serviceFeeBps: org.serviceFeeBps ?? null, feeLabel: org.feeLabel ?? null,
    stripeAccountId: org.stripeAccountId ?? null,
    stripeChargesEnabled: org.stripeChargesEnabled ?? null,
    stripePayoutsEnabled: org.stripePayoutsEnabled ?? null,
    stripeRequirements: (org.stripeRequirements as Record<string, unknown>) ?? null,
    stripeUpdatedAt: org.stripeUpdatedAt ?? null,
    paymentMode: org.paymentMode ?? null, depositPercent: org.depositPercent ?? null,
    businessName: org.businessName ?? null, website: org.website ?? null,
    phone: org.phone ?? null, address: org.address ?? null,
    city: org.city ?? null, state: org.state ?? null, country: org.country ?? null,
    locationCount: org.locationCount ?? null, roomCount: org.roomCount ?? null,
    businessType: org.businessType ?? null, plan: org.plan ?? null,
    planCycle: org.planCycle ?? null, onboardingComplete: org.onboardingComplete ?? null,
    promotions: (org.promotions as unknown as Record<string, unknown>) ?? null,
    giftCards: (org.giftCards as unknown as Record<string, unknown>) ?? null,
  };
}

export function createOrgRepo(db: DrizzleDb) {
  return {
    async listOrgs(orgId?: string): Promise<Org[]> {
      if (orgId) {
        const rows = await db.select().from(orgs).where(eq(orgs.orgId, orgId));
        return rows.map(toOrg);
      }
      return (await db.select().from(orgs)).map(toOrg);
    },
    async getOrg(orgId: string): Promise<Org | null> {
      const rows = await db.select().from(orgs).where(eq(orgs.orgId, orgId));
      return rows[0] ? toOrg(rows[0]) : null;
    },
    async putOrg(org: Org): Promise<void> {
      const values = fromOrg(org);
      const { orgId: _, ...updateValues } = values;
      await db.insert(orgs).values(values)
        .onConflictDoUpdate({ target: orgs.orgId, set: updateValues });
    },
    async scanAllOrgs(): Promise<Org[]> {
      return (await db.select().from(orgs)).map(toOrg);
    },
  };
}

import { eq, and, desc, sql } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { bookings, holds } from '../schema';
import type { Booking, Hold } from '@/lib/booking/types';

function toHold(r: typeof holds.$inferSelect): Hold {
  const h: Hold = {
    orgId: r.orgId, holdId: r.holdId, gameId: r.gameId, roomId: r.roomId,
    bookingType: r.bookingType as Hold['bookingType'],
    startAt: r.startAt, endAt: r.endAt, players: r.players,
    status: r.status as Hold['status'],
    expiresAt: r.expiresAt, createdAt: r.createdAt,
  };
  if (r.currency) h.currency = r.currency;
  if (r.subtotalCents != null) h.subtotalCents = r.subtotalCents;
  if (r.processingFeeCents != null) h.processingFeeCents = r.processingFeeCents;
  if (r.totalCents != null) h.totalCents = r.totalCents;
  if (r.processingFeeBps != null) h.processingFeeBps = r.processingFeeBps;
  if (r.processingFeeLabel) h.processingFeeLabel = r.processingFeeLabel;
  if (r.promoCode) h.promoCode = r.promoCode;
  if (r.promoDiscountCents != null) h.promoDiscountCents = r.promoDiscountCents;
  if (r.discountedSubtotalCents != null) h.discountedSubtotalCents = r.discountedSubtotalCents;
  if (r.promoAppliedAt) h.promoAppliedAt = r.promoAppliedAt;
  if (r.bookingId) h.bookingId = r.bookingId;
  if (r.confirmedAt) h.confirmedAt = r.confirmedAt;
  if (r.customerName || r.customerPhone || r.customerEmail) {
    h.customer = { name: r.customerName ?? undefined, phone: r.customerPhone ?? undefined, email: r.customerEmail ?? undefined };
  }
  return h;
}

function fromHold(orgId: string, h: Hold) {
  return {
    orgId, holdId: h.holdId, gameId: h.gameId, roomId: h.roomId,
    bookingType: h.bookingType, startAt: h.startAt, endAt: h.endAt,
    players: h.players, status: h.status, expiresAt: h.expiresAt, createdAt: h.createdAt,
    currency: h.currency ?? null, subtotalCents: h.subtotalCents ?? null,
    processingFeeCents: h.processingFeeCents ?? null, totalCents: h.totalCents ?? null,
    processingFeeBps: h.processingFeeBps ?? null, processingFeeLabel: h.processingFeeLabel ?? null,
    promoCode: h.promoCode ?? null, promoDiscountCents: h.promoDiscountCents ?? null,
    discountedSubtotalCents: h.discountedSubtotalCents ?? null, promoAppliedAt: h.promoAppliedAt ?? null,
    bookingId: h.bookingId ?? null, confirmedAt: h.confirmedAt ?? null,
    customerName: h.customer?.name ?? null, customerPhone: h.customer?.phone ?? null,
    customerEmail: h.customer?.email ?? null,
  };
}

function toBooking(r: typeof bookings.$inferSelect): Booking {
  const b: Booking = {
    orgId: r.orgId, bookingId: r.bookingId, gameId: r.gameId, roomId: r.roomId,
    bookingType: r.bookingType as Booking['bookingType'], startAt: r.startAt, endAt: r.endAt,
    players: r.players, status: r.status as Booking['status'], createdAt: r.createdAt,
  };
  if (r.holdId) b.holdId = r.holdId;
  if (r.currency) b.currency = r.currency;
  if (r.subtotalCents != null) b.subtotalCents = r.subtotalCents;
  if (r.processingFeeCents != null) b.processingFeeCents = r.processingFeeCents;
  if (r.totalCents != null) b.totalCents = r.totalCents;
  if (r.promoCode) b.promoCode = r.promoCode;
  if (r.paymentStatus) b.paymentStatus = r.paymentStatus as Booking['paymentStatus'];
  if (r.paidCents != null) b.paidCents = r.paidCents;
  if (r.paidAt) b.paidAt = r.paidAt;
  if (r.stripeCheckoutSessionId) b.stripeCheckoutSessionId = r.stripeCheckoutSessionId;
  if (r.stripePaymentIntentId) b.stripePaymentIntentId = r.stripePaymentIntentId;
  if (r.paymentMode) b.paymentMode = r.paymentMode as Booking['paymentMode'];
  if (r.depositPercent != null) b.depositPercent = r.depositPercent;
  if (r.processingFeeBps != null) b.processingFeeBps = r.processingFeeBps;
  if (r.processingFeeLabel) b.processingFeeLabel = r.processingFeeLabel;
  if (r.remainingCents != null) b.remainingCents = r.remainingCents;
  if (r.customerName || r.customerPhone || r.customerEmail)
    b.customer = { name: r.customerName ?? undefined, phone: r.customerPhone ?? undefined, email: r.customerEmail ?? undefined };
  return b;
}

function fromBooking(orgId: string, b: Booking) {
  return {
    orgId, bookingId: b.bookingId, holdId: b.holdId ?? null,
    gameId: b.gameId, roomId: b.roomId, bookingType: b.bookingType,
    startAt: b.startAt, endAt: b.endAt, players: b.players,
    status: b.status, createdAt: b.createdAt,
    currency: b.currency ?? null, subtotalCents: b.subtotalCents ?? null,
    processingFeeCents: b.processingFeeCents ?? null, totalCents: b.totalCents ?? null,
    processingFeeBps: b.processingFeeBps ?? null, processingFeeLabel: b.processingFeeLabel ?? null,
    promoCode: b.promoCode ?? null, paymentStatus: b.paymentStatus ?? null,
    paidCents: b.paidCents ?? null, remainingCents: b.remainingCents ?? null,
    paidAt: b.paidAt ?? null, stripeCheckoutSessionId: b.stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: b.stripePaymentIntentId ?? null,
    paymentMode: b.paymentMode ?? null, depositPercent: b.depositPercent ?? null,
    customerName: b.customer?.name ?? null, customerPhone: b.customer?.phone ?? null,
    customerEmail: b.customer?.email ?? null,
  };
}

export function createBookingRepo(db: DrizzleDb) {
  async function getHoldImpl(orgId: string, holdId: string) {
    const rows = await db.select().from(holds).where(and(eq(holds.orgId, orgId), eq(holds.holdId, holdId)));
    return rows[0] ? toHold(rows[0]) : null;
  }
  async function putHoldImpl(orgId: string, hold: Hold) {
    const v = fromHold(orgId, hold);
    await db.insert(holds).values(v).onConflictDoUpdate({ target: [holds.orgId, holds.holdId], set: v });
  }

  return {
    async listHoldsForGame(orgId: string, gameId: string): Promise<Hold[]> {
      const rows = await db.select().from(holds).where(and(eq(holds.orgId, orgId), eq(holds.gameId, gameId)));
      return rows.map(toHold);
    },
    getHold: getHoldImpl,
    putHold: putHoldImpl,
    async extendHoldTTL(orgId: string, holdId: string, newExpiresAt: string): Promise<void> {
      await db.update(holds).set({ expiresAt: newExpiresAt })
        .where(and(eq(holds.orgId, orgId), eq(holds.holdId, holdId)));
    },
    async listBookingsForGame(orgId: string, gameId: string): Promise<Booking[]> {
      const rows = await db.select().from(bookings)
        .where(and(eq(bookings.orgId, orgId), eq(bookings.gameId, gameId)));
      return rows.map(toBooking);
    },
    async getBooking(orgId: string, bookingId: string): Promise<Booking | null> {
      const rows = await db.select().from(bookings)
        .where(and(eq(bookings.orgId, orgId), eq(bookings.bookingId, bookingId)));
      return rows[0] ? toBooking(rows[0]) : null;
    },
    async putBooking(orgId: string, booking: Booking): Promise<void> {
      const values = fromBooking(orgId, booking);
      await db.insert(bookings).values(values)
        .onConflictDoUpdate({ target: [bookings.orgId, bookings.bookingId], set: values });
    },
    async getRecentBookings(orgId: string, limit: number): Promise<Booking[]> {
      const rows = await db.select().from(bookings)
        .where(eq(bookings.orgId, orgId)).orderBy(desc(bookings.createdAt)).limit(limit);
      return rows.map(toBooking);
    },
    async countBookingsForOrg(orgId: string): Promise<number> {
      const r = await db.select({ count: sql<number>`count(*)::int` }).from(bookings)
        .where(eq(bookings.orgId, orgId));
      return r[0]?.count ?? 0;
    },
    async getTotalRevenue(orgId: string): Promise<number> {
      const r = await db.select({ total: sql<number>`coalesce(sum(total_cents), 0)::int` })
        .from(bookings).where(and(eq(bookings.orgId, orgId), eq(bookings.status, 'confirmed')));
      return r[0]?.total ?? 0;
    },
    async countAllBookings(): Promise<number> {
      const r = await db.select({ count: sql<number>`count(*)::int` }).from(bookings);
      return r[0]?.count ?? 0;
    },
  };
}

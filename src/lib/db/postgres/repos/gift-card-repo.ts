import { eq, and, desc } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { giftCards, giftCardTransactions } from '../schema';

export interface GiftCard {
  id: string;
  orgId: string;
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  currency: string;
  purchaserEmail?: string;
  purchaserName?: string;
  recipientEmail?: string;
  recipientName?: string;
  personalMessage?: string;
  deliveryDate?: string;
  deliveredAt?: string;
  expiresAt?: string;
  stripePaymentIntentId?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function createGiftCardRepo(db: DrizzleDb) {
  return {
    async create(card: Omit<GiftCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCard> {
      const now = new Date().toISOString();
      const values = {
        id: crypto.randomUUID(),
        ...card,
        currency: card.currency || 'usd',
        status: card.status || 'active',
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(giftCards).values(values);
      return values as GiftCard;
    },

    async getByCode(code: string): Promise<GiftCard | null> {
      const rows = await db.select().from(giftCards).where(eq(giftCards.code, code));
      return rows[0] ? (rows[0] as GiftCard) : null;
    },

    async getById(id: string): Promise<GiftCard | null> {
      const rows = await db.select().from(giftCards).where(eq(giftCards.id, id));
      return rows[0] ? (rows[0] as GiftCard) : null;
    },

    async listByOrg(orgId: string): Promise<GiftCard[]> {
      const rows = await db.select().from(giftCards)
        .where(eq(giftCards.orgId, orgId))
        .orderBy(desc(giftCards.createdAt));
      return rows as GiftCard[];
    },

    async updateBalance(id: string, newBalance: number): Promise<void> {
      const now = new Date().toISOString();
      await db.update(giftCards)
        .set({ remainingAmountCents: newBalance, updatedAt: now })
        .where(eq(giftCards.id, id));
    },

    async updateStatus(id: string, status: GiftCard['status']): Promise<void> {
      const now = new Date().toISOString();
      await db.update(giftCards)
        .set({ status, updatedAt: now })
        .where(eq(giftCards.id, id));
    },

    async redeem(
      cardId: string,
      amountCents: number,
      bookingId: string,
      note?: string
    ): Promise<{ success: boolean; newBalance: number }> {
      return await db.transaction(async (tx) => {
        const rows = await tx.select().from(giftCards).where(eq(giftCards.id, cardId));
        const card = rows[0];
        if (!card) throw new Error('Gift card not found');

        const newBalance = card.remainingAmountCents - amountCents;
        if (newBalance < 0) throw new Error('Insufficient balance');

        const now = new Date().toISOString();
        await tx.update(giftCards)
          .set({ 
            remainingAmountCents: newBalance, 
            updatedAt: now,
            status: newBalance === 0 ? 'redeemed' : card.status,
          })
          .where(eq(giftCards.id, cardId));

        await tx.insert(giftCardTransactions).values({
          id: crypto.randomUUID(),
          giftCardId: cardId,
          bookingId,
          amountCents: -amountCents,
          balanceAfterCents: newBalance,
          type: 'redemption',
          note,
          createdAt: now,
        });

        return { success: true, newBalance };
      });
    },
  };
}

import { eq, desc } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { giftCardTransactions } from '../schema';

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  bookingId?: string;
  amountCents: number;
  balanceAfterCents: number;
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment';
  note?: string;
  createdAt: string;
}

export function createGiftCardTransactionRepo(db: DrizzleDb) {
  return {
    async list(giftCardId: string): Promise<GiftCardTransaction[]> {
      const rows = await db.select()
        .from(giftCardTransactions)
        .where(eq(giftCardTransactions.giftCardId, giftCardId))
        .orderBy(desc(giftCardTransactions.createdAt));
      return rows as GiftCardTransaction[];
    },

    async create(tx: Omit<GiftCardTransaction, 'id' | 'createdAt'>): Promise<GiftCardTransaction> {
      const now = new Date().toISOString();
      const values = {
        id: crypto.randomUUID(),
        ...tx,
        createdAt: now,
      };
      await db.insert(giftCardTransactions).values(values);
      return values as GiftCardTransaction;
    },
  };
}

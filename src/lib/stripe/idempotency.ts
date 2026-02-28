import { sql } from 'drizzle-orm';
import { createDrizzle } from '@/lib/db/postgres/client';

/**
 * Claim a Stripe event for idempotent processing (PostgreSQL).
 * Returns true if claimed (first time), false if already processed.
 */
export async function claimStripeEvent(eventId: string): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return true; // fail open
    const db = createDrizzle();
    const now = new Date().toISOString();
    const result = await db.execute(
      sql`INSERT INTO stripe_events (event_id, processed_at) VALUES (${eventId}, ${now}) ON CONFLICT (event_id) DO NOTHING`
    );
    return (result.rowCount ?? 0) > 0;
  } catch (e) {
    console.error('[stripe/idempotency] claimStripeEvent error:', e instanceof Error ? e.message : e);
    return true; // fail open
  }
}

/**
 * Release a claimed event so Stripe can retry on processing failure.
 */
export async function releaseStripeEvent(eventId: string): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) return;
    const db = createDrizzle();
    await db.execute(sql`DELETE FROM stripe_events WHERE event_id = ${eventId}`);
  } catch { /* best effort */ }
}

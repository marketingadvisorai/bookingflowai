import { sql } from 'drizzle-orm';

/**
 * Claim a Stripe event for processing (PostgreSQL version).
 * Returns true if this is the first time we've seen this event.
 * Uses INSERT ... ON CONFLICT DO NOTHING for atomic idempotency.
 */
export async function claimStripeEventPg(eventId: string): Promise<boolean> {
  try {
    // Dynamic import to avoid pulling pg when using DynamoDB
    const { getPool } = await import('@/lib/db/postgres/client');
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO stripe_events (event_id, processed_at) VALUES ($1, $2) ON CONFLICT (event_id) DO NOTHING`,
      [eventId, new Date().toISOString()],
    );
    // rowCount = 1 means we inserted (first claim), 0 means conflict (already processed)
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    console.error('[idempotency] Failed to claim event, failing open:', err);
    return true; // Fail open — don't break webhooks
  }
}

/**
 * Release a claim (for retry on processing errors).
 */
export async function releaseStripeEventPg(eventId: string): Promise<void> {
  try {
    const { getPool } = await import('@/lib/db/postgres/client');
    const pool = getPool();
    await pool.query(`DELETE FROM stripe_events WHERE event_id = $1`, [eventId]);
  } catch {
    // Best effort
  }
}

/**
 * Abandoned holds tracker — stubbed (database removed).
 * Holds already have expires_at in PostgreSQL; cleanup is a simple SQL query.
 */

export type AbandonedHold = {
  orgId: string;
  holdId: string;
  gameId: string;
  date: string;
  time: string;
  customerEmail: string;
  customerName: string;
  holdCreatedAt: string;
  expiredAt: string;
};

/**
 * Track an abandoned hold for future cart-abandonment email campaigns.
 * Currently a no-op — holds expire naturally via PostgreSQL expires_at.
 */
export function trackAbandonedHold(_data: AbandonedHold): void {
  // Stubbed: holds expire naturally via PostgreSQL expires_at
}

/**
 * Abandoned holds tracker — stubbed (DynamoDB removed).
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
export function trackAbandonedHold(data: AbandonedHold): void {
  console.log('[abandoned-holds] tracked (no-op):', data.holdId);
}

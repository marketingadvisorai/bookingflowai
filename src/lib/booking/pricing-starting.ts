import type { Game } from '@/lib/booking/types';

/**
 * Compute the "starting at" price for a game (lowest per-person price across all tiers).
 * Used for marketing displays like "Starting at $25/person".
 * Returns null if no valid pricing is configured.
 */
export function computeStartingUnitAmountCents(game: Game): number | null {
  const tiers = game.pricingTiers ?? [];
  if (tiers.length === 0) return null;
  
  // Find lowest per-person price across tiers
  let min = Number.POSITIVE_INFINITY;
  for (const t of tiers) {
    if (typeof t.unitAmountCents !== 'number') continue;
    // Skip invalid prices (negative or zero)
    if (t.unitAmountCents <= 0) continue;
    if (t.unitAmountCents < min) min = t.unitAmountCents;
  }
  
  return Number.isFinite(min) && min > 0 ? min : null;
}

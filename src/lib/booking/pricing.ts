import type { Game, Org, PricingTier } from '@/lib/booking/types';

function chooseTier(players: number, tiers: PricingTier[]): PricingTier | null {
  // Prefer the most specific tier by choosing the tier with the highest minPlayers that matches.
  const matches = tiers.filter((t) => players >= t.minPlayers && (t.maxPlayers == null || players <= t.maxPlayers));
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.minPlayers - a.minPlayers);
  return matches[0] ?? null;
}

export function computeHoldPricing(input: { org: Org | null; game: Game; players: number }) {
  // Validate inputs
  if (input.players < 1) {
    return {
      ok: false as const,
      error: 'invalid_players' as const,
      message: 'Player count must be at least 1.',
    };
  }

  if (!Number.isInteger(input.players)) {
    return {
      ok: false as const,
      error: 'invalid_players' as const,
      message: 'Player count must be a whole number.',
    };
  }

  const currency = (input.game.pricingCurrency ?? 'usd').toLowerCase();

  const tiers = input.game.pricingTiers ?? [];
  
  if (tiers.length === 0) {
    return {
      ok: false as const,
      error: 'pricing_not_configured' as const,
      message: 'Pricing hasn\'t been set up for this game yet. Please contact the venue for pricing information.',
    };
  }

  const tier = chooseTier(input.players, tiers);
  if (!tier) {
    // Find closest tier to provide helpful error
    const allMinPlayers = tiers.map(t => t.minPlayers);
    const allMaxPlayers = tiers.map(t => t.maxPlayers).filter(Boolean) as number[];
    const minSupported = Math.min(...allMinPlayers);
    const maxSupported = allMaxPlayers.length > 0 ? Math.max(...allMaxPlayers) : input.game.maxPlayers;

    return {
      ok: false as const,
      error: 'pricing_not_configured' as const,
      message: `Pricing is configured for ${minSupported}-${maxSupported} players. Your group of ${input.players} is outside this range.`,
    };
  }

  const unitAmountCents = tier.unitAmountCents;

  // Validate pricing tier data
  if (!Number.isFinite(unitAmountCents) || unitAmountCents < 0) {
    return {
      ok: false as const,
      error: 'invalid_pricing_data' as const,
      message: 'The pricing configuration for this game is invalid. Please contact the venue.',
    };
  }

  const subtotalCents = unitAmountCents * input.players;

  // Validate subtotal doesn't overflow or become invalid
  if (!Number.isFinite(subtotalCents) || subtotalCents < 0 || subtotalCents > 99999999) {
    return {
      ok: false as const,
      error: 'invalid_total' as const,
      message: 'The calculated price is invalid. Please contact the venue.',
    };
  }

  const bps = input.org?.serviceFeeBps ?? 0;
  const processingFeeCents = Math.round((subtotalCents * bps) / 10000);
  const totalCents = subtotalCents + processingFeeCents;

  // Final sanity check
  if (!Number.isFinite(totalCents) || totalCents < 0) {
    return {
      ok: false as const,
      error: 'invalid_total' as const,
      message: 'The calculated total is invalid. Please contact the venue.',
    };
  }

  return {
    ok: true as const,
    currency,
    unitAmountCents,
    subtotalCents,
    processingFeeCents,
    totalCents,
    processingFeeBps: bps,
    processingFeeLabel: input.org?.feeLabel ?? 'Booking Fee',
  };
}

export type BookingType = 'private' | 'public';

export type OrgPromotion = {
  code: string; // normalized uppercase
  type: 'percent' | 'fixed';
  percentOff?: number; // 1..100
  amountOffCents?: number; // >=1
  currency?: string; // e.g. "usd"
  stripeCouponId: string;
  stripePromotionCodeId: string;
  enabled: boolean;
  createdAt: string; // ISO
  isGiftCard?: boolean; // true if this promo was created from a gift card
};

export type OrgGiftCard = {
  code: string;
  amount: number; // in cents
  remainingBalance: number; // in cents
  currency: string; // e.g. "usd"
  stripeCouponId: string;
  stripePromotionCodeId: string;
  status: 'active' | 'redeemed' | 'expired';
  createdAt: string; // ISO
  redeemedAt?: string;
  redeemedBy?: string; // email
};

export type Org = {
  orgId: string;
  name: string;
  timezone: string; // IANA tz, e.g. "Asia/Dhaka"

  promotions?: OrgPromotion[];
  giftCards?: OrgGiftCard[];

  // Tenant-configurable customer-facing fee (added on top of subtotal)
  // 1.9% => 190 bps
  serviceFeeBps?: number;
  feeLabel?: string; // e.g. "Processing Fee"

  // Stripe Connect (Destination charges)
  stripeAccountId?: string; // acct_...

  // Stripe Connect status snapshot (updated via webhook)
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeRequirements?: {
    currentlyDue?: string[];
    eventuallyDue?: string[];
    pastDue?: string[];
  };
  stripeUpdatedAt?: string; // ISO

  // Payments configuration
  paymentMode?: 'full' | 'deposit';
  depositPercent?: number; // e.g. 50

  // Business details (from onboarding)
  businessName?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  locationCount?: string;
  roomCount?: string;
  businessType?: string;
  plan?: string; // 'free' | 'pro' | 'business'
  planCycle?: string; // 'monthly' | 'yearly'
  onboardingComplete?: boolean;
};

export type PricingTier = {
  minPlayers: number;
  maxPlayers?: number; // undefined => no upper bound
  unitAmountCents: number; // per-player
  label?: string; // e.g. "Adult", "Child", "Veteran"
};

export type Game = {
  orgId: string;
  gameId: string;
  name: string;
  durationMins: number;
  bufferMins: number;
  slotIntervalMins: number;
  minPlayers: number;
  maxPlayers: number;
  allowPrivate: boolean;
  allowPublic: boolean;

  // Pricing
  pricingModel?: 'per_person';
  pricingCurrency?: string; // default "usd"
  pricingTiers?: PricingTier[];

  // Marketing / UI (optional)
  heroImageUrl?: string;
  heroImageThumbUrl?: string; // 16:9 optimized thumb for cards
  previewVideoUrl?: string; // mp4/webm
  galleryImageUrls?: string[];
};

export type Room = {
  orgId: string;
  roomId: string;
  gameId: string;
  name: string;
  maxPlayers: number;
  enabled: boolean;
};

export type OpeningHours = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  start: string; // "HH:MM" local time
  end: string; // "HH:MM" local time
};

export type Schedule = {
  orgId: string;
  scheduleId: string;
  gameId: string;
  openingHours: OpeningHours[];
};

export type HoldStatus = 'active' | 'expired' | 'confirmed' | 'canceled';

export type Hold = {
  orgId: string;
  holdId: string;
  gameId: string;
  roomId: string;
  bookingType: BookingType;
  startAt: string; // ISO
  endAt: string; // ISO
  players: number;
  status: HoldStatus;
  expiresAt: string; // ISO
  createdAt: string; // ISO

  // Pricing snapshot at time of hold creation (server-side source of truth)
  currency?: string; // e.g. "usd"
  subtotalCents?: number;
  processingFeeCents?: number;
  totalCents?: number;
  processingFeeBps?: number;
  processingFeeLabel?: string;

  // Promotions
  promoCode?: string;
  promoDiscountCents?: number;
  discountedSubtotalCents?: number;
  promoAppliedAt?: string; // ISO

  // Populated after confirmation (idempotency + refresh-safe “done” screen)
  bookingId?: string;
  confirmedAt?: string; // ISO

  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

export type BookingStatus = 'confirmed' | 'canceled';

export type BookingPaymentStatus = 'deposit_paid' | 'paid_full' | 'unpaid';

export type Booking = {
  orgId: string;
  bookingId: string;
  holdId?: string;
  gameId: string;
  roomId: string;
  bookingType: BookingType;
  startAt: string;
  endAt: string;
  players: number;
  status: BookingStatus;
  createdAt: string;

  // Pricing snapshot from hold
  currency?: string;
  subtotalCents?: number;
  processingFeeCents?: number;
  totalCents?: number;
  processingFeeBps?: number;
  processingFeeLabel?: string;

  // Promotions (Stripe-first later)
  promoCode?: string;

  // Payments
  paymentStatus?: BookingPaymentStatus;
  paidCents?: number;
  remainingCents?: number;
  paidAt?: string; // ISO
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paymentMode?: 'full' | 'deposit';
  depositPercent?: number;

  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

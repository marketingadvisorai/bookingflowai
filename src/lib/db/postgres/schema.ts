import { pgTable, text, integer, boolean, jsonb, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const t = text, i = integer, b = boolean, j = jsonb;

export const orgs = pgTable('orgs', {
  orgId: t('org_id').primaryKey(), name: t('name').notNull(), timezone: t('timezone').notNull(),
  serviceFeeBps: i('service_fee_bps'), feeLabel: t('fee_label'),
  stripeAccountId: t('stripe_account_id'), stripeChargesEnabled: b('stripe_charges_enabled'),
  stripePayoutsEnabled: b('stripe_payouts_enabled'), stripeRequirements: j('stripe_requirements'),
  stripeUpdatedAt: t('stripe_updated_at'), paymentMode: t('payment_mode'), depositPercent: i('deposit_percent'),
  businessName: t('business_name'), website: t('website'), phone: t('phone'),
  address: t('address'), city: t('city'), state: t('state'), country: t('country'),
  locationCount: t('location_count'), roomCount: t('room_count'), businessType: t('business_type'),
  plan: t('plan'), planCycle: t('plan_cycle'), onboardingComplete: b('onboarding_complete'),
  promotions: j('promotions'), giftCards: j('gift_cards'),
});

export const games = pgTable('games', {
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  gameId: t('game_id').notNull(), name: t('name').notNull(),
  durationMins: i('duration_mins').notNull(), bufferMins: i('buffer_mins').notNull(),
  slotIntervalMins: i('slot_interval_mins').notNull(),
  minPlayers: i('min_players').notNull(), maxPlayers: i('max_players').notNull(),
  allowPrivate: b('allow_private').notNull(), allowPublic: b('allow_public').notNull(),
  pricingModel: t('pricing_model'), pricingCurrency: t('pricing_currency'), pricingTiers: j('pricing_tiers'),
  heroImageUrl: t('hero_image_url'), heroImageThumbUrl: t('hero_image_thumb_url'),
  previewVideoUrl: t('preview_video_url'), galleryImageUrls: j('gallery_image_urls'),
}, (t) => [primaryKey({ columns: [t.orgId, t.gameId] })]);

export const rooms = pgTable('rooms', {
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  roomId: t('room_id').notNull(), gameId: t('game_id').notNull(),
  name: t('name').notNull(), maxPlayers: i('max_players').notNull(),
  enabled: b('enabled').notNull().default(true),
}, (t) => [primaryKey({ columns: [t.orgId, t.roomId] })]);

export const schedules = pgTable('schedules', {
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  scheduleId: t('schedule_id').notNull(), gameId: t('game_id').notNull(),
  openingHours: j('opening_hours').notNull(),
}, (t) => [primaryKey({ columns: [t.orgId, t.scheduleId] })]);

export const holds = pgTable('holds', {
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  holdId: t('hold_id').notNull(), gameId: t('game_id').notNull(), roomId: t('room_id').notNull(),
  bookingType: t('booking_type').notNull(), startAt: t('start_at').notNull(), endAt: t('end_at').notNull(),
  players: i('players').notNull(), status: t('status').notNull().default('active'),
  expiresAt: t('expires_at').notNull(), createdAt: t('created_at').notNull(),
  currency: t('currency'), subtotalCents: i('subtotal_cents'),
  processingFeeCents: i('processing_fee_cents'), totalCents: i('total_cents'),
  processingFeeBps: i('processing_fee_bps'), processingFeeLabel: t('processing_fee_label'),
  promoCode: t('promo_code'), promoDiscountCents: i('promo_discount_cents'),
  discountedSubtotalCents: i('discounted_subtotal_cents'), promoAppliedAt: t('promo_applied_at'),
  bookingId: t('booking_id'), confirmedAt: t('confirmed_at'),
  customerName: t('customer_name'), customerPhone: t('customer_phone'), customerEmail: t('customer_email'),
}, (t) => [
  primaryKey({ columns: [t.orgId, t.holdId] }),
  index('holds_org_game_idx').on(t.orgId, t.gameId),
  index('holds_active_idx').on(t.orgId, t.status).where(sql`status = 'active'`),
  index('holds_expires_idx').on(t.expiresAt).where(sql`status = 'active'`),
  index('holds_org_room_start_idx').on(t.orgId, t.roomId, t.startAt),
]);

export const bookings = pgTable('bookings', {
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  bookingId: t('booking_id').notNull(), holdId: t('hold_id'),
  gameId: t('game_id').notNull(), roomId: t('room_id').notNull(),
  bookingType: t('booking_type').notNull(), startAt: t('start_at').notNull(), endAt: t('end_at').notNull(),
  players: i('players').notNull(), status: t('status').notNull().default('confirmed'),
  createdAt: t('created_at').notNull(), currency: t('currency'),
  subtotalCents: i('subtotal_cents'), processingFeeCents: i('processing_fee_cents'),
  totalCents: i('total_cents'), processingFeeBps: i('processing_fee_bps'),
  processingFeeLabel: t('processing_fee_label'), promoCode: t('promo_code'),
  paymentStatus: t('payment_status'), paidCents: i('paid_cents'), remainingCents: i('remaining_cents'),
  paidAt: t('paid_at'), stripeCheckoutSessionId: t('stripe_checkout_session_id'),
  stripePaymentIntentId: t('stripe_payment_intent_id'),
  paymentMode: t('payment_mode'), depositPercent: i('deposit_percent'),
  customerName: t('customer_name'), customerPhone: t('customer_phone'), customerEmail: t('customer_email'),
}, (t) => [
  primaryKey({ columns: [t.orgId, t.bookingId] }),
  index('bookings_org_game_idx').on(t.orgId, t.gameId),
  index('bookings_org_created_idx').on(t.orgId, t.createdAt),
  index('bookings_org_room_start_idx').on(t.orgId, t.roomId, t.startAt),
]);

export const users = pgTable('users', {
  userId: t('user_id').primaryKey(),
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  email: t('email').notNull(), passwordHash: t('password_hash').notNull().default(''),
  role: t('role').notNull().default('owner'), createdAt: t('created_at').notNull(),
  authProvider: t('auth_provider'), firstName: t('first_name'), lastName: t('last_name'),
  phone: t('phone'), picture: t('picture'), locale: t('locale'),
  lastLoginAt: t('last_login_at'), loginCount: i('login_count'),
}, (t) => [uniqueIndex('users_email_idx').on(t.email)]);

export const sessions = pgTable('sessions', {
  sessionToken: t('session_token').primaryKey(),
  userId: t('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  orgId: t('org_id').notNull(), createdAt: t('created_at').notNull(), expiresAt: t('expires_at').notNull(),
}, (t) => [index('sessions_user_idx').on(t.userId)]);

// Stripe webhook idempotency
export const stripeEvents = pgTable('stripe_events', {
  eventId: t('event_id').primaryKey(),
  processedAt: t('processed_at').notNull(),
});

// Gift cards
export const giftCards = pgTable('gift_cards', {
  id: t('id').primaryKey(),
  orgId: t('org_id').notNull().references(() => orgs.orgId, { onDelete: 'cascade' }),
  code: t('code').notNull(),
  initialAmountCents: i('initial_amount_cents').notNull(),
  remainingAmountCents: i('remaining_amount_cents').notNull(),
  currency: t('currency').default('usd'),
  purchaserEmail: t('purchaser_email'),
  purchaserName: t('purchaser_name'),
  recipientEmail: t('recipient_email'),
  recipientName: t('recipient_name'),
  personalMessage: t('personal_message'),
  deliveryDate: t('delivery_date'),
  deliveredAt: t('delivered_at'),
  expiresAt: t('expires_at'),
  stripePaymentIntentId: t('stripe_payment_intent_id'),
  status: t('status').default('active'),
  createdAt: t('created_at').notNull(),
  updatedAt: t('updated_at').notNull(),
}, (t) => [
  uniqueIndex('gift_cards_code_idx').on(t.code),
  index('gift_cards_org_idx').on(t.orgId),
]);

export const giftCardTransactions = pgTable('gift_card_transactions', {
  id: t('id').primaryKey(),
  giftCardId: t('gift_card_id').notNull(),
  bookingId: t('booking_id'),
  amountCents: i('amount_cents').notNull(),
  balanceAfterCents: i('balance_after_cents').notNull(),
  type: t('type').notNull(),
  note: t('note'),
  createdAt: t('created_at').notNull(),
}, (t) => [
  index('gift_card_transactions_card_idx').on(t.giftCardId),
]);

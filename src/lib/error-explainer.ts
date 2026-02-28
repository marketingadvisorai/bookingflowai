/**
 * Simple error explainer with static map + AI fallback
 * Uses Together.ai Llama 3.2 3B for unmapped errors
 */
import Together from 'together-ai';

/* ── Static Error Maps ──────────────────────────────────────────────── */

const CUSTOMER_ERRORS: Record<string, string> = {
  // Holds & bookings
  hold_expired: 'Your reservation hold has expired. Please select a new time and try again.',
  hold_not_found: 'Your reservation could not be found. Please start a new booking.',
  hold_not_active: 'Your reservation is no longer active. Please start a new booking.',
  slot_unavailable: 'This time slot is no longer available. Please choose another time.',
  slot_capacity_exceeded: 'This time slot is fully booked. Please select a different time.',
  capacity_exceeded: 'This time slot is fully booked. Please select a different time.',
  booking_not_found: 'Your booking could not be found. Please check your confirmation email.',
  booking_type_not_allowed: 'This booking type is not available. Please try a different option.',
  fallback_booking_failed: 'We couldn\'t complete your booking. Please contact support with your payment confirmation.',
  
  // Payment & Stripe
  payment_failed: 'Payment could not be processed. Please check your card details and try again.',
  payment_required: 'Payment is required to complete this booking.',
  stripe_not_configured: 'Online booking is temporarily unavailable. Please contact the venue directly.',
  stripe_not_connected: 'Online booking is temporarily unavailable. Please contact the venue directly.',
  connect_urls_not_configured: 'Online booking setup is incomplete. Please contact the venue.',
  processing_error: 'We couldn\'t process your request. Please try again or contact support.',
  
  // Validation
  invalid_party_size: 'The number of players is not valid for this game. Please adjust your party size.',
  invalid_request: 'Please check your information and try again.',
  invalid_data: 'Some information is incorrect. Please review your details and try again.',
  invalid_body: 'Please check your information and try again.',
  invalid_time_window: 'The selected time is not valid. Please choose a different time.',
  invalid_tracking: 'Tracking information is invalid. This won\'t affect your booking.',
  invalid_signature: 'Security verification failed. Please refresh and try again.',
  invalid_org_id: 'This venue could not be found. Please check the link and try again.',
  missing_fields: 'Please fill in all required fields.',
  missing_price: 'Pricing information is unavailable. Please contact the venue.',
  missing_metadata_for_fallback: 'Some booking information is missing. Please contact support.',
  missing_signature: 'Security verification is missing. Please refresh and try again.',
  
  // Resources not found
  game_not_found: 'This experience could not be found. Please check the link and try again.',
  room_not_found: 'The selected room is not available. Please try a different time.',
  schedule_not_found: 'No schedule found for this experience. Please contact the venue.',
  org_not_found: 'This venue could not be found. Please check the link and try again.',
  
  // Promotions
  promo_not_found: 'This promo code is not valid. Please check the code and try again.',
  promo_invalid_coupon: 'This promo code cannot be applied. Please check the terms.',
  promo_currency_mismatch: 'This promo code cannot be used with this booking.',
  promo_min_total_not_met: 'This promo code requires a higher booking total.',
  promo_unsupported: 'This promo code cannot be applied to your booking.',
  
  // Chat
  chat_error: 'Couldn\'t send your message. Please try again.',
  messages_required: 'Please enter a message before sending.',
  message_too_long: 'Your message is too long. Please shorten it and try again.',
  too_many_messages: 'You\'re sending messages too quickly. Please slow down.',
  invalid_message_format: 'Message format is incorrect. Please try again.',
  invalid_message_role: 'Message type is incorrect. Please refresh and try again.',
  
  // Admin/system messages (still user-friendly)
  game_exists: 'An experience with this name already exists.',
  room_exists: 'A room with this name already exists.',
  schedule_exists: 'A schedule for this experience already exists.',
  too_large: 'The uploaded file is too large. Please use a smaller file.',
  unauthorized: 'You don\'t have permission to access this. Please log in.',
  
  // System
  rate_limited: 'You\'re browsing too fast! Please wait a moment and try again.',
  server_error: 'Something went wrong. Please try again in a moment.',
  session_not_found: 'Your session has expired. Please start over.',
};

const ADMIN_ERRORS: Record<string, string> = {
  // Holds & bookings
  hold_expired: 'Hold TTL expired (default 30min). Customer needs to rebook. Check BF_HOLD_TTL_MINUTES env var.',
  hold_not_found: 'Hold not found in DynamoDB. May be expired, deleted, or invalid holdId.',
  hold_not_active: 'Hold status is not "active". Check hold.status (confirmed/expired/cancelled).',
  slot_unavailable: 'DynamoDB transaction rolled back due to slot conflict (another hold/booking).',
  slot_capacity_exceeded: 'Public booking capacity exceeded room.maxPlayers. Adjust maxPlayers or time slots.',
  capacity_exceeded: 'Public booking capacity exceeded room.maxPlayers. Adjust maxPlayers or time slots.',
  booking_not_found: 'Booking not found in DynamoDB. Invalid bookingId or booking may have been deleted.',
  booking_type_not_allowed: 'Game.allowPrivate or game.allowPublic is false. Check game configuration.',
  fallback_booking_failed: 'Stripe webhook received payment but hold not found - fallback booking creation failed. Manual intervention required.',
  
  // Payment & Stripe
  payment_failed: 'Stripe payment failed. Check Stripe dashboard for details (card declined, insufficient funds, etc.).',
  payment_required: 'Attempted to confirm booking without payment on Stripe-enabled org. Must use Stripe Checkout.',
  stripe_not_configured: 'Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env vars.',
  stripe_not_connected: 'Org missing stripeAccountId. Complete Stripe Connect onboarding first.',
  connect_urls_not_configured: 'Stripe Connect return URLs not configured. Check onboarding flow.',
  processing_error: 'Generic processing error during Stripe operation. Check logs for details.',
  
  // Validation
  invalid_party_size: 'Players count outside [game.minPlayers, min(game.maxPlayers, room.maxPlayers)]. Check game/room config.',
  invalid_request: 'Request failed Zod validation. Check @/lib/booking/validators.ts schemas.',
  invalid_data: 'Request data failed validation. Check request body structure and types.',
  invalid_body: 'Request body malformed or missing. Check Content-Type and JSON structure.',
  invalid_time_window: 'Requested time outside game schedule or opening hours. Check schedule configuration.',
  invalid_tracking: 'Missing or malformed orgId/gameId in tracking call. Check event data.',
  invalid_signature: 'Webhook signature verification failed. Check STRIPE_WEBHOOK_SECRET or signature header.',
  invalid_org_id: 'OrgId contains invalid characters. Must match ^[a-zA-Z0-9_-]+$.',
  invalid_kind: 'Invalid event kind in tracking/analytics. Check allowed event types.',
  invalid_min_max_players: 'Game minPlayers > maxPlayers. Fix game configuration.',
  invalid_message_format: 'Chat message format invalid. Check message structure.',
  invalid_message_role: 'Chat message role must be "user" or "assistant". Check request.',
  missing_fields: 'Required fields missing in request body. Check schema definitions.',
  missing_price: 'Game missing pricing configuration. Set pricingModel and pricingTiers.',
  missing_metadata_for_fallback: 'Stripe webhook missing metadata needed for fallback booking creation.',
  missing_signature: 'Stripe webhook missing stripe-signature header. Check webhook configuration.',
  
  // Resources not found
  game_not_found: 'Game not found in DynamoDB for given orgId+gameId. Check database.',
  room_not_found: 'Room not found in DynamoDB. May have been deleted or invalid roomId.',
  schedule_not_found: 'No schedule found for game. Create schedule in dashboard first.',
  org_not_found: 'Org not found in DynamoDB. Invalid orgId or org deleted.',
  
  // Promotions
  promo_not_found: 'Promo code not found in org.promotions. Check promo code spelling.',
  promo_invalid_coupon: 'Stripe coupon invalid or expired. Check Stripe dashboard.',
  promo_currency_mismatch: 'Promo currency doesn\'t match booking currency. Check coupon configuration.',
  promo_min_total_not_met: 'Booking total below promo minimum. Check coupon minimum_amount.',
  promo_unsupported: 'Promo type not supported. Currently only "percent" and "fixed" are supported.',
  
  // Chat
  chat_error: 'Together.ai API error during chat completion. Check logs and API status.',
  messages_required: 'Empty messages array in chat request. Must include at least one message.',
  message_too_long: 'Message exceeds MAX_MESSAGE_LENGTH (default 2000 chars). Check client validation.',
  too_many_messages: 'Messages array exceeds MAX_MESSAGES_PER_REQUEST (default 50). Check client.',
  
  // Admin/resource conflicts
  game_exists: 'Game with this gameId already exists for org. Use PUT to update existing game.',
  room_exists: 'Room with this roomId already exists for org. Use PUT to update existing room.',
  schedule_exists: 'Schedule with this scheduleId already exists for org. Use PUT to update.',
  too_large: 'Request body exceeds size limit. Check Next.js body size limits.',
  unauthorized: 'Missing or invalid authorization. Check authentication middleware.',
  
  // System
  rate_limited: 'IP-based rate limit exceeded. Current limits: holds 5/min, checkout 3/min, chat 10/min. Check @/lib/http/rate-limit.ts.',
  server_error: 'Unhandled exception. Check server logs for stack trace.',
  session_not_found: 'Session expired or invalid sessionId. Default TTL is 24h.',
};

/* ── Together.ai Client ─────────────────────────────────────────────── */

let _together: Together | null = null;

function getTogetherClient(): Together | null {
  if (!process.env.TOGETHER_AI_API_KEY) return null;
  if (!_together) _together = new Together({ apiKey: process.env.TOGETHER_AI_API_KEY });
  return _together;
}

/* ── Main Explainer ─────────────────────────────────────────────────── */

export async function explainError(
  error: string,
  audience: 'customer' | 'admin' = 'customer',
  context?: Record<string, unknown>
): Promise<string> {
  // Try static map first
  const staticMap = audience === 'customer' ? CUSTOMER_ERRORS : ADMIN_ERRORS;
  const staticMsg = staticMap[error];
  if (staticMsg) return staticMsg;

  // Fallback to AI for unmapped errors
  const client = getTogetherClient();
  if (!client) {
    return audience === 'customer'
      ? 'Something went wrong. Please try again or contact support.'
      : `Error: ${error} (no explanation available - TOGETHER_AI_API_KEY not configured)`;
  }

  try {
    const prompt = buildPrompt(error, audience, context);
    const response = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const explanation = response.choices[0]?.message?.content?.trim();
    return explanation || staticMap.server_error || 'An error occurred.';
  } catch (err) {
    console.error('[error-explainer] AI call failed:', err);
    return staticMap.server_error || 'An error occurred.';
  }
}

/* ── Prompt Builder ─────────────────────────────────────────────────── */

function buildPrompt(
  error: string,
  audience: 'customer' | 'admin',
  context?: Record<string, unknown>
): string {
  const safeContext = context ? sanitizeContext(context, audience) : {};
  const contextStr = Object.keys(safeContext).length > 0 ? `\nContext: ${JSON.stringify(safeContext)}` : '';

  if (audience === 'customer') {
    return `Explain this booking error to a customer in 1-2 simple sentences. Be warm and helpful, suggest next step. No technical jargon.

Error: ${error}${contextStr}

Explanation:`;
  } else {
    return `Explain this booking system error to an admin in 2-3 sentences. Include likely cause and fix suggestion.

Error: ${error}${contextStr}

Explanation:`;
  }
}

function sanitizeContext(context: Record<string, unknown>, audience: 'customer' | 'admin'): Record<string, unknown> {
  if (audience === 'admin') {
    // Admin: remove secrets but keep everything else
    const safe = { ...context };
    for (const key of Object.keys(safe)) {
      if (key.toLowerCase().match(/secret|key|token|password/)) {
        safe[key] = '[REDACTED]';
      }
    }
    return safe;
  } else {
    // Customer: only safe fields
    const safe: Record<string, unknown> = {};
    const allowed = ['gameId', 'roomId', 'players', 'bookingType'];
    for (const key of allowed) {
      if (context[key] !== undefined) safe[key] = context[key];
    }
    return safe;
  }
}

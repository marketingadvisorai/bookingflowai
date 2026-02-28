export type BookingType = 'private' | 'public';

export type Slot = {
  startAt: string;
  endAt: string;
  roomId: string;
  roomName?: string;
  available: boolean;
  remainingPlayers?: number;
};

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function yyyyMmDdLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function scrollToSection(sectionId: string, behavior: 'smooth' | 'instant' = 'smooth') {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
}

/** Map raw API error codes to user-friendly messages. */
export function friendlyError(code: string | null | undefined): string {
  if (!code) return 'Something went wrong. Please try again.';
  const map: Record<string, string> = {
    // Holds & bookings
    hold_expired: 'Your hold has expired. Please select a new time.',
    hold_not_found: 'Your reservation was not found. Please select a new time.',
    hold_not_active: 'Your reservation is no longer active. Please start a new booking.',
    slot_unavailable: 'This time slot is no longer available. Please pick another.',
    slot_capacity_exceeded: 'This time slot is fully booked. Please select a different time.',
    booking_not_found: 'Your booking could not be found. Please check your confirmation email.',
    booking_type_not_allowed: 'This booking type is not available. Try the other option.',
    fallback_booking_failed: 'We couldn\'t complete your booking. Please contact support.',
    
    // Payment & Stripe
    payment_required: 'Payment is required to complete this booking.',
    payment_failed: 'Payment could not be processed. Please check your card and try again.',
    stripe_not_configured: 'Online payment is not set up for this venue. Please contact them directly.',
    stripe_not_connected: 'Online payment is not set up for this venue. Please contact them directly.',
    connect_urls_not_configured: 'Online booking setup is incomplete. Please contact the venue.',
    processing_error: 'We couldn\'t process your request. Please try again.',
    
    // Validation
    invalid_party_size: 'The number of players is not valid for this experience.',
    invalid_players: 'The number of players is not valid for this experience.',
    invalid_request: 'Please check your information and try again.',
    invalid_data: 'Some information is incorrect. Please review and try again.',
    invalid_time_window: 'The selected time is not valid. Please choose a different time.',
    invalid_org_id: 'This venue could not be found. Please check the link.',
    missing_fields: 'Please fill in all required fields.',
    missing_price: 'Pricing is unavailable. Please contact the venue.',
    
    // Resources not found
    game_not_found: 'This experience could not be found. Please check the link and try again.',
    room_not_found: 'The selected room is not available. Please try a different time.',
    schedule_not_found: 'No schedule found. Please contact the venue.',
    org_not_found: 'This venue could not be found. Please check the link and try again.',
    no_rooms_available: 'No rooms are available at this time. Please try a different time.',
    
    // Promotions
    promo_not_found: 'This promo code is not valid. Please check the code.',
    promo_invalid_coupon: 'This promo code cannot be applied.',
    promo_currency_mismatch: 'This promo code cannot be used with this booking.',
    promo_min_total_not_met: 'This promo code requires a higher total.',
    promo_unsupported: 'This promo code cannot be applied.',
    
    // Chat
    chat_error: 'Couldn\'t send your message. Please try again.',
    message_too_long: 'Your message is too long. Please shorten it.',
    too_many_messages: 'You\'re sending messages too quickly. Please slow down.',
    
    // System
    rate_limited: 'You\'re browsing too fast! Please wait a moment and try again.',
    request_timeout: 'Taking too long. Please check your connection and try again.',
    server_error: 'Something went wrong. Please try again in a moment.',
    session_not_found: 'Your session has expired. Please start over.',
    unauthorized: 'You don\'t have permission to access this.',
    too_large: 'The file is too large. Please use a smaller file.',
  };
  return map[code] ?? 'Something went wrong. Please try again or contact support.';
}

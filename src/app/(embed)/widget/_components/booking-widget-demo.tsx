'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PromoCodeField } from './promo-code-field';
import { emitBFEvent } from './widget-tracking';
import type { Slot, BookingType } from './widget-utils';
import { fmtTime, yyyyMmDdLocal } from './widget-utils';
import { BookingCalendar } from './BookingCalendar';
import { validatePromoCode, type PromoStatus } from './validate-promo';
import { WidgetBackground, WidgetHeader } from './widget-chrome';
import { ConfirmBar } from './confirm-bar';
import { EmbeddedCheckout } from '@/components/embedded-checkout';
import { GiftCardField } from './gift-card-field';

type Props = {
  orgId?: string;
  gameId?: string;
  theme?: 'dark' | 'light';
  primaryColor?: string;
  radius?: string;
};

/* Fetch with timeout helper */
async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('request_timeout');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* moved to widget-utils */

function friendlyError(code: string | null): string {
  if (!code) return 'Something went wrong. Please try again.';
  const map: Record<string, string> = {
    'rate_limited': 'Too many requests. Please wait a moment and try again.',
    'server_error': 'Our server had a hiccup. Please try again in a few seconds.',
    'booking_type_not_allowed': 'This game doesn\'t support this booking type. Try the other option.',
    'hold_expired': 'Your hold expired. Please select a new time slot.',
    'slot_unavailable': 'This slot was just taken. Please pick another time.',
    'capacity_exceeded': 'This time is fully booked. Please choose a different slot.',
    'payment_failed': 'Payment didn\'t go through. Please check your card and try again.',
    'payment_canceled': 'Payment was canceled. Please try again when ready.',
    'stripe_not_configured': 'Online payments aren\'t set up for this venue yet. Contact them directly to book.',
    'stripe_not_connected': 'Online payments aren\'t set up for this venue yet. Contact them directly to book.',
    'missing_fields': 'Please fill in all required fields.',
    'missing_checkout_url': 'Could not start checkout. Please try again.',
    'hold_not_found': 'Your reservation expired. Please start over.',
    'invalid_party_size': 'That player count isn\'t available for this game. Try adjusting the number.',
    'catalog_failed': 'Could not load game information. Please refresh the page.',
    'game_not_found': 'This game could not be found.',
    'schedule_not_found': 'No schedule found for this game.',
    'invalid_request': 'Please check your search parameters and try again.',
    'invalid_org_id': 'Invalid venue ID.',
    'confirmation_pending': 'Payment received but confirmation is still processing. Please refresh in a few seconds.',
  };
  return map[code] || code.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

export function BookingWidgetDemo({
  orgId = 'org_demo',
  gameId: gameIdProp,
  theme = 'dark',
  primaryColor,
  radius,
}: Props) {
  const [resolvedGameId, setResolvedGameId] = useState(gameIdProp ?? '');

  // Auto-select first game from catalog when no gameId provided
  useEffect(() => {
    if (gameIdProp) { setResolvedGameId(gameIdProp); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/catalog?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' });
        const body = await res.json().catch(() => null);
        if (!cancelled && body?.ok && body.games?.length > 0) {
          setResolvedGameId(body.games[0].gameId);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [orgId, gameIdProp]);

  const gameId = resolvedGameId;
  // Currency formatter helper
  const formatCurrency = (cents: number, currency = 'USD') => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  };

  useEffect(() => {
    emitBFEvent('widget_view', { orgId, gameId, theme });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [type, setType] = useState<BookingType>('public');
  const [players, setPlayers] = useState(2);
  const [date, setDate] = useState(() => yyyyMmDdLocal(new Date()));
  const today = useMemo(() => yyyyMmDdLocal(new Date()), []);

  const dateLabel = useMemo(() => {
    try {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return date;
    }
  }, [date]);

  const [loading, setLoading] = useState(false); // hold/confirm actions
  const [availLoading, setAvailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  const availabilityCacheRef = useRef(
    new Map<
      string,
      {
        ts: number;
        slots: Slot[];
      }
    >()
  );

  // Auto-load availability on open, and when inputs change (debounced).
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      void loadAvailability();
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, gameId, date, type, players]);

  const [selected, setSelected] = useState<Slot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  
  // Store hold pricing data for order summary
  const [holdPricing, setHoldPricing] = useState<{
    currency: string;
    subtotalCents: number;
    processingFeeCents: number;
    totalCents: number;
    processingFeeLabel?: string;
    promoDiscountCents?: number;
    discountedSubtotalCents?: number;
  } | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);

  // If Stripe isn't configured/connected, don't keep retrying checkout.
  const stripeAvailableRef = useRef<boolean | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const customerRef = useRef<HTMLDivElement | null>(null);
  const [promoStatus, setPromoStatus] = useState<PromoStatus>('idle');
  const [promoMessage, setPromoMessage] = useState<string>('');

  const [tick, setTick] = useState(0);

  const remainingMs = useMemo(() => {
    if (!holdExpiresAt) return null;
    void tick; // dependency to recalculate each second
    const ms = new Date(holdExpiresAt).getTime() - Date.now();
    return ms;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdExpiresAt, tick]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const t = setInterval(() => {
      setTick((v) => v + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [holdExpiresAt]);

  async function loadAvailability(opts?: { date?: string; type?: BookingType; players?: number; force?: boolean; retried?: boolean }) {
    const force = Boolean(opts?.force);
    const retried = Boolean(opts?.retried);
    const checkDate = opts?.date ?? date;
    const checkType = opts?.type ?? type;
    const checkPlayers = opts?.players ?? players;

    const cacheKey = `${orgId}::${gameId}::${checkDate}::${checkType}::${checkPlayers}`;
    const now = Date.now();
    const cached = availabilityCacheRef.current.get(cacheKey);

    // If we have a fresh cache (<= 60s), show it instantly, then refresh in background unless forced.
    if (cached && now - cached.ts <= 60_000 && !retried) {
      setSlots(cached.slots);
      setError(null);
      if (!force) {
        // background refresh
        void loadAvailability({ force: true });
        return;
      }
    }

    setError(null);
    setAvailLoading(true);

    // Don't clear the list while refreshing (better UX).
    setSelected(null);
    setHoldId(null);
    setHoldExpiresAt(null);
    setHoldPricing(null);
    setStripeClientSecret(null);

    emitBFEvent('availability_request', { orgId, gameId, date: checkDate, type: checkType, players: checkPlayers, force });

    try {
      const qs = new URLSearchParams({ orgId, gameId, date: checkDate, type: checkType, players: String(checkPlayers) });
      const res = await fetchWithTimeout(`/api/v1/availability?${qs.toString()}`, {}, 8000);
      const body = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const err =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        
        // Auto-retry once for server_error or rate_limited after 2 seconds (silent)
        if ((err === 'server_error' || err === 'rate_limited') && !retried) {
          await new Promise(r => setTimeout(r, 2000));
          return loadAvailability({ date: checkDate, type: checkType, players: checkPlayers, force: true, retried: true });
        }
        
        setError(friendlyError(err));
        emitBFEvent('availability_error', { orgId, gameId, error: err ?? 'failed' });
        return;
      }
      const rawSlots =
        typeof body === 'object' && body && 'slots' in body && Array.isArray((body as { slots?: unknown }).slots)
          ? ((body as { slots: unknown[] }).slots as unknown[])
          : [];

      // Backward/forward compatible slot normalization:
      // - Old: { startAt,endAt,roomId,available }
      // - New: { startAt,endAt,availableRooms:[{roomId,name}] }
      const normalized: Slot[] = rawSlots
        .map((s) => {
          if (!s || typeof s !== 'object') return null;

          // old format (legacy compatibility)
          if ('roomId' in s && 'available' in s) {
            const startAt = 'startAt' in s ? String((s as { startAt?: unknown }).startAt) : '';
            const endAt = 'endAt' in s ? String((s as { endAt?: unknown }).endAt) : '';
            const roomId = String((s as { roomId?: unknown }).roomId);
            // Extract roomName safely - only keep if it's a non-empty string different from roomId
            let roomName: string | undefined = undefined;
            if ('roomName' in s) {
              const raw = (s as { roomName?: unknown }).roomName;
              if (typeof raw === 'string' && raw.trim() && raw !== roomId) {
                roomName = raw.trim();
              }
            }
            const available = Boolean((s as { available?: unknown }).available);
            return { startAt, endAt, roomId, roomName, available };
          }

          // new format (current API response)
          if ('availableRooms' in s && Array.isArray((s as { availableRooms?: unknown }).availableRooms)) {
            const startAt = 'startAt' in s ? String((s as { startAt?: unknown }).startAt) : '';
            const endAt = 'endAt' in s ? String((s as { endAt?: unknown }).endAt) : '';
            const rooms = (s as { availableRooms: Array<{ roomId: string; name?: string; roomName?: string }> }).availableRooms ?? [];
            const roomId = rooms[0]?.roomId ? String(rooms[0].roomId) : '';
            // Try 'name' first, then 'roomName' (backward compat), only keep if valid and different from roomId
            let roomName: string | undefined = undefined;
            const rawName = rooms[0]?.name;
            const rawRoomName = rooms[0]?.roomName;
            if (typeof rawName === 'string' && rawName.trim() && rawName !== roomId) {
              roomName = rawName.trim();
            } else if (typeof rawRoomName === 'string' && rawRoomName.trim() && rawRoomName !== roomId) {
              roomName = rawRoomName.trim();
            }
            const available = rooms.length > 0;
            return { startAt, endAt, roomId, roomName, available };
          }

          return null;
        })
        .filter(Boolean) as Slot[];

      setSlots(normalized);
      availabilityCacheRef.current.set(cacheKey, { ts: now, slots: normalized });
      // Clear any existing error when slots load successfully
      setError(null);
      emitBFEvent('availability_loaded', { orgId, gameId, date, type, players, slotsCount: normalized.length });
    } finally {
      setAvailLoading(false);
    }
  }

  async function createHold(slot: Slot) {
    setError(null);
    setLoading(true);

    // Optimistic UI: mark the slot as selected immediately.
    setSelected(slot);

    emitBFEvent('slot_selected', { orgId, gameId, startAt: slot.startAt, endAt: slot.endAt, roomId: slot.roomId });
    try {
      const res = await fetchWithTimeout('/api/v1/holds', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orgId,
          gameId,
          roomId: slot.roomId,
          bookingType: type,
          startAt: slot.startAt,
          endAt: slot.endAt,
          players,
          customer: {
            ...(name.trim() ? { name: name.trim() } : {}),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
            ...(email.trim() ? { email: email.trim() } : {}),
          },
        }),
      });
      const body = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const err =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setSelected(null);
        setHoldPricing(null);
        setError(friendlyError(err));
        emitBFEvent('hold_error', { orgId, gameId, error: err ?? 'failed' });
        return;
      }

      const hold = typeof body === 'object' && body && 'hold' in body ? (body as { hold?: unknown }).hold : undefined;
      const nextHoldId =
        typeof hold === 'object' && hold && 'holdId' in hold ? String((hold as { holdId?: unknown }).holdId) : null;
      const expiresAt =
        typeof hold === 'object' && hold && 'expiresAt' in hold ? String((hold as { expiresAt?: unknown }).expiresAt) : null;

      // Extract pricing data
      if (typeof hold === 'object' && hold) {
        const currency = 'currency' in hold && typeof hold.currency === 'string' ? hold.currency : 'USD';
        const subtotalCents = 'subtotalCents' in hold && typeof hold.subtotalCents === 'number' ? hold.subtotalCents : 0;
        const processingFeeCents = 'processingFeeCents' in hold && typeof hold.processingFeeCents === 'number' ? hold.processingFeeCents : 0;
        const totalCents = 'totalCents' in hold && typeof hold.totalCents === 'number' ? hold.totalCents : 0;
        const processingFeeLabel = 'processingFeeLabel' in hold && typeof hold.processingFeeLabel === 'string' ? hold.processingFeeLabel : undefined;
        
        setHoldPricing({
          currency,
          subtotalCents,
          processingFeeCents,
          totalCents,
          processingFeeLabel,
        });
      }

      setHoldId(nextHoldId);
      setHoldExpiresAt(expiresAt);
      emitBFEvent('hold_created', { orgId, gameId, holdId: nextHoldId, expiresAt });

      // Auto-scroll to customer section after slot selected
      setTimeout(() => {
        customerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } finally {
      setLoading(false);
    }
  }

  async function validatePromo(codeRaw?: string) {
    const code = (codeRaw ?? promoCode).trim();
    if (!code) {
      setPromoStatus('idle');
      setPromoMessage('');
      return;
    }

    setPromoStatus('checking');
    setPromoMessage('Checking…');

    const res = await validatePromoCode({ orgId, code });
    setPromoStatus(res.status);
    setPromoMessage(res.message);
    
    // If promo is valid and we have a holdId, apply it and refresh pricing
    if (res.status === 'valid' && holdId) {
      try {
        const applyRes = await fetchWithTimeout('/api/v1/holds/apply-promo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, holdId, code }),
        }, 5000);
        
        if (applyRes.ok) {
          const applyBody = (await applyRes.json().catch(() => null)) as unknown;
          if (typeof applyBody === 'object' && applyBody && 'totalCents' in applyBody) {
            // Update pricing with discounted values
            setHoldPricing(prev => prev ? {
              ...prev,
              discountedSubtotalCents: 'discountedSubtotalCents' in applyBody && typeof applyBody.discountedSubtotalCents === 'number' ? applyBody.discountedSubtotalCents : prev.subtotalCents,
              promoDiscountCents: 'discountCents' in applyBody && typeof applyBody.discountCents === 'number' ? applyBody.discountCents : undefined,
              processingFeeCents: 'processingFeeCents' in applyBody && typeof applyBody.processingFeeCents === 'number' ? applyBody.processingFeeCents : prev.processingFeeCents,
              totalCents: typeof applyBody.totalCents === 'number' ? applyBody.totalCents : prev.totalCents,
            } : prev);
          }
        }
      } catch {
        // Ignore errors - promo validation already showed success/failure
      }
    }
  }

  async function payAndConfirm() {
    if (!holdId) return;
    emitBFEvent('booking_confirm_clicked', { orgId, gameId, holdId, promoCode: promoCode.trim() || undefined });
    setError(null);
    setLoading(true);
    try {
      // If promo code entered, apply it to the hold (best-effort) BEFORE checkout/confirm.
      const code = promoCode.trim();
      if (code) {
        try {
          const applyRes = await fetchWithTimeout('/api/v1/holds/apply-promo', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orgId, holdId, code }),
          }, 5000);
          
          if (applyRes.ok) {
            const applyBody = (await applyRes.json().catch(() => null)) as unknown;
            if (typeof applyBody === 'object' && applyBody && 'totalCents' in applyBody) {
              // Update pricing with discounted values
              setHoldPricing(prev => prev ? {
                ...prev,
                discountedSubtotalCents: 'discountedSubtotalCents' in applyBody && typeof applyBody.discountedSubtotalCents === 'number' ? applyBody.discountedSubtotalCents : prev.subtotalCents,
                promoDiscountCents: 'discountCents' in applyBody && typeof applyBody.discountCents === 'number' ? applyBody.discountCents : undefined,
                processingFeeCents: 'processingFeeCents' in applyBody && typeof applyBody.processingFeeCents === 'number' ? applyBody.processingFeeCents : prev.processingFeeCents,
                totalCents: typeof applyBody.totalCents === 'number' ? applyBody.totalCents : prev.totalCents,
              } : prev);
            }
          }
        } catch {
          // ignore
        }
      }

      async function confirmWithoutPayment() {
        const cRes = await fetchWithTimeout('/api/v1/bookings/confirm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, holdId, promoCode: promoCode.trim() || undefined }),
        }, 12000);
        const cBody = (await cRes.json().catch(() => null)) as unknown;
        if (!cRes.ok) {
          const cErr =
            typeof cBody === 'object' && cBody && 'error' in cBody ? String((cBody as { error?: unknown }).error) : null;
          setError(friendlyError(cErr));
          emitBFEvent('booking_error', { orgId, gameId, holdId, error: cErr ?? 'confirm_failed' });
          return false;
        }

        // Success: show confirmation screen
        const bookingId = `booking_${holdId}`;
        setConfirmed(true);
        setConfirmedBookingId(bookingId);
        emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players });
        setHoldId(null);
        setHoldExpiresAt(null);
        setHoldPricing(null);
        return true;
      }

      // Gift card covers full amount → redeem + confirm without Stripe
      const gcAppliedCents = giftCardCode && giftCardBalance > 0
        ? Math.min(giftCardBalance, holdPricing?.totalCents ?? 0)
        : 0;
      const totalAfterGc = (holdPricing?.totalCents ?? 0) - gcAppliedCents;

      if (gcAppliedCents > 0 && totalAfterGc <= 0) {
        // Full coverage: redeem gift card then confirm
        try {
          const redeemRes = await fetchWithTimeout('/api/v1/gift-cards/redeem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code: giftCardCode, bookingId: `booking_${holdId}`, amountCents: holdPricing?.totalCents ?? 0 }),
          }, 8000);
          if (!redeemRes.ok) {
            const rb = await redeemRes.json().catch(() => null);
            setError(rb?.message || 'Gift card redemption failed');
            return;
          }
        } catch {
          setError('Gift card redemption failed. Please try again.');
          return;
        }
        await confirmWithoutPayment();
        return;
      }

      // If we already learned Stripe isn't available, skip checkout call entirely.
      if (stripeAvailableRef.current === false) {
        await confirmWithoutPayment();
        return;
      }

      // Try payment-first flow: create Stripe Checkout Session and redirect.
      // Add a timeout (15s) for mobile networks where Stripe checkout can take 3-8 seconds.
      setCheckoutLoading(true);
      let res: Response | null = null;
      try {
        res = await fetchWithTimeout('/api/v1/stripe/checkout/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            orgId,
            holdId,
            returnUrl: window.location.href,
            ...(gcAppliedCents > 0 ? { giftCardCode, giftCardAmountCents: gcAppliedCents } : {}),
          }),
        }, 15000);
      } catch {
        // Network/timeout → fall back to non-payment confirm.
      } finally {
        setCheckoutLoading(false);
      }

      if (!res) {
        await confirmWithoutPayment();
        return;
      }

      const body = (await res.json().catch(() => null)) as unknown;
      if (res.ok) {
        stripeAvailableRef.current = true;
        const secret = typeof body === 'object' && body && 'clientSecret' in body ? String((body as { clientSecret?: unknown }).clientSecret) : '';
        if (!secret) {
          setError(friendlyError('missing_checkout_url'));
          return;
        }
        setStripeClientSecret(secret);
        return;
      }

      const err = typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;

      // Fallback: if Stripe isn't set up, allow non-payment confirm but still LOCK the slot by creating a booking.
      if (err === 'stripe_not_configured' || err === 'stripe_not_connected') {
        stripeAvailableRef.current = false;
        await confirmWithoutPayment();
        return;
      }

      setError(friendlyError(err));
      emitBFEvent('booking_error', { orgId, gameId, holdId, error: err ?? 'failed' });
    } finally {
      setLoading(false);
    }
  }

  const countdown = useMemo(() => {
    if (remainingMs == null) return null;
    const s = Math.max(0, Math.floor(remainingMs / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  const r = radius ? `${Math.max(8, Math.min(40, Number(radius) || 28))}px` : '28px';

  // After Stripe redirect, poll for booking creation (webhook-driven).
  useEffect(() => {
    const url = new URL(window.location.href);
    const stripe = url.searchParams.get('stripe');
    const spHoldId = url.searchParams.get('holdId');
    if (!stripe || !spHoldId) return;

    if (stripe === 'cancel') {
      setError(friendlyError('payment_canceled'));
      return;
    }

    const bookingId = `booking_${spHoldId}`;
    let cancelled = false;

    async function poll() {
      setLoading(true);
      setError(null);
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        try {
          const res = await fetchWithTimeout(`/api/v1/bookings/${encodeURIComponent(bookingId)}?orgId=${encodeURIComponent(orgId)}`, {
            cache: 'no-store',
          }, 5000);
          if (res.ok) {
            const body = (await res.json().catch(() => null)) as unknown;
            const ok = typeof body === 'object' && body && 'ok' in body ? Boolean((body as { ok?: unknown }).ok) : false;
            if (ok) {
              setConfirmed(true);
              setConfirmedBookingId(bookingId);
              emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players });
              // Clean URL
              url.searchParams.delete('stripe');
              url.searchParams.delete('session_id');
              url.searchParams.delete('holdId');
              window.history.replaceState({}, '', url.toString());
              setHoldId(null);
              setHoldExpiresAt(null);
              setHoldPricing(null);
              return;
            }
          }
        } catch {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      setError(friendlyError('confirmation_pending'));
    }

    void poll().finally(() => setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={(theme === 'dark' ? 'dark ' : '') + 'w-full max-w-full overflow-x-hidden'}
      style={{
        ['--widget-radius' as unknown as string]: r,
        ['--widget-primary' as unknown as string]: primaryColor || '#FF4F00',
      }}
    >
      <div
        ref={scrollRef}
        className="relative w-full max-w-full overflow-x-hidden rounded-[var(--widget-radius)] p-4 pb-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(2rem+env(safe-area-inset-bottom))] bg-white shadow-xl border border-gray-100 dark:border-white/[0.06] dark:bg-[#111113] dark:shadow-none"
      >
        <WidgetBackground />

        <div className="relative">
          <WidgetHeader />

          {/* ── Booking Confirmed ── */}
          {confirmed && (
            <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                Booking confirmed!
              </div>
              <div className="mt-2 text-sm text-emerald-600 dark:text-[rgba(255,255,255,0.55)]">
                {selected && `${fmtTime(selected.startAt)} – ${fmtTime(selected.endAt)} • ${dateLabel} • ${players} ${players === 1 ? 'player' : 'players'}`}
              </div>
              {confirmedBookingId && (
                <div className="mt-3 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  Ref: {confirmedBookingId.replace('booking_', '').substring(0, 8)}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmed(false);
                  setConfirmedBookingId(null);
                  setSelected(null);
                  void loadAvailability({ force: true });
                }}
                className="mt-5 rounded-full bg-[var(--widget-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
              >
                Book another
              </button>
            </div>
          )}

        {!confirmed && (<>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
            <label className="text-xs font-medium text-gray-700 dark:text-[#fafaf9]">Type</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setType('private')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                  type === 'private' ? 'bg-[var(--widget-primary)] text-white shadow-lg' : 'bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[rgba(255,255,255,0.55)] hover:dark:bg-white/[0.06]'
                }`}
              >
                Private
              </button>
              <button
                type="button"
                onClick={() => setType('public')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                  type === 'public' ? 'bg-[var(--widget-primary)] text-white shadow-lg' : 'bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[rgba(255,255,255,0.55)] hover:dark:bg-white/[0.06]'
                }`}
              >
                Public
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
            <label className="text-xs font-medium text-gray-700 dark:text-[#fafaf9]">Players</label>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlayers((p) => Math.max(1, p - 1))}
                className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:dark:bg-white/[0.06] transition-all duration-200"
              >
                −
              </button>
              <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 py-2 text-center text-sm dark:text-[#fafaf9]">{players}</div>
              <button
                type="button"
                onClick={() => setPlayers((p) => Math.min(20, p + 1))}
                className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:dark:bg-white/[0.06] transition-all duration-200"
              >
                +
              </button>
            </div>
          </div>

          <BookingCalendar
            date={date}
            setDate={setDate}
            today={today}
            orgId={orgId}
            gameId={gameId}
            players={players}
            bookingType={type}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => loadAvailability({ force: true })}
            disabled={availLoading}
            className="rounded-full bg-[var(--widget-primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-all duration-200"
          >
            {availLoading ? 'Loading…' : slots.length ? 'Refresh times' : 'Show available times'}
          </button>
          {holdId && countdown ? (
            <div className="rounded-full bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-[#222225] px-4 py-2 text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
              Hold active: <span className="font-semibold text-gray-900 dark:text-[#fafaf9]">{countdown}</span>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-red-500 dark:text-red-400 px-1" role="status" aria-live="polite">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          {slots.length ? (
            <div className="mb-2 text-xs text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
              Tap an <span className="font-semibold text-gray-900 dark:text-[#fafaf9]">available</span> time to reserve it.
            </div>
          ) : null}

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s, i) => {
              const disabled = !s.available;
              const active = selected && selected.startAt === s.startAt && selected.roomId === s.roomId;
              return (
                <button
                  key={`${s.roomId}-${s.startAt}-${i}`}
                  type="button"
                  disabled={disabled || loading}
                  onClick={() => createHold(s)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                    active
                      ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 shadow-[0_0_20px_rgba(255,79,0,0.15)]'
                      : disabled
                        ? 'border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] opacity-50'
                        : 'border-gray-200 dark:border-white/[0.06] bg-white shadow-sm dark:shadow-none dark:bg-[#1a1a1d] hover:bg-gray-50 dark:hover:bg-[#222225] dark:hover:border-white/[0.12] hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold dark:text-[#fafaf9]">
                      {fmtTime(s.startAt)} – {fmtTime(s.endAt)}
                    </div>
                    <div
                      className={
                        'rounded-full px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 ' +
                        (active
                          ? 'bg-[var(--widget-primary)]/20 text-white'
                          : disabled
                            ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-[rgba(255,255,255,0.35)]'
                            : 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')
                      }
                    >
                      {!disabled && !active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>}
                      {active ? 'Selected' : disabled ? 'Unavailable' : 'Available'}
                    </div>
                  </div>
                  {s.roomName && s.roomName !== s.roomId && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-[rgba(255,255,255,0.55)]">{s.roomName}</div>
                  )}
                  {loading && active ? <div className="mt-1 text-xs text-gray-600 dark:text-[rgba(255,255,255,0.55)]">Reserving…</div> : null}
                </button>
              );
            })}
          </div>

          {!loading && slots.length === 0 ? (
            <div className="mt-3 text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">No slots found for this date. Try another date.</div>
          ) : null}
        </div>

        {selected && holdPricing && (
          <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                Price per person:
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-[#fafaf9]">
                {formatCurrency(holdPricing.subtotalCents / players, holdPricing.currency)}
              </div>
            </div>
          </div>
        )}

        {selected && (
        <div ref={customerRef} className="mt-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">Customer</div>

          <div className="mt-3">
            <PromoCodeField
              orgId={orgId}
              gameId={gameId}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoStatus={promoStatus}
              promoMessage={promoMessage}
              onApply={() => validatePromo()}
              setPromoStatus={setPromoStatus}
              setPromoMessage={setPromoMessage}
            />
          </div>

          <div className="mt-3">
            <GiftCardField
              orgId={orgId}
              onApplied={(code, balance) => { setGiftCardCode(code); setGiftCardBalance(balance); }}
              onRemoved={() => { setGiftCardCode(''); setGiftCardBalance(0); }}
              appliedCode={giftCardCode}
              appliedBalance={giftCardBalance}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200"
            />
          </div>

          {holdPricing && (
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#222225] backdrop-blur-xl p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-[#fafaf9] mb-3">Order Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                    {players} {players === 1 ? 'player' : 'players'} × {formatCurrency(holdPricing.subtotalCents / players, holdPricing.currency)}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-[#fafaf9]">
                    {formatCurrency(holdPricing.discountedSubtotalCents ?? holdPricing.subtotalCents, holdPricing.currency)}
                  </div>
                </div>
                
                {holdPricing.promoDiscountCents && holdPricing.promoDiscountCents > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <div>Promo discount</div>
                    <div className="font-medium">
                      -{formatCurrency(holdPricing.promoDiscountCents, holdPricing.currency)}
                    </div>
                  </div>
                )}
                
                {holdPricing.processingFeeCents > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                      {holdPricing.processingFeeLabel || 'Service fee'}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-[#fafaf9]">
                      {formatCurrency(holdPricing.processingFeeCents, holdPricing.currency)}
                    </div>
                  </div>
                )}

                {giftCardCode && giftCardBalance > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <div>Gift card ({giftCardCode})</div>
                    <div className="font-medium">
                      -{formatCurrency(Math.min(giftCardBalance, holdPricing.totalCents), holdPricing.currency)}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-white/[0.06] pt-2 mt-2"></div>
                
                <div className="flex items-center justify-between text-base">
                  <div className="font-semibold text-gray-900 dark:text-[#fafaf9]">
                    {giftCardCode && giftCardBalance >= holdPricing.totalCents ? 'Total (covered by gift card)' : 'Total'}
                  </div>
                  <div className="font-bold text-gray-900 dark:text-[#fafaf9]">
                    {formatCurrency(
                      giftCardCode ? Math.max(0, holdPricing.totalCents - giftCardBalance) : holdPricing.totalCents,
                      holdPricing.currency
                    )}
                  </div>
                </div>
                {giftCardCode && giftCardBalance > 0 && giftCardBalance < holdPricing.totalCents && (
                  <div className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.35)]">
                    Remaining {formatCurrency(holdPricing.totalCents - giftCardBalance, holdPricing.currency)} will be charged to your card
                  </div>
                )}
              </div>
            </div>
          )}

          {!stripeClientSecret && (
            <div className="mt-4">
              <ConfirmBar holdId={holdId} loading={loading || checkoutLoading} onConfirm={payAndConfirm} />
              {error ? <p className="mt-2 text-sm text-red-500 dark:text-red-400 px-1">{error}</p> : null}
            </div>
          )}

          {stripeClientSecret && (
            <EmbeddedCheckout
              clientSecret={stripeClientSecret}
              onComplete={async () => {
                // If gift card was partially applied, redeem it now
                const gcRedeem = giftCardCode && giftCardBalance > 0
                  ? Math.min(giftCardBalance, holdPricing?.totalCents ?? 0)
                  : 0;
                if (giftCardCode && gcRedeem > 0) {
                  try {
                    await fetchWithTimeout('/api/v1/gift-cards/redeem', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ code: giftCardCode, bookingId: `booking_${holdId}`, amountCents: gcRedeem }),
                    }, 8000);
                  } catch {
                    // Best effort — gift card info is also in Stripe metadata for webhook fallback
                  }
                }
                setStripeClientSecret(null);
                const bookingId = `booking_${holdId}`;
                setConfirmed(true);
                setConfirmedBookingId(bookingId);
                emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players });
                setHoldId(null);
                setHoldExpiresAt(null);
                setHoldPricing(null);
                setGiftCardCode('');
                setGiftCardBalance(0);
              }}
            />
          )}
        </div>
        )}
        </>)}
      </div>
    </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Slot, BookingType } from './widget-utils';
import { yyyyMmDdLocal, friendlyError } from './widget-utils';
import { emitBFEvent } from './widget-tracking';
import { fetchT, fetchAvailability, fetchCreateHold, fetchValidatePromo, safeString } from './booking-api';
import type { PromoStatus } from './validate-promo';

// Re-export helpers for consumers
export { safeSessionGet, safeSessionSet, safeString } from './booking-api';

/* ── Types ── */
export type HoldPricing = {
  currency: string;
  subtotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  processingFeeLabel?: string;
  promoDiscountCents?: number;
  discountedSubtotalCents?: number;
};

export type BookingEngineOpts = {
  orgId: string;
  gameId: string;
  theme?: 'dark' | 'light';
  layout?: string;
  smartDefaults?: boolean;
  autoLoadAvailability?: boolean;
  trackPricing?: boolean;
};

/* ── Hook ── */
export function useBookingEngine(opts: BookingEngineOpts) {
  const {
    orgId, gameId, theme = 'dark', layout = 'original',
    smartDefaults = false, autoLoadAvailability = true, trackPricing = false,
  } = opts;

  const defaultPlayers = smartDefaults ? 4 : 2;

  /* ── Core state ── */
  const [type, setType] = useState<BookingType>('public');
  const [players, setPlayers] = useState(defaultPlayers);
  const [date, setDate] = useState(() => yyyyMmDdLocal(new Date()));
  const today = useMemo(() => yyyyMmDdLocal(new Date()), []);
  const dateLabel = useMemo(() => {
    try { return new Date(date + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }
    catch { return date; }
  }, [date]);

  const [loading, setLoading] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);
  const [error, setErrorRaw] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const cacheRef = useRef(new Map<string, { ts: number; slots: Slot[] }>());

  /** Defensive setError — always coerces to string to prevent React #310. */
  const setError = useCallback((val: unknown) => {
    if (val == null || val === '') { setErrorRaw(null); return; }
    setErrorRaw(typeof val === 'string' ? val : safeString(val));
  }, []);

  const [selected, setSelected] = useState<Slot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);
  const [holdPricing, setHoldPricing] = useState<HoldPricing | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<PromoStatus>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const stripeAvailableRef = useRef<boolean | null>(null);

  /* ── Hold countdown ── */
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = useMemo(() => holdExpiresAt ? new Date(holdExpiresAt).getTime() - now : null, [holdExpiresAt, now]);
  useEffect(() => { if (!holdExpiresAt) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [holdExpiresAt]);
  useEffect(() => { if (remainingMs != null && remainingMs <= 0 && holdId) { setHoldExpired(true); setHoldId(null); setHoldExpiresAt(null); if (trackPricing) setHoldPricing(null); } }, [remainingMs, holdId, trackPricing]);
  const countdown = useMemo((): string | null => {
    if (remainingMs == null) return null;
    const s = Math.max(0, Math.floor(remainingMs / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, [remainingMs]);

  /* ── Analytics ── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { emitBFEvent('widget_view', { orgId, gameId, theme, layout }); }, []);

  /* ── Load availability ── */
  const loadAvailability = useCallback(async (force = false) => {
    // Don't clear hold state — only clear selection so user can re-pick.
    // This prevents Step 4 from losing holdId if auto-load fires.
    setSelected(null);
    if (!holdId) {
      // Only clear hold state if there's no active hold
      setHoldExpiresAt(null);
      if (trackPricing) setHoldPricing(null);
    }
    try {
      await fetchAvailability({
        orgId, gameId, date, type, players, cache: cacheRef.current, force,
        onSlots: (s) => setSlots(s),
        onError: (e) => setError(e || null),
        onLoading: setAvailLoading,
      });
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'server_error'));
      setAvailLoading(false);
    }
  }, [orgId, gameId, date, type, players, trackPricing, holdId, setError]);

  /* ── Auto-load ── */
  useEffect(() => {
    if (!autoLoadAvailability) return;
    let c = false;
    const t = setTimeout(() => { if (!c) void loadAvailability(); }, 250);
    return () => { c = true; clearTimeout(t); };
  }, [autoLoadAvailability, loadAvailability]);

  /* ── Create hold ── */
  const createHold = useCallback(async (slot: Slot): Promise<string | null> => {
    setError(null);
    setLoading(true);
    setSelected(slot);
    try {
      const id = await fetchCreateHold({
        orgId, gameId, slot, type, players, name, phone, email, trackPricing,
        onHold: (hId, exp) => { setHoldId(hId); setHoldExpiresAt(exp); setHoldExpired(false); },
        onPricing: (p) => setHoldPricing(p),
        onError: (e) => { setSelected(null); if (trackPricing) setHoldPricing(null); setError(e); },
      });
      if (!id) setSelected(null);
      return id;
    } catch (err) {
      // Catch-all for unhandled errors (network, parsing, etc.)
      setSelected(null);
      if (trackPricing) setHoldPricing(null);
      setError(friendlyError(err instanceof Error ? err.message : 'server_error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [orgId, gameId, type, players, name, phone, email, trackPricing, setError]);

  /* ── Validate promo ── */
  const validatePromo = useCallback(async (codeRaw?: string) => {
    try {
      await fetchValidatePromo({
        orgId, code: (codeRaw ?? promoCode).trim(), holdId, trackPricing,
        onStatus: (s, m) => { setPromoStatus(s); setPromoMessage(typeof m === 'string' ? m : safeString(m)); },
        onPricingUpdate: (fn) => setHoldPricing(fn),
      });
    } catch {
      setPromoStatus('invalid');
      setPromoMessage('Could not validate promo code.');
    }
  }, [promoCode, orgId, holdId, trackPricing]);

  /* ── Pay & confirm ── */
  const payAndConfirm = useCallback(async (extras?: {
    giftCardCode?: string; giftCardBalance?: number;
    onStripeSecret?: (secret: string) => void;
  }) => {
    if (!holdId) return;
    emitBFEvent('booking_confirm_clicked', { orgId, gameId, holdId, promoCode: promoCode.trim() || undefined });
    setError(null);
    setLoading(true);
    try {
      // Apply promo
      const code = promoCode.trim();
      if (code) {
        try {
          const r = await fetchT('/api/v1/holds/apply-promo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId, holdId, code }) }, 5000);
          if (r.ok && trackPricing) {
            const ab = (await r.json().catch(() => null)) as Record<string, unknown> | null;
            if (ab && 'totalCents' in ab) setHoldPricing(prev => prev ? { ...prev, discountedSubtotalCents: typeof ab.discountedSubtotalCents === 'number' ? ab.discountedSubtotalCents : prev.subtotalCents, promoDiscountCents: typeof ab.discountCents === 'number' ? ab.discountCents : undefined, processingFeeCents: typeof ab.processingFeeCents === 'number' ? ab.processingFeeCents : prev.processingFeeCents, totalCents: typeof ab.totalCents === 'number' ? ab.totalCents : prev.totalCents } : prev);
          }
        } catch { /* best-effort */ }
      }

      const doConfirm = async () => {
        const cRes = await fetchT('/api/v1/bookings/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId, holdId, promoCode: code || undefined }) }, 12000);
        const cBody = (await cRes.json().catch(() => null)) as Record<string, unknown> | null;
        if (!cRes.ok) {
          const errVal = cBody?.error;
          setError(friendlyError(typeof errVal === 'string' ? errVal : null));
          emitBFEvent('booking_error', { orgId, gameId, holdId, error: typeof errVal === 'string' ? errVal : 'confirm_failed' });
          return false;
        }
        setConfirmed(true); setConfirmedBookingId(`booking_${holdId}`);
        emitBFEvent('booking_confirmed', { orgId, gameId, bookingId: `booking_${holdId}`, date, players });
        setHoldId(null); setHoldExpiresAt(null); if (trackPricing) setHoldPricing(null);
        return true;
      };

      // Gift card full coverage
      const gc = extras?.giftCardCode; const gcBal = extras?.giftCardBalance ?? 0;
      const gcApplied = gc && gcBal > 0 ? Math.min(gcBal, holdPricing?.totalCents ?? 0) : 0;
      if (gcApplied > 0 && (holdPricing?.totalCents ?? 0) - gcApplied <= 0) {
        try {
          const rr = await fetchT('/api/v1/gift-cards/redeem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: gc, bookingId: `booking_${holdId}`, amountCents: holdPricing?.totalCents ?? 0 }) }, 8000);
          if (!rr.ok) {
            const rb = (await rr.json().catch(() => null)) as Record<string, unknown> | null;
            // Defensive: extract message as string, never render raw object
            const msg = rb && typeof rb.message === 'string' ? rb.message : 'Gift card redemption failed';
            setError(msg);
            return;
          }
        } catch { setError('Gift card redemption failed. Please try again.'); return; }
        await doConfirm(); return;
      }

      if (stripeAvailableRef.current === false) { await doConfirm(); return; }

      setCheckoutLoading(true);
      let res: Response | null = null;
      try { res = await fetchT('/api/v1/stripe/checkout/create', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId, holdId, returnUrl: window.location.href, ...(gcApplied > 0 ? { giftCardCode: gc, giftCardAmountCents: gcApplied } : {}) }) }, 15000); } catch { /* network/timeout fallback */ } finally { setCheckoutLoading(false); }

      if (!res) { await doConfirm(); return; }
      const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (res.ok) {
        stripeAvailableRef.current = true;
        const secret = typeof body?.clientSecret === 'string' ? body.clientSecret : '';
        const url = typeof body?.url === 'string' ? body.url : '';
        if (extras?.onStripeSecret && secret) { extras.onStripeSecret(secret); return; }
        if (url) { emitBFEvent('checkout_started', { orgId, gameId, holdId }); window.location.href = url; return; }
        setError(friendlyError('missing_checkout_url')); return;
      }
      const errField = body?.error;
      const err = typeof errField === 'string' ? errField : null;
      if (err === 'stripe_not_configured' || err === 'stripe_not_connected') { stripeAvailableRef.current = false; await doConfirm(); return; }
      setError(friendlyError(err)); emitBFEvent('booking_error', { orgId, gameId, holdId, error: err ?? 'failed' });
    } catch (err) {
      // Top-level catch: any unhandled error in the entire flow
      setError(friendlyError(err instanceof Error ? err.message : 'server_error'));
    } finally { setLoading(false); }
  }, [holdId, orgId, gameId, promoCode, date, players, trackPricing, holdPricing, setError]);

  /* ── Stripe redirect polling ── */
  useEffect(() => {
    let url: URL;
    try { url = new URL(window.location.href); } catch { return; }
    const stripe = url.searchParams.get('stripe'); const spHoldId = url.searchParams.get('holdId');
    if (!stripe || !spHoldId) return;
    if (stripe === 'cancel') { setError(friendlyError('payment_canceled')); return; }
    const bookingId = `booking_${spHoldId}`; let cancelled = false;
    async function poll() {
      setLoading(true); setError(null);
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        try { const res = await fetchT(`/api/v1/bookings/${encodeURIComponent(bookingId)}?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' }, 5000); if (res.ok) { const body = (await res.json().catch(() => null)) as Record<string, unknown> | null; if (body?.ok) { setConfirmed(true); setConfirmedBookingId(bookingId); emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players }); url.searchParams.delete('stripe'); url.searchParams.delete('session_id'); url.searchParams.delete('holdId'); window.history.replaceState({}, '', url.toString()); setHoldId(null); setHoldExpiresAt(null); if (trackPricing) setHoldPricing(null); setSelected(null); return; } } } catch { /* retry */ }
        await new Promise(r => setTimeout(r, 1000));
      }
      setError(friendlyError('confirmation_pending'));
    }
    void poll().finally(() => setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetBooking = useCallback(() => {
    setConfirmed(false); setConfirmedBookingId(null); setSelected(null); setHoldExpired(false);
    void loadAvailability(true);
  }, [loadAvailability]);

  return {
    type, setType, players, setPlayers, date, setDate, today, dateLabel,
    loading, availLoading, error, setError,
    slots, selected, holdId, holdExpiresAt, holdExpired, holdPricing, setHoldPricing,
    name, setName, phone, setPhone, email, setEmail,
    promoCode, setPromoCode, promoStatus, setPromoStatus, promoMessage, setPromoMessage,
    checkoutLoading, confirmed, confirmedBookingId,
    countdown, remainingMs,
    loadAvailability, createHold, validatePromo, payAndConfirm, resetBooking,
  };
}

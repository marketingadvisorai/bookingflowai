'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PromoCodeField } from '../promo-code-field';
import { emitBFEvent } from '../widget-tracking';
import type { Slot, BookingType } from '../widget-utils';
import { fmtTime, yyyyMmDdLocal, friendlyError } from '../widget-utils';
import { BookingCalendar } from '../BookingCalendar';
import { validatePromoCode, type PromoStatus } from '../validate-promo';
import { WidgetBackground, WidgetHeader } from '../widget-chrome';
import { ConfirmBar } from '../confirm-bar';
import { SmartNudge, useNudgeQueue, IdleHelper } from '../smart-nudges';
import {
  getSlotNudges,
  getDateNudge,
  getPlayerNudge,
  getProgressNudge,
  getIdleNudge,
  getWelcomeNudge,
  getSmartDefaultDate,
  SMART_DEFAULT_PLAYERS,
} from '../widget-intelligence';
import { useIdleTracker } from '../use-idle-tracker';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockIcon, GlobeIcon, UserMultipleIcon, CalendarIcon, Clock01Icon } from '@hugeicons/core-free-icons';

/* ─── Props (same as BookingWidgetDemo) ─── */
type Props = {
  orgId?: string;
  gameId?: string;
  theme?: 'dark' | 'light';
  primaryColor?: string;
  radius?: string;
};

type WizardStep = 1 | 2 | 3 | 4;
const STEP_LABELS = ['Game', 'Date & Options', 'Time', 'Checkout'] as const;

/* ─────────────────────────────────────────────────────────────────────── */
export function WizardLayout({
  orgId = 'org_demo',
  gameId = 'game_axe',
  theme = 'dark',
  primaryColor,
  radius,
}: Props) {
  /* ── analytics ── */
  useEffect(() => {
    emitBFEvent('widget_view', { orgId, gameId, theme, layout: 'wizard' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── welcome nudge (once per session) ── */
  useEffect(() => {
    const shown = sessionStorage.getItem('bf-welcome-shown');
    if (!shown) {
      const timer = setTimeout(() => {
        enqueueNudge(getWelcomeNudge());
        sessionStorage.setItem('bf-welcome-shown', '1');
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── wizard step ── */
  const [step, setStep] = useState<WizardStep>(1);

  /* ── booking state (identical to original) ── */
  const [type, setType] = useState<BookingType>('public');
  const [players, setPlayers] = useState(SMART_DEFAULT_PLAYERS);
  const [date, setDate] = useState(() => getSmartDefaultDate());
  const today = useMemo(() => yyyyMmDdLocal(new Date()), []);

  const dateLabel = useMemo(() => {
    try {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return date;
    }
  }, [date]);

  const [loading, setLoading] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  const availabilityCacheRef = useRef(
    new Map<string, { ts: number; slots: Slot[] }>()
  );

  const [selected, setSelected] = useState<Slot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<PromoStatus>('idle');
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const stripeAvailableRef = useRef<boolean | null>(null);

  /* ── nudge system ── */
  const { current: currentNudge, enqueue: enqueueNudge, dismiss: dismissNudge } = useNudgeQueue();
  const { idleSeconds } = useIdleTracker(!!holdId);

  /* ── hold expiry & confirmation ── */
  const [holdExpired, setHoldExpired] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  /* ── hold countdown ── */
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = useMemo(() => {
    if (!holdExpiresAt) return null;
    return new Date(holdExpiresAt).getTime() - now;
  }, [holdExpiresAt, now]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [holdExpiresAt]);

  // Detect hold expiry
  useEffect(() => {
    if (remainingMs != null && remainingMs <= 0 && holdId) {
      setHoldExpired(true);
      setHoldId(null);
      setHoldExpiresAt(null);
      setStep(3); // Go back to time selection
    }
  }, [remainingMs, holdId]);

  const countdown = useMemo(() => {
    if (remainingMs == null) return null;
    const s = Math.max(0, Math.floor(remainingMs / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [remainingMs]);

  /* ── intelligence: slot nudges ── */
  useEffect(() => {
    if (slots.length === 0) return;
    const nudges = getSlotNudges(slots);
    for (const n of nudges) enqueueNudge(n);
  }, [slots, players, enqueueNudge]);

  /* ── intelligence: date nudges ── */
  useEffect(() => {
    const n = getDateNudge(date);
    if (n) enqueueNudge(n);
  }, [date, enqueueNudge]);

  /* ── intelligence: player nudges ── */
  useEffect(() => {
    const n = getPlayerNudge(players);
    if (n) enqueueNudge(n);
  }, [players, enqueueNudge]);

  /* ── intelligence: progress nudges ── */
  useEffect(() => {
    if (holdId) {
      const n = getProgressNudge('slot_selected');
      if (n) enqueueNudge(n);
    }
  }, [holdId, enqueueNudge]);

  useEffect(() => {
    if (holdId && (name.trim() || email.trim())) {
      const n = getProgressNudge('customer');
      if (n) enqueueNudge(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email]);

  /* ── intelligence: idle recovery ── */
  useEffect(() => {
    const n = getIdleNudge(idleSeconds, !!holdId, countdown);
    if (n) enqueueNudge(n);
  }, [idleSeconds, holdId, countdown, enqueueNudge]);

  /* ── auto-load availability when on step 3 ── */
  useEffect(() => {
    if (step < 3) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) void loadAvailability();
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, gameId, date, type, players, step]);

  /* ── API: load availability (same as original) ── */
  async function loadAvailability(opts?: { force?: boolean }) {
    const force = Boolean(opts?.force);
    const cacheKey = `${orgId}::${gameId}::${date}::${type}::${players}`;
    const now = Date.now();
    const cached = availabilityCacheRef.current.get(cacheKey);

    if (cached && now - cached.ts <= 60_000) {
      setSlots(cached.slots);
      setError(null);
      if (!force) {
        void loadAvailability({ force: true });
        return;
      }
    }

    setError(null);
    setAvailLoading(true);
    setSelected(null);
    setHoldId(null);
    setHoldExpiresAt(null);

    emitBFEvent('availability_request', { orgId, gameId, date, type, players, force });

    try {
      const qs = new URLSearchParams({ orgId, gameId, date, type, players: String(players) });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let res: Response;
      try {
        res = await fetch(`/api/v1/availability?${qs.toString()}`, { signal: controller.signal });
      } catch (fetchErr) {
        clearTimeout(timeout);
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          // Retry once for timeout (likely Lambda cold start)
          await new Promise(r => setTimeout(r, 2000));
          res = await fetch(`/api/v1/availability?${qs.toString()}`);
        } else {
          throw fetchErr;
        }
      } finally {
        clearTimeout(timeout);
      }
      
      const body = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const err =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        
        // Auto-retry once for server_error or rate_limited after 2 seconds (silent)
        if ((err === 'server_error' || err === 'rate_limited') && !force) {
          await new Promise(r => setTimeout(r, 2000));
          return loadAvailability({ force: true });
        }
        
        setError(friendlyError(err ?? 'Failed to load availability'));
        emitBFEvent('availability_error', { orgId, gameId, error: err ?? 'failed' });
        return;
      }
      const rawSlots =
        typeof body === 'object' && body && 'slots' in body && Array.isArray((body as { slots?: unknown }).slots)
          ? ((body as { slots: unknown[] }).slots as unknown[])
          : [];

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

  /* ── API: create hold (same as original) ── */
  async function createHold(slot: Slot) {
    setError(null);
    setLoading(true);
    setSelected(slot);

    emitBFEvent('slot_selected', { orgId, gameId, startAt: slot.startAt, endAt: slot.endAt, roomId: slot.roomId });
    try {
      const res = await fetch('/api/v1/holds', {
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
        setError(friendlyError(err ?? 'Failed to reserve this time'));
        emitBFEvent('hold_error', { orgId, gameId, error: err ?? 'failed' });
        return;
      }

      const hold = typeof body === 'object' && body && 'hold' in body ? (body as { hold?: unknown }).hold : undefined;
      const nextHoldId =
        typeof hold === 'object' && hold && 'holdId' in hold ? String((hold as { holdId?: unknown }).holdId) : null;
      const expiresAt =
        typeof hold === 'object' && hold && 'expiresAt' in hold ? String((hold as { expiresAt?: unknown }).expiresAt) : null;

      setHoldId(nextHoldId);
      setHoldExpiresAt(expiresAt);
      emitBFEvent('hold_created', { orgId, gameId, holdId: nextHoldId, expiresAt });
      setHoldExpired(false);

      // Auto-advance to checkout step
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  /* ── API: validate promo (same as original) ── */
  async function validatePromo(codeRaw?: string) {
    const code = (codeRaw ?? promoCode).trim();
    if (!code) { setPromoStatus('idle'); setPromoMessage(''); return; }
    setPromoStatus('checking');
    setPromoMessage('Checking…');
    const res = await validatePromoCode({ orgId, code });
    setPromoStatus(res.status);
    setPromoMessage(res.message);
  }

  /* ── API: pay & confirm (same as original) ── */
  async function payAndConfirm() {
    if (!holdId) return;
    emitBFEvent('booking_confirm_clicked', { orgId, gameId, holdId, promoCode: promoCode.trim() || undefined });
    setError(null);
    setLoading(true);
    try {
      const code = promoCode.trim();
      if (code) {
        try {
          await fetch('/api/v1/holds/apply-promo', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orgId, holdId, code }),
          });
        } catch { /* ignore */ }
      }

      const customerData = {
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
      };

      async function confirmWithoutPayment() {
        const cRes = await fetch('/api/v1/bookings/confirm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, holdId, promoCode: promoCode.trim() || undefined, customer: Object.keys(customerData).length > 0 ? customerData : undefined }),
        });
        const cBody = (await cRes.json().catch(() => null)) as unknown;
        if (!cRes.ok) {
          const cErr =
            typeof cBody === 'object' && cBody && 'error' in cBody ? String((cBody as { error?: unknown }).error) : null;
          setError(friendlyError(cErr ?? 'confirm_failed'));
          emitBFEvent('booking_error', { orgId, gameId, holdId, error: cErr ?? 'confirm_failed' });
          return false;
        }
        const bookingId = `booking_${holdId}`;
        setConfirmed(true);
        setConfirmedBookingId(bookingId);
        emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players });
        setHoldId(null);
        setHoldExpiresAt(null);
        return true;
      }

      if (stripeAvailableRef.current === false) {
        await confirmWithoutPayment();
        return;
      }

      setCheckoutLoading(true);
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 15000);
      let res: Response | null = null;
      try {
        res = await fetch('/api/v1/stripe/checkout/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, holdId, returnUrl: window.location.href }),
          signal: ac.signal,
        });
      } catch { /* timeout/network */ } finally { 
        clearTimeout(timeout); 
        setCheckoutLoading(false);
      }

      if (!res) { await confirmWithoutPayment(); return; }

      const body = (await res.json().catch(() => null)) as unknown;
      if (res.ok) {
        stripeAvailableRef.current = true;
        const url = typeof body === 'object' && body && 'url' in body ? String((body as { url?: unknown }).url) : '';
        if (!url) { setError(friendlyError('missing_checkout_url')); return; }
        emitBFEvent('checkout_started', { orgId, gameId, holdId });
        window.location.href = url;
        return;
      }

      const err = typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
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

  /* ── Stripe redirect polling (same as original) ── */
  useEffect(() => {
    const url = new URL(window.location.href);
    const stripe = url.searchParams.get('stripe');
    const spHoldId = url.searchParams.get('holdId');
    if (!stripe || !spHoldId) return;

    if (stripe === 'cancel') { setError('Payment canceled. Please try again.'); return; }

    const bookingId = `booking_${spHoldId}`;
    let cancelled = false;

    async function poll() {
      setLoading(true);
      setError(null);
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/v1/bookings/${encodeURIComponent(bookingId)}?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' });
          if (res.ok) {
            const body = (await res.json().catch(() => null)) as unknown;
            const ok = typeof body === 'object' && body && 'ok' in body ? Boolean((body as { ok?: unknown }).ok) : false;
            if (ok) {
              setConfirmed(true);
              setConfirmedBookingId(bookingId);
              emitBFEvent('booking_confirmed', { orgId, gameId, bookingId, date, players });
              url.searchParams.delete('stripe');
              url.searchParams.delete('session_id');
              url.searchParams.delete('holdId');
              window.history.replaceState({}, '', url.toString());
              setHoldId(null);
              setHoldExpiresAt(null);
              setSelected(null);
              return;
            }
          }
        } catch { /* retry */ }
        await new Promise((r) => setTimeout(r, 1000));
      }
      setError('Payment received but confirmation is still processing. Please refresh in a few seconds.');
    }

    void poll().finally(() => setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── styling ── */
  const r = radius ? `${Math.max(8, Math.min(40, Number(radius) || 28))}px` : '28px';

  /* ── render helpers ── */
  function goTo(s: WizardStep) {
    // Only allow going back, or forward if current step is "complete"
    if (s < step) { setStep(s); return; }
    setStep(s);
  }

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div
      className={(theme === 'dark' ? 'dark ' : '') + 'w-full max-w-full overflow-x-hidden'}
      style={{
        ['--widget-radius' as unknown as string]: r,
        ['--widget-primary' as unknown as string]: primaryColor || '#FF4F00',
      }}
    >
      <div className="relative w-full max-w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-[var(--widget-radius)] p-4 pb-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(2rem+env(safe-area-inset-bottom))] bg-white shadow-xl border border-gray-100 dark:border-white/[0.06] dark:bg-[#111113] dark:shadow-none">
        <WidgetBackground />

        <div className="relative">
          <WidgetHeader />

          {/* ── Smart Nudge (prominent at top) ── */}
          {currentNudge && (
            <SmartNudge nudge={currentNudge} onDismiss={dismissNudge} />
          )}

          {/* ── Idle Helper (contextual suggestions) ── */}
          <IdleHelper
            idleSeconds={idleSeconds}
            stage={
              step === 4 && (name.trim() || email.trim()) 
                ? 'customer_form' 
                : holdId 
                  ? 'slot_selected' 
                  : step === 3 && slots.length > 0 
                    ? 'time_selection' 
                    : 'idle'
            }
          />

          {/* ── Step Indicator with Progress Bar ── */}
          {!confirmed && (
            <div className="mt-5">
              {/* Progress bar */}
              <div className="relative h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute inset-y-0 left-0 bg-[var(--widget-primary)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              
              {/* Step indicators */}
              <div className="flex items-center justify-between gap-1">
                {STEP_LABELS.map((label, i) => {
                  const sNum = (i + 1) as WizardStep;
                  const isActive = step === sNum;
                  const isDone = step > sNum;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { if (isDone) goTo(sNum); }}
                      className={`flex flex-1 flex-col items-center gap-1 transition-all duration-300 ${isDone ? 'cursor-pointer opacity-70 hover:opacity-100 hover:scale-105' : isActive ? 'opacity-100 scale-105' : 'opacity-40 cursor-default'}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-[var(--widget-primary)] text-white shadow-lg shadow-[var(--widget-primary)]/30'
                            : isDone
                              ? 'bg-[var(--widget-primary)] text-white opacity-70'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/50'
                        }`}
                      >
                        {isDone ? '✓' : sNum}
                      </div>
                      <span className={`text-[10px] leading-tight text-center transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Booking Confirmed ── */}
          {confirmed && (
            <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-4xl animate-in zoom-in-50 duration-700" style={{ animationDelay: '100ms' }}>
                  ✓
                </div>
              </div>
              <div className="mt-4 text-xl font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
                Booking confirmed!
              </div>
              <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-300/80 animate-in fade-in duration-500" style={{ animationDelay: '300ms' }}>
                Your booking has been confirmed. Check your email for details.
              </div>
              {confirmedBookingId && (
                <div className="mt-3 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-500" style={{ animationDelay: '400ms' }}>
                  {confirmedBookingId}
                </div>
              )}
              <button
                type="button"
                onClick={() => { setConfirmed(false); setConfirmedBookingId(null); setStep(1); void loadAvailability({ force: true }); }}
                className="mt-5 rounded-full bg-[var(--widget-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--widget-primary)]/90 hover:shadow-lg transition-all duration-200 hover:scale-105 animate-in fade-in duration-500"
                style={{ animationDelay: '500ms' }}
              >
                Book another
              </button>
            </div>
          )}

          {/* ── Hold Expired Banner ── */}
          {holdExpired && !holdId && !confirmed && (
            <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
              <div className="flex items-start gap-3">
                <span className="text-lg">⏰</span>
                <div>
                  <div className="font-semibold">Hold expired</div>
                  <div className="text-xs mt-0.5 opacity-90">Please select a new time to continue.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300" role="alert" aria-live="polite">
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div>
                  <div className="font-semibold">Oops!</div>
                  <div className="text-xs mt-0.5 opacity-90">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Hold countdown (persistent) ── */}
          {holdId && countdown && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-2 text-sm text-amber-700 dark:text-amber-400 font-medium">
              ⏱ Hold expires in <span className="font-bold tabular-nums">{countdown}</span>
            </div>
          )}

          {/* ══════════════ STEP 1: Game (Type & Players) ══════════════ */}
          {!confirmed && step === 1 && (
            <div className="mt-5 space-y-4 animate-in fade-in">
              {/* Booking Type Toggle */}
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setType('private')}
                  className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                    type === 'private'
                      ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 shadow-lg shadow-[var(--widget-primary)]/20'
                      : 'border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] hover:bg-gray-50 dark:hover:bg-[#222225] backdrop-blur-xl'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${type === 'private' ? 'bg-[var(--widget-primary)]/15 text-[var(--widget-primary)]' : 'bg-gray-100 dark:bg-white/[0.03] text-gray-500 dark:text-[rgba(255,255,255,0.55)]'}`}>
                      <HugeiconsIcon icon={LockIcon} size={16} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold dark:text-[#fafaf9]">Private Room</div>
                      <div className="text-[11px] text-muted-foreground dark:text-[rgba(255,255,255,0.35)]">Just your group</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType('public')}
                  className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                    type === 'public'
                      ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 shadow-lg shadow-[var(--widget-primary)]/20'
                      : 'border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] hover:bg-gray-50 dark:hover:bg-[#222225] backdrop-blur-xl'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${type === 'public' ? 'bg-[var(--widget-primary)]/15 text-[var(--widget-primary)]' : 'bg-gray-100 dark:bg-white/[0.03] text-gray-500 dark:text-[rgba(255,255,255,0.55)]'}`}>
                      <HugeiconsIcon icon={GlobeIcon} size={16} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold dark:text-[#fafaf9]">Public</div>
                      <div className="text-[11px] text-muted-foreground dark:text-[rgba(255,255,255,0.35)]">Join other players</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserMultipleIcon} size={14} strokeWidth={1.8} className="text-muted-foreground dark:text-[rgba(255,255,255,0.35)]" />
                  <label className="text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">Players</label>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={() => setPlayers((p) => Math.max(1, p - 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-all duration-200">−</button>
                  <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 py-2 text-center text-sm font-medium dark:text-[#fafaf9]">{players}</div>
                  <button type="button" onClick={() => setPlayers((p) => Math.min(20, p + 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-all duration-200">+</button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-full bg-[var(--widget-primary)] px-5 py-3 text-sm font-medium text-white"
              >
                Next: Choose Date →
              </button>
            </div>
          )}

          {/* ══════════════ STEP 2: Date & Options ══════════════ */}
          {!confirmed && step === 2 && (
            <div className="mt-5 space-y-4 animate-in fade-in">
              {/* Collapsed summary of step 1 */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>{type === 'private' ? 'Private' : 'Public'} · {players} player{players !== 1 ? 's' : ''}</span>
                <button type="button" onClick={() => setStep(1)} className="text-[var(--widget-primary)] hover:underline text-xs">Edit</button>
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

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full rounded-full bg-[var(--widget-primary)] px-5 py-3 text-sm font-medium text-white"
              >
                Next: Pick a Time →
              </button>
            </div>
          )}

          {/* ══════════════ STEP 3: Time Slots ══════════════ */}
          {!confirmed && step === 3 && (
            <div className="mt-5 space-y-4 animate-in fade-in">
              {/* Collapsed summaries */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>{type === 'private' ? 'Private' : 'Public'} · {players} player{players !== 1 ? 's' : ''} · {dateLabel}</span>
                <button type="button" onClick={() => setStep(1)} className="text-[var(--widget-primary)] hover:underline text-xs">Edit</button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => loadAvailability({ force: true })}
                  disabled={availLoading}
                  className="rounded-full bg-[var(--widget-primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {availLoading ? 'Loading…' : 'Refresh times'}
                </button>
              </div>

              {/* Loading skeleton */}
              {availLoading && slots.length === 0 && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] backdrop-blur-xl px-4 py-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-white/[0.06] rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-100 dark:bg-white/[0.03] rounded w-16"></div>
                    </div>
                  ))}
                </div>
              )}

              {slots.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">
                    Tap an <span className="font-semibold text-foreground">available</span> time to reserve it.
                  </div>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {(() => {
                      // Find slot with lowest remaining capacity (for "Last spots!" badge)
                      const availableSlots = slots.filter(s => s.available && s.remainingPlayers != null);
                      const lowestCapacitySlot = availableSlots.length > 0
                        ? availableSlots.reduce((min, s) => (s.remainingPlayers! < min.remainingPlayers! ? s : min))
                        : null;
                      const showLastSpots = lowestCapacitySlot && lowestCapacitySlot.remainingPlayers! > 0 && lowestCapacitySlot.remainingPlayers! < 4;
                      
                      // Find first available slot (for "Suggested" badge)
                      const firstAvailableSlot = slots.find(s => s.available);

                      return slots.map((s, i) => {
                        const disabled = !s.available;
                        const active = selected && selected.startAt === s.startAt && selected.roomId === s.roomId;
                        const isLastSpots = showLastSpots && s === lowestCapacitySlot;
                        const isSuggested = !disabled && s === firstAvailableSlot;
                        
                        // Check if weekend evening (Fri/Sat 6-9 PM) for "Popular" badge
                        let isPopular = false;
                        try {
                          const d = new Date(s.startAt);
                          const day = d.getDay();
                          const hour = d.getHours();
                          isPopular = !disabled && (day === 5 || day === 6) && hour >= 18 && hour < 21;
                        } catch { /* skip */ }
                        
                        return (
                          <button
                            key={`${s.roomId}-${s.startAt}-${i}`}
                            type="button"
                            disabled={disabled || loading}
                            onClick={() => createHold(s)}
                            className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                              active
                                ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 scale-[1.02] shadow-[0_0_20px_rgba(255,79,0,0.15)]'
                                : disabled
                                  ? 'border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] opacity-50 cursor-not-allowed backdrop-blur-xl'
                                  : 'border-gray-200 dark:border-white/[0.06] bg-white shadow-sm dark:shadow-none dark:bg-[#1a1a1d] backdrop-blur-xl hover:bg-gray-50 dark:hover:bg-[#222225] hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-md hover:-translate-y-0.5'
                            }`}
                            style={{ animationDelay: `${i * 30}ms` }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-sm font-semibold dark:text-[#fafaf9]">
                                <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={1.8} className="text-muted-foreground dark:text-[rgba(255,255,255,0.35)]" />
                                {fmtTime(s.startAt)} – {fmtTime(s.endAt)}
                              </div>
                              <div
                                className={
                                  'rounded-full px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 ' +
                                  (active
                                    ? 'bg-[var(--widget-primary)]/20 text-white'
                                    : disabled
                                      ? 'bg-gray-200 dark:bg-white/[0.06] text-gray-500 dark:text-[rgba(255,255,255,0.35)]'
                                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400')
                                }
                              >
                                {!disabled && !active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>}
                                {active ? 'Selected' : disabled ? 'Unavailable' : 'Available'}
                              </div>
                            </div>
                            <div className="mt-1.5 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">{s.roomName || s.roomId}</div>
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              {isSuggested && !active && (
                                <div className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  ✨ Suggested
                                </div>
                              )}
                              {isPopular && !active && (
                                <div className="rounded-full bg-[#FF4F00]/15 dark:bg-[#FF4F00]/20 px-2.5 py-1 text-[11px] font-semibold text-[#FF4F00]">
                                  🔥 Popular
                                </div>
                              )}
                              {isLastSpots && (
                                <div className="rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 animate-pulse">
                                  ⚡ Last spots!
                                </div>
                              )}
                            </div>
                            {loading && active ? <div className="mt-1.5 text-xs text-muted-foreground">Reserving…</div> : null}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </>
              )}

              {!availLoading && slots.length === 0 && (
                <div className="text-sm text-muted-foreground">No slots found for this date. Try another date.</div>
              )}
            </div>
          )}

          {/* ══════════════ STEP 4: Checkout ══════════════ */}
          {!confirmed && step === 4 && (
            <div className="mt-5 space-y-4 animate-in fade-in">
              {/* Collapsed summary */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  {type === 'private' ? 'Private' : 'Public'} · {players} player{players !== 1 ? 's' : ''} · {dateLabel}
                  {selected ? ` · ${fmtTime(selected.startAt)} – ${fmtTime(selected.endAt)}` : ''}
                </span>
                <button type="button" onClick={() => setStep(3)} className="text-[var(--widget-primary)] hover:underline text-xs">Change time</button>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <div className="text-sm font-semibold dark:text-[#fafaf9]">Customer</div>

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

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                </div>

                <div className="mt-4">
                  <ConfirmBar holdId={holdId} loading={loading || checkoutLoading} onConfirm={payAndConfirm} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

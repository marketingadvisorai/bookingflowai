'use client';

import { useEffect, useRef, useState } from 'react';
import { useBookingEngine } from './use-booking-engine';
import type { Slot } from './widget-utils';
import { fmtTime } from './widget-utils';
import { BookingCalendar } from './BookingCalendar';
import { WidgetBackground, WidgetHeader } from './widget-chrome';
import { ConfirmBar } from './confirm-bar';
import { PromoCodeField } from './promo-code-field';
import { EmbeddedCheckout } from '@/components/embedded-checkout';
import { GiftCardField } from './gift-card-field';

type Props = { orgId?: string; gameId?: string; theme?: 'dark' | 'light'; primaryColor?: string; radius?: string };

function formatCurrency(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function BookingWidgetDemo({ orgId = 'org_demo', gameId: gameIdProp, theme = 'dark', primaryColor, radius }: Props) {
  /* ── Auto-resolve gameId if not provided ── */
  const [resolvedGameId, setResolvedGameId] = useState(gameIdProp ?? '');
  useEffect(() => {
    if (gameIdProp) { setResolvedGameId(gameIdProp); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/catalog?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' });
        const body = await res.json().catch(() => null);
        if (!cancelled && body?.ok && body.games?.length > 0) setResolvedGameId(body.games[0].gameId);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [orgId, gameIdProp]);

  const gameId = resolvedGameId;

  const engine = useBookingEngine({ orgId, gameId, theme, layout: 'original', trackPricing: true, autoLoadAvailability: true });
  const {
    type, setType, players, setPlayers, date, setDate, today, dateLabel,
    loading, availLoading, error, slots, selected, holdId, holdExpiresAt, holdPricing, setHoldPricing,
    name, setName, phone, setPhone, email, setEmail,
    promoCode, setPromoCode, promoStatus, setPromoStatus, promoMessage, setPromoMessage,
    checkoutLoading, confirmed, confirmedBookingId, countdown,
    loadAvailability, createHold, validatePromo, payAndConfirm, resetBooking,
  } = engine;

  /* ── Gift card state ── */
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardBalance, setGiftCardBalance] = useState(0);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const customerRef = useRef<HTMLDivElement | null>(null);

  /* ── Auto-scroll to customer section after slot selected ── */
  async function onSlotSelect(slot: Slot) {
    const id = await createHold(slot);
    if (id) setTimeout(() => customerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  const r = radius ? `${Math.max(8, Math.min(40, Number(radius) || 28))}px` : '28px';

  return (
    <div
      className={(theme === 'dark' ? 'dark ' : '') + 'w-full max-w-full overflow-x-hidden'}
      style={{ ['--widget-radius' as string]: r, ['--widget-primary' as string]: primaryColor || '#FF4F00' }}
    >
      <div ref={scrollRef} className="relative w-full max-w-full overflow-x-hidden rounded-[var(--widget-radius)] p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-6 bg-white shadow-xl border border-gray-100 dark:border-white/[0.06] dark:bg-[#111113] dark:shadow-none">
        <WidgetBackground />
        <div className="relative">
          <WidgetHeader />

          {/* Confirmed */}
          {confirmed && (
            <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">Booking confirmed!</div>
              <div className="mt-2 text-sm text-emerald-600 dark:text-[rgba(255,255,255,0.55)]">
                {selected && `${fmtTime(selected.startAt)} – ${fmtTime(selected.endAt)} • ${dateLabel} • ${players} ${players === 1 ? 'player' : 'players'}`}
              </div>
              {confirmedBookingId && (
                <div className="mt-3 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  Ref: {confirmedBookingId.replace('booking_', '').substring(0, 8)}
                </div>
              )}
              <button type="button" onClick={() => { resetBooking(); setGiftCardCode(''); setGiftCardBalance(0); setStripeClientSecret(null); }}
                className="mt-5 rounded-full bg-[var(--widget-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-all duration-200">
                Book another
              </button>
            </div>
          )}

          {!confirmed && (<>
            {/* Options row */}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <label className="text-xs font-medium text-gray-700 dark:text-[#fafaf9]">Type</label>
                <div className="mt-2 flex gap-2">
                  {(['private', 'public'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${type === t ? 'bg-[var(--widget-primary)] text-white shadow-lg' : 'bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[rgba(255,255,255,0.55)] hover:dark:bg-white/[0.06]'}`}>
                      {t === 'private' ? 'Private' : 'Public'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <label className="text-xs font-medium text-gray-700 dark:text-[#fafaf9]">Players</label>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={() => setPlayers(p => Math.max(1, p - 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:dark:bg-white/[0.06] transition-all duration-200">−</button>
                  <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 py-2 text-center text-sm dark:text-[#fafaf9]">{players}</div>
                  <button type="button" onClick={() => setPlayers(p => Math.min(20, p + 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:dark:bg-white/[0.06] transition-all duration-200">+</button>
                </div>
              </div>
              <BookingCalendar date={date} setDate={setDate} today={today} orgId={orgId} gameId={gameId} players={players} bookingType={type} />
            </div>

            {/* Action bar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => loadAvailability(true)} disabled={availLoading}
                className="rounded-full bg-[var(--widget-primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-all duration-200">
                {availLoading ? 'Loading…' : slots.length ? 'Refresh times' : 'Show available times'}
              </button>
              {holdId && countdown && (
                <div className="rounded-full bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-[#222225] px-4 py-2 text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                  Hold active: <span className="font-semibold text-gray-900 dark:text-[#fafaf9]">{countdown}</span>
                </div>
              )}
              {error && <p className="text-sm text-red-500 dark:text-red-400 px-1" role="status" aria-live="polite">{error}</p>}
            </div>

            {/* Slots */}
            <div className="mt-6">
              {slots.length > 0 && (
                <div className="mb-2 text-xs text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                  Tap an <span className="font-semibold text-gray-900 dark:text-[#fafaf9]">available</span> time to reserve it.
                </div>
              )}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((s, i) => {
                  const disabled = !s.available;
                  const active = selected && selected.startAt === s.startAt && selected.roomId === s.roomId;
                  return (
                    <button key={`${s.roomId}-${s.startAt}-${i}`} type="button" disabled={disabled || loading} onClick={() => onSlotSelect(s)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${active ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 shadow-[0_0_20px_rgba(255,79,0,0.15)]' : disabled ? 'border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] opacity-50' : 'border-gray-200 dark:border-white/[0.06] bg-white shadow-sm dark:shadow-none dark:bg-[#1a1a1d] hover:bg-gray-50 dark:hover:bg-[#222225] dark:hover:border-white/[0.12] hover:shadow-md hover:-translate-y-0.5'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold dark:text-[#fafaf9]">{fmtTime(s.startAt)} – {fmtTime(s.endAt)}</div>
                        <div className={'rounded-full px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 ' + (active ? 'bg-[var(--widget-primary)]/20 text-white' : disabled ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-[rgba(255,255,255,0.35)]' : 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')}>
                          {!disabled && !active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />}
                          {active ? 'Selected' : disabled ? 'Unavailable' : 'Available'}
                        </div>
                      </div>
                      {s.roomName && s.roomName !== s.roomId && <div className="mt-1 text-xs text-gray-600 dark:text-[rgba(255,255,255,0.55)]">{s.roomName}</div>}
                      {loading && active && <div className="mt-1 text-xs text-gray-600 dark:text-[rgba(255,255,255,0.55)]">Reserving…</div>}
                    </button>
                  );
                })}
              </div>
              {!loading && slots.length === 0 && <div className="mt-3 text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">No slots found for this date. Try another date.</div>}
            </div>

            {/* Price per person */}
            {selected && holdPricing && (
              <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-[rgba(255,255,255,0.55)]">Price per person:</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-[#fafaf9]">{formatCurrency(holdPricing.subtotalCents / players, holdPricing.currency)}</div>
                </div>
              </div>
            )}

            {/* Customer & Checkout */}
            {selected && (
              <div ref={customerRef} className="mt-6 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">Customer</div>
                <div className="mt-3">
                  <PromoCodeField orgId={orgId} gameId={gameId} promoCode={promoCode} setPromoCode={setPromoCode} promoStatus={promoStatus} promoMessage={promoMessage} onApply={() => validatePromo()} setPromoStatus={setPromoStatus} setPromoMessage={setPromoMessage} />
                </div>
                <div className="mt-3">
                  <GiftCardField orgId={orgId} onApplied={(code, balance) => { setGiftCardCode(code); setGiftCardBalance(balance); }} onRemoved={() => { setGiftCardCode(''); setGiftCardBalance(0); }} appliedCode={giftCardCode} appliedBalance={giftCardBalance} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                </div>

                {/* Order Summary */}
                {holdPricing && <OrderSummary pricing={holdPricing} players={players} giftCardCode={giftCardCode} giftCardBalance={giftCardBalance} />}

                {!stripeClientSecret && (
                  <div className="mt-4">
                    <ConfirmBar holdId={holdId} loading={loading || checkoutLoading} onConfirm={() => payAndConfirm({ giftCardCode, giftCardBalance, onStripeSecret: setStripeClientSecret })} />
                    {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 px-1">{error}</p>}
                  </div>
                )}

                {stripeClientSecret && (
                  <EmbeddedCheckout
                    clientSecret={stripeClientSecret}
                    onComplete={async () => {
                      setStripeClientSecret(null);
                      resetBooking();
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

/* ── Order Summary sub-component ── */
function OrderSummary({ pricing, players, giftCardCode, giftCardBalance }: {
  pricing: NonNullable<ReturnType<typeof useBookingEngine>['holdPricing']>;
  players: number; giftCardCode: string; giftCardBalance: number;
}) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#222225] backdrop-blur-xl p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-[#fafaf9] mb-3">Order Summary</div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-[rgba(255,255,255,0.55)]">{players} {players === 1 ? 'player' : 'players'} × {formatCurrency(pricing.subtotalCents / players, pricing.currency)}</div>
          <div className="font-medium text-gray-900 dark:text-[#fafaf9]">{formatCurrency(pricing.discountedSubtotalCents ?? pricing.subtotalCents, pricing.currency)}</div>
        </div>
        {pricing.promoDiscountCents && pricing.promoDiscountCents > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <div>Promo discount</div>
            <div className="font-medium">-{formatCurrency(pricing.promoDiscountCents, pricing.currency)}</div>
          </div>
        )}
        {pricing.processingFeeCents > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-gray-700 dark:text-[rgba(255,255,255,0.55)]">{pricing.processingFeeLabel || 'Service fee'}</div>
            <div className="font-medium text-gray-900 dark:text-[#fafaf9]">{formatCurrency(pricing.processingFeeCents, pricing.currency)}</div>
          </div>
        )}
        {giftCardCode && giftCardBalance > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <div>Gift card ({giftCardCode})</div>
            <div className="font-medium">-{formatCurrency(Math.min(giftCardBalance, pricing.totalCents), pricing.currency)}</div>
          </div>
        )}
        <div className="border-t border-gray-200 dark:border-white/[0.06] pt-2 mt-2" />
        <div className="flex items-center justify-between text-base">
          <div className="font-semibold text-gray-900 dark:text-[#fafaf9]">{giftCardCode && giftCardBalance >= pricing.totalCents ? 'Total (covered by gift card)' : 'Total'}</div>
          <div className="font-bold text-gray-900 dark:text-[#fafaf9]">{formatCurrency(giftCardCode ? Math.max(0, pricing.totalCents - giftCardBalance) : pricing.totalCents, pricing.currency)}</div>
        </div>
        {giftCardCode && giftCardBalance > 0 && giftCardBalance < pricing.totalCents && (
          <div className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.35)]">Remaining {formatCurrency(pricing.totalCents - giftCardBalance, pricing.currency)} will be charged to your card</div>
        )}
      </div>
    </div>
  );
}

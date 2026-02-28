'use client';

import { useEffect, useRef, useState } from 'react';
import { useBookingEngine, safeSessionGet, safeSessionSet } from '../use-booking-engine';
import { PromoCodeField } from '../promo-code-field';
import type { Slot } from '../widget-utils';
import { fmtTime } from '../widget-utils';
import { BookingCalendar } from '../BookingCalendar';
import { WidgetBackground, WidgetHeader } from '../widget-chrome';
import { ConfirmBar } from '../confirm-bar';
import { SmartNudge, useNudgeQueue, IdleHelper } from '../smart-nudges';
import {
  getSlotNudges, getDateNudge, getPlayerNudge, getProgressNudge,
  getIdleNudge, getWelcomeNudge,
} from '../widget-intelligence';
import { useIdleTracker } from '../use-idle-tracker';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockIcon, GlobeIcon, UserMultipleIcon, Clock01Icon } from '@hugeicons/core-free-icons';

type Props = { orgId?: string; gameId?: string; theme?: 'dark' | 'light'; primaryColor?: string; radius?: string };

export function ClassicLayout({ orgId = 'org_demo', gameId = 'game_axe', theme = 'dark', primaryColor, radius }: Props) {
  const engine = useBookingEngine({ orgId, gameId, theme, layout: 'classic', smartDefaults: true, autoLoadAvailability: true });
  const {
    type, setType, players, setPlayers, date, setDate, today, dateLabel,
    loading, availLoading, error, slots, selected, holdId, holdExpired,
    name, setName, phone, setPhone, email, setEmail,
    promoCode, setPromoCode, promoStatus, setPromoStatus, promoMessage, setPromoMessage,
    checkoutLoading, confirmed, confirmedBookingId, countdown,
    loadAvailability, createHold, validatePromo, payAndConfirm, resetBooking,
  } = engine;

  /* ── Refs for auto-scroll ── */
  const slotsRef = useRef<HTMLDivElement | null>(null);
  const customerRef = useRef<HTMLDivElement | null>(null);

  /* ── Nudge system ── */
  const { current: currentNudge, enqueue: enqueueNudge, dismiss: dismissNudge } = useNudgeQueue();
  const { idleSeconds } = useIdleTracker(!!holdId);

  useEffect(() => {
    if (!safeSessionGet('bf-welcome-shown')) {
      const t = setTimeout(() => { enqueueNudge(getWelcomeNudge()); safeSessionSet('bf-welcome-shown', '1'); }, 1000);
      return () => clearTimeout(t);
    }
  }, [enqueueNudge]);

  useEffect(() => { if (slots.length) getSlotNudges(slots).forEach(n => enqueueNudge(n)); }, [slots, enqueueNudge]);
  useEffect(() => { const n = getDateNudge(date); if (n) enqueueNudge(n); }, [date, enqueueNudge]);
  useEffect(() => { const n = getPlayerNudge(players); if (n) enqueueNudge(n); }, [players, enqueueNudge]);
  useEffect(() => { if (holdId) { const n = getProgressNudge('slot_selected'); if (n) enqueueNudge(n); } }, [holdId, enqueueNudge]);
  useEffect(() => { if (holdId && (name.trim() || email.trim())) { const n = getProgressNudge('customer'); if (n) enqueueNudge(n); } }, [holdId, name, email, enqueueNudge]);
  useEffect(() => { const n = getIdleNudge(idleSeconds, !!holdId, countdown); if (n) enqueueNudge(n); }, [idleSeconds, holdId, countdown, enqueueNudge]);

  /* ── Hold expiry scroll back ── */
  useEffect(() => {
    if (holdExpired) setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, [holdExpired]);

  /* ── Auto-scroll after slot selection ── */
  async function onSlotSelect(slot: Slot) {
    const id = await createHold(slot);
    if (id) setTimeout(() => customerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  /* ── Section readiness ── */
  const slotsReady = slots.length > 0 || availLoading;
  const customerReady = !!holdId;
  const [mountedSections, setMountedSections] = useState<Set<number>>(new Set([1]));
  useEffect(() => { if (slotsReady && !mountedSections.has(2)) setMountedSections(p => new Set(p).add(2)); }, [slotsReady, mountedSections]);
  useEffect(() => { if (customerReady && !mountedSections.has(3)) setMountedSections(p => new Set(p).add(3)); }, [customerReady, mountedSections]);

  const r = radius ? `${Math.max(8, Math.min(40, Number(radius) || 28))}px` : '28px';

  return (
    <div
      className={(theme === 'dark' ? 'dark ' : '') + 'w-full max-w-full overflow-x-hidden'}
      style={{ ['--widget-radius' as string]: r, ['--widget-primary' as string]: primaryColor || '#FF4F00' }}
    >
      <div className="relative w-full max-w-full overflow-x-hidden rounded-[var(--widget-radius)] p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-6 bg-white shadow-xl border border-gray-100 dark:border-white/[0.06] dark:bg-[#111113] dark:shadow-none">
        <WidgetBackground />
        <div className="relative space-y-6">
          <WidgetHeader />
          {currentNudge && <SmartNudge nudge={currentNudge} onDismiss={dismissNudge} />}
          <IdleHelper idleSeconds={idleSeconds} stage={holdId && (name.trim() || email.trim()) ? 'customer_form' : holdId ? 'slot_selected' : slots.length > 0 ? 'time_selection' : 'idle'} />

          {/* Confirmed */}
          {confirmed && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-4xl animate-in zoom-in-50 duration-700" style={{ animationDelay: '100ms' }}>✓</div>
              </div>
              <div className="mt-4 text-xl font-semibold text-emerald-700 dark:text-emerald-400">Booking confirmed!</div>
              <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-300/80">Your booking has been confirmed. Check your email for details.</div>
              {confirmedBookingId && <div className="mt-3 inline-block rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-400">{confirmedBookingId}</div>}
              <button type="button" onClick={resetBooking} className="mt-5 rounded-full bg-[var(--widget-primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--widget-primary)]/90 hover:shadow-lg transition-all duration-200 hover:scale-105">Book another</button>
            </div>
          )}

          {/* Hold Expired */}
          {holdExpired && !holdId && !confirmed && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
              <div className="flex items-start gap-3"><span className="text-lg">⏰</span><div><div className="font-semibold">Hold expired</div><div className="text-xs mt-0.5 opacity-90">Please select a new time below to continue.</div></div></div>
            </div>
          )}

          {/* SECTION 1: Booking Options */}
          {!confirmed && (
            <section>
              <SectionHeader number={1} title="Choose your options" active />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(['private', 'public'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${type === t ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 shadow-lg shadow-[var(--widget-primary)]/20' : 'border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] hover:bg-gray-50 dark:hover:bg-[#222225] backdrop-blur-xl'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${type === t ? 'bg-[var(--widget-primary)]/15 text-[var(--widget-primary)]' : 'bg-gray-100 dark:bg-white/[0.03] text-gray-500 dark:text-[rgba(255,255,255,0.55)]'}`}>
                        <HugeiconsIcon icon={t === 'private' ? LockIcon : GlobeIcon} size={16} strokeWidth={1.8} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold dark:text-[#fafaf9]">{t === 'private' ? 'Private Room' : 'Public'}</div>
                        <div className="text-[11px] text-muted-foreground dark:text-[rgba(255,255,255,0.35)]">{t === 'private' ? 'Just your group' : 'Join other players'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserMultipleIcon} size={14} strokeWidth={1.8} className="text-muted-foreground dark:text-[rgba(255,255,255,0.35)]" />
                    <label className="text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">Players</label>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={() => setPlayers(p => Math.max(1, p - 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-all duration-200">−</button>
                    <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 py-2 text-center text-sm font-medium dark:text-[#fafaf9]">{players}</div>
                    <button type="button" onClick={() => setPlayers(p => Math.min(20, p + 1))} className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] text-foreground dark:text-[#fafaf9] hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-all duration-200">+</button>
                  </div>
                </div>
                <BookingCalendar date={date} setDate={setDate} today={today} orgId={orgId} gameId={gameId} players={players} bookingType={type} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => loadAvailability(true)} disabled={availLoading} className="rounded-full bg-[var(--widget-primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {availLoading ? 'Loading…' : slots.length ? 'Refresh times' : 'Show available times'}
                </button>
                {holdId && countdown && (
                  <div className="rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-2 text-sm text-amber-700 dark:text-amber-400 font-medium">
                    ⏱ Hold expires in <span className="font-bold tabular-nums">{countdown}</span>
                  </div>
                )}
                {error && !holdId && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300" role="alert" aria-live="polite">
                    <div className="flex items-start gap-3"><span className="text-lg flex-shrink-0">⚠️</span><div><div className="font-semibold">Oops!</div><div className="text-xs mt-0.5 opacity-90">{error}</div></div></div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SECTION 2: Available Times */}
          {!confirmed && (
            <section ref={slotsRef} className={`transition-all duration-500 ${slotsReady ? mountedSections.has(2) ? 'animate-in fade-in slide-in-from-top-4 duration-500' : '' : 'pointer-events-none opacity-40'}`}>
              <SectionHeader number={2} title="Pick a time" active={slotsReady} />
              {slots.length > 0 && <div className="mb-2 mt-3 text-xs text-muted-foreground">Tap an <span className="font-semibold text-foreground">available</span> time to reserve it.</div>}
              {availLoading && slots.length === 0 && (
                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1a] px-4 py-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-white/[0.08] rounded w-24 mb-2" /><div className="h-3 bg-gray-100 dark:bg-white/[0.04] rounded w-16" />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  const avail = slots.filter(s => s.available && s.remainingPlayers != null);
                  const low = avail.length > 0 ? avail.reduce((m, s) => (s.remainingPlayers! < m.remainingPlayers! ? s : m)) : null;
                  const showLast = low && low.remainingPlayers! > 0 && low.remainingPlayers! < 4;
                  const first = slots.find(s => s.available);

                  return slots.map((s, i) => {
                    const disabled = !s.available;
                    const active = selected && selected.startAt === s.startAt && selected.roomId === s.roomId;
                    const isLast = showLast && s === low;
                    const isSugg = !disabled && s === first;
                    let isPop = false;
                    try { const d = new Date(s.startAt); isPop = !disabled && (d.getDay() === 5 || d.getDay() === 6) && d.getHours() >= 18 && d.getHours() < 21; } catch {}

                    return (
                      <button key={`${s.roomId}-${s.startAt}-${i}`} type="button" disabled={disabled || loading} onClick={() => onSlotSelect(s)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${active ? 'border-[var(--widget-primary)] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/10 scale-[1.02] shadow-[0_0_20px_rgba(255,79,0,0.15)]' : disabled ? 'border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] opacity-50 cursor-not-allowed backdrop-blur-xl' : 'border-gray-200 dark:border-white/[0.06] bg-white shadow-sm dark:shadow-none dark:bg-[#1a1a1d] backdrop-blur-xl hover:bg-gray-50 dark:hover:bg-[#222225] hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-md hover:-translate-y-0.5'}`}
                        style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-sm font-semibold dark:text-[#fafaf9]">
                            <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={1.8} className="text-muted-foreground dark:text-[rgba(255,255,255,0.35)]" />
                            {fmtTime(s.startAt)} – {fmtTime(s.endAt)}
                          </div>
                          <div className={'rounded-full px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 ' + (active ? 'bg-[var(--widget-primary)]/20 text-white' : disabled ? 'bg-gray-200 dark:bg-white/[0.06] text-gray-500 dark:text-[rgba(255,255,255,0.35)]' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400')}>
                            {!disabled && !active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />}
                            {active ? 'Selected' : disabled ? 'Unavailable' : 'Available'}
                          </div>
                        </div>
                        <div className="mt-1.5 text-xs text-muted-foreground dark:text-[rgba(255,255,255,0.55)]">{s.roomName || s.roomId}</div>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          {isSugg && !active && <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">✨ Suggested</span>}
                          {isPop && !active && <span className="rounded-full bg-[#FF4F00]/15 dark:bg-[#FF4F00]/20 px-2.5 py-1 text-[11px] font-semibold text-[#FF4F00]">🔥 Popular</span>}
                          {isLast && <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 animate-pulse">⚡ Last spots!</span>}
                        </div>
                        {loading && active && <div className="mt-1.5 text-xs text-muted-foreground">Reserving…</div>}
                      </button>
                    );
                  });
                })()}
              </div>
              {!availLoading && slots.length === 0 && <div className="mt-3 text-sm text-muted-foreground">No slots found for this date. Try another date.</div>}
            </section>
          )}

          {/* SECTION 3: Customer & Checkout */}
          {!confirmed && selected && (
            <section ref={customerRef} className={`transition-all duration-500 ${customerReady ? mountedSections.has(3) ? 'animate-in fade-in slide-in-from-top-4 duration-500' : '' : 'pointer-events-none opacity-40'}`}>
              <SectionHeader number={3} title="Your details & checkout" active={customerReady} />
              <div className="mt-3 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4">
                <div className="mt-1">
                  <PromoCodeField orgId={orgId} gameId={gameId} promoCode={promoCode} setPromoCode={setPromoCode} promoStatus={promoStatus} promoMessage={promoMessage} onApply={() => validatePromo()} setPromoStatus={setPromoStatus} setPromoMessage={setPromoMessage} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-foreground dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[var(--widget-primary)]/50 transition-all duration-200" />
                </div>
                <div className="mt-4">
                  <ConfirmBar holdId={holdId} loading={loading || checkoutLoading} onConfirm={() => payAndConfirm()} />
                  {error && (
                    <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-in fade-in duration-300">
                      <div className="flex items-start gap-2"><span className="text-base">⚠️</span><span className="text-xs">{error}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ number, title, active }: { number: number; title: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${active ? 'bg-[var(--widget-primary)] text-white' : 'bg-gray-200 dark:bg-white/[0.06] text-gray-500 dark:text-white/30'}`}>{number}</div>
      <div className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

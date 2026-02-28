import type { Slot } from './widget-utils';
import { friendlyError } from './widget-utils';
import { emitBFEvent } from './widget-tracking';
import { validatePromoCode, type PromoStatus } from './validate-promo';
import type { HoldPricing } from './use-booking-engine';

/* ── Fetch with timeout ── */
export async function fetchT(url: string, opts: RequestInit = {}, ms = 10000): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: c.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new Error('request_timeout');
    throw err;
  } finally {
    clearTimeout(t);
  }
}

/* ── Safe sessionStorage (cross-origin iframe safe) ── */
export function safeSessionGet(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
export function safeSessionSet(key: string, val: string) {
  try { sessionStorage.setItem(key, val); } catch { /* cross-origin iframe */ }
}

/** Ensure a value is a string — prevents React #310 "Objects are not valid as React children". */
export function safeString(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  // Object/Array/Error — extract message if possible
  if (val instanceof Error) return val.message;
  if (typeof val === 'object' && val !== null && 'message' in val && typeof (val as { message?: unknown }).message === 'string') {
    return (val as { message: string }).message;
  }
  try { return JSON.stringify(val); } catch { return 'Something went wrong.'; }
}

/* ── Slot normalization ── */
export function normalizeSlots(rawSlots: unknown[]): Slot[] {
  return rawSlots
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      if ('roomId' in s && 'available' in s) {
        const rec = s as Record<string, unknown>;
        const startAt = typeof rec.startAt === 'string' ? rec.startAt : '';
        const endAt = typeof rec.endAt === 'string' ? rec.endAt : '';
        const roomId = String(rec.roomId);
        let roomName: string | undefined;
        if (typeof rec.roomName === 'string' && rec.roomName.trim() && rec.roomName !== roomId) roomName = rec.roomName.trim();
        return { startAt, endAt, roomId, roomName, available: Boolean(rec.available) };
      }
      if ('availableRooms' in s && Array.isArray((s as Record<string, unknown>).availableRooms)) {
        const rec = s as Record<string, unknown>;
        const startAt = typeof rec.startAt === 'string' ? rec.startAt : '';
        const endAt = typeof rec.endAt === 'string' ? rec.endAt : '';
        const rooms = rec.availableRooms as Array<{ roomId: string; name?: string; roomName?: string }>;
        const roomId = rooms[0]?.roomId ? String(rooms[0].roomId) : '';
        let roomName: string | undefined;
        const rawN = rooms[0]?.name;
        const rawRN = rooms[0]?.roomName;
        if (typeof rawN === 'string' && rawN.trim() && rawN !== roomId) roomName = rawN.trim();
        else if (typeof rawRN === 'string' && rawRN.trim() && rawRN !== roomId) roomName = rawRN.trim();
        return { startAt, endAt, roomId, roomName, available: rooms.length > 0 };
      }
      return null;
    })
    .filter(Boolean) as Slot[];
}

/* ── Load availability ── */
export async function fetchAvailability(params: {
  orgId: string; gameId: string; date: string; type: string; players: number;
  cache: Map<string, { ts: number; slots: Slot[] }>;
  force?: boolean; retried?: boolean;
  onSlots: (slots: Slot[]) => void;
  onError: (msg: string) => void;
  onLoading: (v: boolean) => void;
}): Promise<void> {
  const { orgId, gameId, date, type, players, cache, force = false, retried = false, onSlots, onError, onLoading } = params;
  const cacheKey = `${orgId}::${gameId}::${date}::${type}::${players}`;
  const nowMs = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && nowMs - cached.ts <= 60_000 && !retried) {
    onSlots(cached.slots);
    onError('');
    if (!force) { void fetchAvailability({ ...params, force: true }); return; }
  }

  onError('');
  onLoading(true);
  emitBFEvent('availability_request', { orgId, gameId, date, type, players, force });

  try {
    const qs = new URLSearchParams({ orgId, gameId, date, type, players: String(players) });
    let res: Response;
    try {
      res = await fetchT(`/api/v1/availability?${qs}`, {}, 8000);
    } catch (err) {
      if (err instanceof Error && err.message === 'request_timeout' && !retried) {
        await new Promise(r => setTimeout(r, 2000));
        res = await fetch(`/api/v1/availability?${qs}`);
      } else throw err;
    }

    const body = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const err = typeof body === 'object' && body && 'error' in body
        ? String((body as { error?: unknown }).error) : null;
      if ((err === 'server_error' || err === 'rate_limited') && !retried) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchAvailability({ ...params, force: true, retried: true });
      }
      onError(friendlyError(err ?? 'Failed to load availability'));
      emitBFEvent('availability_error', { orgId, gameId, error: err ?? 'failed' });
      return;
    }

    const rawSlots = typeof body === 'object' && body && 'slots' in body && Array.isArray((body as { slots?: unknown }).slots)
      ? (body as { slots: unknown[] }).slots : [];
    const normalized = normalizeSlots(rawSlots);
    onSlots(normalized);
    cache.set(cacheKey, { ts: nowMs, slots: normalized });
    onError('');
    emitBFEvent('availability_loaded', { orgId, gameId, date, type, players, slotsCount: normalized.length });
  } catch (err) {
    // Catch-all: network errors, JSON parse failures, etc.
    onError(friendlyError(err instanceof Error ? err.message : 'server_error'));
  } finally {
    onLoading(false);
  }
}

/* ── Create hold ── */
export async function fetchCreateHold(params: {
  orgId: string; gameId: string; slot: Slot; type: string; players: number;
  name: string; phone: string; email: string; trackPricing: boolean;
  onHold: (holdId: string, expiresAt: string | null) => void;
  onPricing: (p: HoldPricing) => void;
  onError: (msg: string) => void;
}): Promise<string | null> {
  const { orgId, gameId, slot, type, players, name, phone, email, trackPricing, onHold, onPricing, onError } = params;
  emitBFEvent('slot_selected', { orgId, gameId, startAt: slot.startAt, endAt: slot.endAt, roomId: slot.roomId });

  try {
    const res = await fetchT('/api/v1/holds', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orgId, gameId, roomId: slot.roomId, bookingType: type,
        startAt: slot.startAt, endAt: slot.endAt, players,
        customer: {
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(email.trim() ? { email: email.trim() } : {}),
        },
      }),
    });
    const body = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const err = typeof body === 'object' && body && 'error' in body
        ? String((body as { error?: unknown }).error) : null;
      onError(friendlyError(err ?? 'Failed to reserve this time'));
      emitBFEvent('hold_error', { orgId, gameId, error: err ?? 'failed' });
      return null;
    }

    const hold = typeof body === 'object' && body && 'hold' in body ? (body as { hold?: unknown }).hold : undefined;
    const hObj = hold as Record<string, unknown> | undefined;
    const holdId = hObj && typeof hObj.holdId === 'string' ? hObj.holdId : null;
    const expiresAt = hObj && typeof hObj.expiresAt === 'string' ? hObj.expiresAt : null;

    if (trackPricing && hObj) {
      onPricing({
        currency: typeof hObj.currency === 'string' ? hObj.currency : 'USD',
        subtotalCents: typeof hObj.subtotalCents === 'number' ? hObj.subtotalCents : 0,
        processingFeeCents: typeof hObj.processingFeeCents === 'number' ? hObj.processingFeeCents : 0,
        totalCents: typeof hObj.totalCents === 'number' ? hObj.totalCents : 0,
        processingFeeLabel: typeof hObj.processingFeeLabel === 'string' ? hObj.processingFeeLabel : undefined,
      });
    }

    if (holdId) {
      onHold(holdId, expiresAt);
      emitBFEvent('hold_created', { orgId, gameId, holdId, expiresAt });
    }
    return holdId;
  } catch (err) {
    // Catch-all: network errors, timeouts, JSON parse failures
    onError(friendlyError(err instanceof Error ? err.message : 'server_error'));
    return null;
  }
}

/* ── Validate & apply promo ── */
export async function fetchValidatePromo(params: {
  orgId: string; code: string; holdId: string | null; trackPricing: boolean;
  onStatus: (s: PromoStatus, msg: string) => void;
  onPricingUpdate: (updater: (prev: HoldPricing | null) => HoldPricing | null) => void;
}) {
  const { orgId, code, holdId, trackPricing, onStatus, onPricingUpdate } = params;
  if (!code.trim()) { onStatus('idle', ''); return; }
  onStatus('checking', 'Checking…');

  try {
    const res = await validatePromoCode({ orgId, code: code.trim() });
    onStatus(res.status, safeString(res.message));

    if (res.status === 'valid' && holdId && trackPricing) {
      try {
        const applyRes = await fetchT('/api/v1/holds/apply-promo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orgId, holdId, code: code.trim() }),
        }, 5000);
        if (applyRes.ok) {
          const ab = (await applyRes.json().catch(() => null)) as Record<string, unknown> | null;
          if (ab && 'totalCents' in ab) {
            onPricingUpdate(prev => prev ? {
              ...prev,
              discountedSubtotalCents: typeof ab.discountedSubtotalCents === 'number' ? ab.discountedSubtotalCents : prev.subtotalCents,
              promoDiscountCents: typeof ab.discountCents === 'number' ? ab.discountCents : undefined,
              processingFeeCents: typeof ab.processingFeeCents === 'number' ? ab.processingFeeCents : prev.processingFeeCents,
              totalCents: typeof ab.totalCents === 'number' ? ab.totalCents : prev.totalCents,
            } : prev);
          }
        }
      } catch { /* ignore apply error — validation result already shown */ }
    }
  } catch {
    onStatus('invalid', 'Could not validate promo code. Please try again.');
  }
}

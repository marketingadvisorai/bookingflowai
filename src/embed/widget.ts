import { addMonths, daysInMonth, fmtMoney, fmtMonthLabel, fmtTime } from './util/format';
import { el, qs } from './util/dom';

import { fetchWithRetry, pickError, readJson } from './api/http';

type BookingType = 'private' | 'public';

type Step = 'game' | 'date' | 'time' | 'participants' | 'checkout' | 'done';

type Slot = {
  startAt: string;
  endAt: string;
  availableRooms: { roomId: string; name: string; remainingPlayers?: number }[];
};

type CatalogGame = {
  gameId: string;
  name: string;
  durationMins: number;
  bufferMins: number;
  slotIntervalMins: number;
  minPlayers: number;
  maxPlayers: number;
  allowPrivate: boolean;
  allowPublic: boolean;
  heroImageUrl?: string;
  heroImageThumbUrl?: string;
  previewVideoUrl?: string;
  galleryImageUrls?: string[];

  pricingCurrency?: string;
  startingUnitAmountCents?: number | null;
};

type Config = {
  apiBase: string;
  orgId: string;
  // Optional: if provided, skip game selection.
  gameId?: string;
  theme?: {
    accent?: string;
    mode?: 'dark' | 'light';
  };
};




function isValidEmailOrEmpty(s: string) {
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}



function dayOfWeekIndex(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split('-').map((n) => Number(n));
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d));
  // 0=Sun ... 6=Sat
  return dt.getUTCDay();
}

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function scopeCss(cssText: string, scope: string) {
  // Scope all widget styles under a container selector (used when we cannot rely on Shadow DOM).
  return cssText
    .replace(
      '*,*::before,*::after',
      `${scope} *,${scope} *::before,${scope} *::after`
    )
    .replace(/\n\s*\./g, `\n  ${scope} .`)
    .replace(/\n\s*input\{/g, `\n  ${scope} input{`);
}

type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_PREFIX = 'bfw:theme:v1:';

function readStoredTheme(orgId: string): ThemeMode | null {
  try {
    const v = localStorage.getItem(`${THEME_STORAGE_PREFIX}${orgId}`);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(orgId: string, mode: ThemeMode) {
  try {
    localStorage.setItem(`${THEME_STORAGE_PREFIX}${orgId}`, mode);
  } catch {
    // ignore
  }
}

function css(accent: string, mode: ThemeMode) {
  return `
  /* minimal reset (avoid all:initial which can break focus in some embedded browsers) */
  *,*::before,*::after{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"}
  .wrap{--bf-accent:${accent};--bf-bg:${mode === 'light' ? '#ffffff' : 'rgba(255,255,255,.06)'};--bf-text:${mode === 'light' ? '#111827' : '#ffffff'};--bf-muted:${mode === 'light' ? '#6b7280' : 'rgba(255,255,255,.65)'};--bf-border:${mode === 'light' ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.15)'};--bf-border-soft:${mode === 'light' ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.10)'};--bf-surface:${mode === 'light' ? '#ffffff' : 'rgba(0,0,0,.20)'};--bf-surface2:${mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,.10)'};position:relative;overflow:hidden;border-radius:28px;border:1px solid var(--bf-border);background:var(--bf-bg);padding:20px;color:var(--bf-text);box-shadow:${mode === 'light' ? '0 30px 80px rgba(0,0,0,.15)' : '0 30px 80px rgba(0,0,0,.35)'};}
  @media(max-width:520px){.wrap{border-radius:0; border-left:0; border-right:0; padding:16px}}
  .bg{pointer-events:none;position:absolute;inset:0;opacity:${mode === 'light' ? '.55' : '.75'}}
  .blob1{position:absolute;left:-96px;top:-96px;width:280px;height:280px;border-radius:999px;background:${mode === 'light' ? `${accent}26` : `${accent}59`};filter:blur(60px)}
  .blob2{position:absolute;right:-96px;bottom:-96px;width:280px;height:280px;border-radius:999px;background:rgba(217,70,239,.20);filter:blur(60px)}
  .panel{position:relative}

  .header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
  .headerLeft{display:flex;gap:10px;align-items:flex-start}
  .title{font-size:18px;font-weight:700;line-height:1.2;margin:0;letter-spacing:-0.02em}
  .sub{font-size:11px;color:var(--bf-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.05em}
  .pill{border-radius:999px;background:${mode === 'light' ? 'rgba(0,0,0,.04)' : 'rgba(0,0,0,.30)'};border:1px solid var(--bf-border-soft);padding:6px 10px;font-size:12px;color:${mode === 'light' ? '#374151' : 'rgba(255,255,255,.7)'}}
  .themeToggle{width:32px;min-width:32px;height:32px;padding:0;display:flex;align-items:center;justify-content:center;font-size:14px}

  .layout{display:grid;gap:16px;margin-top:16px}
  @media(min-width:860px){.layout{grid-template-columns:1.3fr .9fr;align-items:start}}

  /* Mobile: fixed bottom sticky bar (but never overlaps content due to dynamic padding) */
  .summary{position:relative}
  .main{position:relative;padding-bottom:var(--bottom-pad, 0px)}
  .summary.hidden{display:none}
  .wrap.typing .summary{display:none}
  @media(max-width:859px){
    .summary{position:fixed;left:12px;right:12px;bottom:12px;z-index:20;backdrop-filter:blur(12px)}
    .chips{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}
    .chips::-webkit-scrollbar{display:none}
  }

  .card{border-radius:18px;border:1px solid var(--bf-border);background:var(--bf-surface);padding:16px}
  .cardTitle{font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.02em}
  .muted{font-size:12px;color:var(--bf-muted)}

  .btn{appearance:none;border:0;cursor:pointer;border-radius:14px;background:var(--bf-surface2);color:var(--bf-text);padding:12px 16px;font-size:13px}
  @media(max-width:859px){.btn{min-height:44px}}
  .btn.small{padding:8px 10px;font-size:12px;border-radius:12px}
  .btn.primary{background:var(--bf-accent);color:${mode === 'light' ? '#ffffff' : '#000'};font-weight:800}
  .btn.ghost{background:transparent;border:1px solid ${mode === 'light' ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.18)'};color:${mode === 'light' ? '#374151' : 'var(--bf-text)'}}
  .btn:disabled{opacity:.55;cursor:not-allowed}

  .row{display:flex;gap:8px;align-items:center}
  .summaryActions{display:flex;gap:10px;align-items:center;margin-top:10px}

  .segmented{display:flex;gap:8px;align-items:center}
  .segmented .btn{flex:1}
  .stepper{display:flex;gap:10px;align-items:center}
  .stepper .count{min-width:90px;text-align:center;font-weight:800}
  .summaryActions .btn.primary{min-width:140px}
  @media(max-width:859px){
    .summary{padding:12px}
    .summaryActions{margin-top:8px}
    .summaryActions .btn.primary{flex:1;min-width:0}
    .summaryActions .btn.ghost{padding:10px 10px}
    /* keep bar compact */
    .chips .chip:nth-child(n+4){display:none}
  }

  .skeleton{border-radius:14px;background:rgba(255,255,255,.08);position:relative;overflow:hidden}
  .skeleton::after{content:'';position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent);animation:shimmer 1.2s infinite}
  @keyframes shimmer{100%{transform:translateX(100%)}}
  .grid2{display:grid;gap:10px;grid-template-columns:1fr}
  @media(min-width:860px){.grid2{grid-template-columns:1fr 1fr}}

  .games{display:grid;gap:10px}
  @media(min-width:720px){.games{grid-template-columns:1fr 1fr}}

  .gameCard{border-radius:18px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.08);padding:14px;text-align:left;overflow:hidden}
  @media(max-width:859px){.gameCard{min-height:70px}}
  .gameMedia{height:120px;border-radius:14px;overflow:hidden;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.10);position:relative;pointer-events:none}
  @media(min-width:860px){.gameMedia{height:140px}}
  .gameMedia video,.gameMedia img{width:100%;height:100%;object-fit:cover;display:block}
  .gameMedia::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.55))}
  .gameName{font-size:14px;font-weight:800;margin-top:12px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .chip{border-radius:999px;background:rgba(0,0,0,.35);padding:6px 10px;font-size:12px;color:rgba(255,255,255,.75)}

  .calendarHeader{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .monthLabel{font-size:13px;font-weight:800}
  .dow{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:10px;color:rgba(255,255,255,.55);font-size:11px}
  .days{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:8px}
  .dayBtn{height:40px;border-radius:12px;border:1px solid var(--bf-border);background:${mode === 'light' ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.06)'};color:var(--bf-text);font-size:12px}
  @media(max-width:859px){.dayBtn{height:40px}}
  .dayBtn.empty{opacity:0;border-color:transparent;background:transparent;pointer-events:none}
  .dayBtn.disabled{opacity:.35;cursor:not-allowed}
  .dayBtn.selected{border-color:var(--bf-accent);background:${mode === 'light' ? `${accent}1f` : `${accent}33`}}

  .slots{display:grid;gap:10px;margin-top:12px;grid-template-columns:1fr}
  /* Tablet/Desktop: two columns */
  @media(min-width:720px){.slots{grid-template-columns:repeat(2,1fr)}}
  .slot{border-radius:16px;border:1px solid var(--bf-border);background:var(--bf-surface2);padding:12px;text-align:left}
  .slot.active{border-color:var(--bf-accent);background:${mode === 'light' ? `${accent}1f` : `${accent}33`}}
  .slotTitle{font-size:13px;font-weight:800}
  .slotSub{font-size:11px;color:rgba(255,255,255,.65);margin-top:2px}

  /* iOS: 16px+ prevents Safari zooming on focus */
  input{width:100%;height:44px;border-radius:14px;border:1px solid var(--bf-border);background:${mode === 'light' ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.10)'};color:var(--bf-text);padding:0 12px;font-size:16px;outline:none;-webkit-user-select:text;user-select:text;touch-action:manipulation;}
  input:focus{border-color:var(--bf-accent)}

  .err{font-size:12px;color:${mode === 'light' ? '#DC2626' : 'rgba(254,202,202,1)'}}
  .ok{font-size:12px;color:${mode === 'light' ? '#059669' : 'rgba(187,247,208,1)'}}
  `;
}

export function mountBookingFlowWidget(container: HTMLElement, cfg: Config) {
  const accent = cfg.theme?.accent ?? '#E54D27';

  // Debug mode (adds on-screen logs). Enable via ?debug=1 on the host page.
  const debug = (() => {
    try {
      return new URLSearchParams(window.location.search).get('debug') === '1';
    } catch {
      return false;
    }
  })();

  // Shadow DOM has inconsistent focus/keyboard behavior across browsers and embedded contexts.
  // Keep it simple and reliable: render in light DOM with scoped CSS.
  const useShadow = false;

  const root: HTMLElement | ShadowRoot = useShadow ? container.attachShadow({ mode: 'open' }) : container;
  if (!useShadow) {
    // Ensure a stable scope selector.
    if (!container.id) container.id = `bfw-${Math.random().toString(16).slice(2)}`;
    container.setAttribute('data-bf-widget', '1');
  }

  let themeMode: ThemeMode = readStoredTheme(cfg.orgId) ?? cfg.theme?.mode ?? 'dark';

  const style = el('style');
  function applyStyle() {
    const raw = css(accent, themeMode);
    style.textContent = useShadow ? raw : scopeCss(raw, `#${container.id}`);
  }
  applyStyle();

  const wrap = el('div', { class: 'wrap' });

  const dbg = debug ? el('div', { class: 'pill' }) : null;
  const dbgLines: string[] = [];
  const log = (msg: string) => {
    if (!debug || !dbg) return;
    const line = `${new Date().toISOString().slice(11, 19)} ${msg}`;
    dbgLines.push(line);
    while (dbgLines.length > 6) dbgLines.shift();
    dbg.textContent = dbgLines.join(' | ');
  };

  const bg = el('div', { class: 'bg' });
  bg.append(el('div', { class: 'blob1' }), el('div', { class: 'blob2' }));

  const panel = el('div', { class: 'panel' });

  if (debug) {
    // Global focus/click telemetry (light DOM only)
    document.addEventListener('focusin', (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (container.contains(t)) log(`focusin:${t.tagName}${t.getAttribute('placeholder') ? `(${t.getAttribute('placeholder')})` : ''}`);
    });
    document.addEventListener('click', (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (container.contains(t)) log(`click:${t.tagName}${t.getAttribute('placeholder') ? `(${t.getAttribute('placeholder')})` : ''}`);
    });
  }

  // state
  let step: Step = cfg.gameId ? 'date' : 'game';
  let loading = false;
  let error: string | null = null;

  let catalog: CatalogGame[] = [];
  let selectedGameId: string | null = cfg.gameId ?? null;
  let selectedGame: CatalogGame | null = null;

  let type: BookingType = 'private';
  let players = 2;

  let monthCursor = new Date().toISOString().slice(0, 7);
  let availableDates = new Set<string>(); // union for rendered months

  let selectedDate: string | null = null;
  let slots: Slot[] = [];
  let selectedSlot: { startAt: string; endAt: string; roomId: string } | null = null;

  let holdId: string | null = null;
  let holdExpiresAt: string | null = null;
  let holdPricing: {
    currency?: string;
    subtotalCents?: number;
    processingFeeCents?: number;
    totalCents?: number;
    processingFeeBps?: number;
    processingFeeLabel?: string;
  } | null = null;

  let name = '';
  let phone = '';
  let email = '';
  let confirmedBookingId: string | null = null;
  let confirmedBookingSummary: { startAt?: string; gameId?: string; bookingType?: BookingType; players?: number } | null = null;

  const storageKey = `bfw:v1:${cfg.orgId}`;
  let lastPersistMs = 0;

  function persistState(force = false) {
    const now = Date.now();
    if (!force && now - lastPersistMs < 1000) return;
    lastPersistMs = now;

    try {
      const payload = {
        v: 1,
        t: now,
        step,
        selectedGameId,
        type,
        players,
        monthCursor,
        selectedDate,
        selectedSlot,
        holdId,
        holdExpiresAt,
        holdPricing,
        name,
        phone,
        email,
        confirmedBookingId,
        confirmedBookingSummary,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') return;

      if (typeof parsed.selectedGameId === 'string') selectedGameId = parsed.selectedGameId;
      if (parsed.type === 'private' || parsed.type === 'public') type = parsed.type;
      if (typeof parsed.players === 'number') players = parsed.players;
      if (typeof parsed.monthCursor === 'string') monthCursor = parsed.monthCursor;
      if (typeof parsed.selectedDate === 'string') selectedDate = parsed.selectedDate;
      if (parsed.selectedSlot && typeof parsed.selectedSlot === 'object') {
        const s = parsed.selectedSlot as { startAt?: unknown; endAt?: unknown; roomId?: unknown };
        if (typeof s.startAt === 'string' && typeof s.endAt === 'string' && typeof s.roomId === 'string') {
          selectedSlot = { startAt: s.startAt, endAt: s.endAt, roomId: s.roomId };
        }
      }
      if (typeof parsed.holdId === 'string') holdId = parsed.holdId;
      if (typeof parsed.holdExpiresAt === 'string') holdExpiresAt = parsed.holdExpiresAt;
      if (parsed.holdPricing && typeof parsed.holdPricing === 'object') {
        const p = parsed.holdPricing as Record<string, unknown>;
        holdPricing = {
          ...(typeof p.currency === 'string' ? { currency: p.currency } : {}),
          ...(typeof p.subtotalCents === 'number' ? { subtotalCents: p.subtotalCents } : {}),
          ...(typeof p.processingFeeCents === 'number' ? { processingFeeCents: p.processingFeeCents } : {}),
          ...(typeof p.totalCents === 'number' ? { totalCents: p.totalCents } : {}),
          ...(typeof p.processingFeeBps === 'number' ? { processingFeeBps: p.processingFeeBps } : {}),
          ...(typeof p.processingFeeLabel === 'string' ? { processingFeeLabel: p.processingFeeLabel } : {}),
        };
      }
      if (typeof parsed.name === 'string') name = parsed.name;
      if (typeof parsed.phone === 'string') phone = parsed.phone;
      if (typeof parsed.email === 'string') email = parsed.email;
      if (typeof parsed.confirmedBookingId === 'string') confirmedBookingId = parsed.confirmedBookingId;
      if (parsed.confirmedBookingSummary && typeof parsed.confirmedBookingSummary === 'object') {
        const b = parsed.confirmedBookingSummary as { startAt?: unknown; gameId?: unknown; bookingType?: unknown; players?: unknown };
        confirmedBookingSummary = {
          ...(typeof b.startAt === 'string' ? { startAt: b.startAt } : {}),
          ...(typeof b.gameId === 'string' ? { gameId: b.gameId } : {}),
          ...(b.bookingType === 'private' || b.bookingType === 'public' ? { bookingType: b.bookingType } : {}),
          ...(typeof b.players === 'number' ? { players: b.players } : {}),
        };
      }

      // If the hold is expired, clear it.
      if (holdExpiresAt && new Date(holdExpiresAt).getTime() <= Date.now()) {
        holdId = null;
        holdExpiresAt = null;
        holdPricing = null;
      }

      // Choose a sensible step on restore.
      if (confirmedBookingId) {
        step = 'done';
      } else if (holdId) {
        step = 'checkout';
      } else if (selectedSlot) {
        step = 'participants';
      } else if (selectedDate) {
        step = 'time';
      } else if (selectedGameId) {
        step = 'date';
      }
    } catch {
      // ignore
    }
  }

  // Mobile UX: we hide the fixed bottom bar while user is typing using a CSS class on `.wrap`.
  // This avoids re-rendering on focus (which breaks iOS keyboard).
  let hideBottomBar = false;

  function syncBottomBarVisibility() {
    // keep for debug/compat: do not let it stick hidden
    if (step !== 'checkout' && hideBottomBar) hideBottomBar = false;
  }

  function isHoldExpired() {
    if (!holdExpiresAt) return false;
    return new Date(holdExpiresAt).getTime() <= Date.now();
  }

  function getCountdown() {
    if (!holdExpiresAt) return null;
    const ms = new Date(holdExpiresAt).getTime() - Date.now();
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  async function loadCatalog() {
    loading = true;
    error = null;
    render();

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      error = 'You appear to be offline.';
      loading = false;
      render();
      return;
    }

    try {
      const u = new URL(qs(cfg.apiBase, '/api/v1/catalog'));
      u.searchParams.set('orgId', cfg.orgId);
      const res = await fetchWithRetry(u.toString());
      const body = await readJson(res);
      if (!res.ok) {
        error = pickError(body) ?? 'Failed to load games';
        loading = false;
        render();
        return;
      }

      const games =
        typeof body === 'object' && body && 'games' in body && Array.isArray((body as { games?: unknown }).games)
          ? ((body as { games: unknown[] }).games as CatalogGame[])
          : [];

      catalog = games;

      if (selectedGameId) {
        selectedGame = catalog.find((g) => g.gameId === selectedGameId) ?? null;
        if (selectedGame) {
          // pick default type
          type = selectedGame.allowPrivate ? 'private' : 'public';
          players = Math.max(selectedGame.minPlayers, Math.min(players, selectedGame.maxPlayers));
        }
      }

      loading = false;
      render();
    } catch {
      error = 'Network error. Please retry.';
      loading = false;
      render();
    }
  }

  async function fetchAvailableDatesForMonth(yyyyMm: string) {
    if (!selectedGameId) return [] as string[];

    const u = new URL(qs(cfg.apiBase, '/api/v1/calendar'));
    u.searchParams.set('orgId', cfg.orgId);
    u.searchParams.set('gameId', selectedGameId);
    u.searchParams.set('month', yyyyMm);
    u.searchParams.set('type', type);
    u.searchParams.set('players', String(players));

    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('You appear to be offline.');

    let res: Response;
    try {
      res = await fetchWithRetry(u.toString());
    } catch {
      throw new Error('Network error. Please retry.');
    }
    const body = await readJson(res);
    if (!res.ok) throw new Error(pickError(body) ?? 'Failed to load calendar');

    const dates =
      typeof body === 'object' && body && 'availableDates' in body && Array.isArray((body as { availableDates?: unknown }).availableDates)
        ? ((body as { availableDates: unknown[] }).availableDates as string[])
        : [];

    return dates;
  }

  async function loadCalendarForTwoMonths(baseMonth: string) {
    if (!selectedGameId) return;

    loading = true;
    error = null;
    render();

    try {
      const m1 = baseMonth;
      const m2 = addMonths(baseMonth, 1);
      const [d1, d2] = await Promise.all([fetchAvailableDatesForMonth(m1), fetchAvailableDatesForMonth(m2)]);
      availableDates = new Set([...d1, ...d2]);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load calendar';
    } finally {
      loading = false;
      render();
    }
  }

  async function loadAvailabilityForDate(date: string) {
    if (!selectedGameId) return;

    loading = true;
    error = null;
    render();

    const u = new URL(qs(cfg.apiBase, '/api/v1/availability'));
    u.searchParams.set('orgId', cfg.orgId);
    u.searchParams.set('gameId', selectedGameId);
    u.searchParams.set('date', date);
    u.searchParams.set('type', type);
    u.searchParams.set('players', String(players));

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      error = 'You appear to be offline.';
      loading = false;
      render();
      return;
    }

    let res: Response;
    try {
      res = await fetchWithRetry(u.toString());
    } catch {
      error = 'Network error. Please retry.';
      loading = false;
      render();
      return;
    }

    const body = await readJson(res);
    if (!res.ok) {
      error = pickError(body) ?? 'Failed to load times';
      loading = false;
      render();
      return;
    }

    const raw =
      typeof body === 'object' && body && 'slots' in body && Array.isArray((body as { slots?: unknown }).slots)
        ? ((body as { slots: unknown[] }).slots as Slot[])
        : [];

    slots = raw;
    loading = false;
    render();
  }

  async function createHold() {
    if (!selectedGameId || !selectedSlot) return;

    loading = true;
    error = null;
    render();

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      error = 'You appear to be offline.';
      loading = false;
      render();
      return;
    }

    let res: Response;
    try {
      res = await fetchWithRetry(qs(cfg.apiBase, '/api/v1/holds'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orgId: cfg.orgId,
        gameId: selectedGameId,
        roomId: selectedSlot.roomId,
        bookingType: type,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        players,
        customer:
          name || phone || email
            ? {
                ...(name ? { name } : {}),
                ...(phone ? { phone } : {}),
                ...(email ? { email } : {}),
              }
            : undefined,
      }),
    });
    } catch {
      error = 'Network error. Please retry.';
      loading = false;
      render();
      return;
    }
    const body = await readJson(res);
    if (!res.ok) {
      const err = pickError(body) ?? 'Failed to reserve slot';
      error = err;
      loading = false;

      if (err === 'slot_unavailable' || err === 'slot_capacity_exceeded') {
        // Auto-recover: refresh times for the selected date.
        holdId = null;
        holdExpiresAt = null;
        step = 'time';
        if (selectedDate) loadAvailabilityForDate(selectedDate);
      }

      render();
      return;
    }

    const hold = typeof body === 'object' && body && 'hold' in body ? (body as { hold?: unknown }).hold : undefined;
    holdId =
      typeof hold === 'object' && hold && 'holdId' in hold ? String((hold as { holdId?: unknown }).holdId) : null;
    holdExpiresAt =
      typeof hold === 'object' && hold && 'expiresAt' in hold ? String((hold as { expiresAt?: unknown }).expiresAt) : null;

    // Pricing snapshot (optional fields)
    if (typeof hold === 'object' && hold) {
      const h = hold as Record<string, unknown>;
      holdPricing = {
        ...(typeof h.currency === 'string' ? { currency: h.currency } : {}),
        ...(typeof h.subtotalCents === 'number' ? { subtotalCents: h.subtotalCents } : {}),
        ...(typeof h.processingFeeCents === 'number' ? { processingFeeCents: h.processingFeeCents } : {}),
        ...(typeof h.totalCents === 'number' ? { totalCents: h.totalCents } : {}),
        ...(typeof h.processingFeeBps === 'number' ? { processingFeeBps: h.processingFeeBps } : {}),
        ...(typeof h.processingFeeLabel === 'string' ? { processingFeeLabel: h.processingFeeLabel } : {}),
      };
      persistState(true);
    }

    step = 'checkout';
    loading = false;
    render();
  }

  async function loadConfirmedBookingSummary() {
    if (!confirmedBookingId) return;

    try {
      const u = new URL(qs(cfg.apiBase, `/api/v1/bookings/${encodeURIComponent(confirmedBookingId)}`));
      u.searchParams.set('orgId', cfg.orgId);
      const res = await fetchWithRetry(u.toString());
      const body = await readJson(res);
      if (!res.ok) return;
      const booking =
        typeof body === 'object' && body && 'booking' in body ? (body as { booking?: unknown }).booking : undefined;
      if (typeof booking !== 'object' || !booking) return;
      const b = booking as { startAt?: unknown; gameId?: unknown; bookingType?: unknown; players?: unknown };
      confirmedBookingSummary = {
        ...(typeof b.startAt === 'string' ? { startAt: b.startAt } : {}),
        ...(typeof b.gameId === 'string' ? { gameId: b.gameId } : {}),
        ...(b.bookingType === 'private' || b.bookingType === 'public' ? { bookingType: b.bookingType } : {}),
        ...(typeof b.players === 'number' ? { players: b.players } : {}),
      };
      persistState(true);
    } catch {
      // ignore
    }
  }

  async function confirmBooking() {
    if (!holdId) return;

    if (isHoldExpired()) {
      error = 'Hold expired. Please choose a new time.';
      holdId = null;
      holdExpiresAt = null;
      step = 'time';
      if (selectedDate) loadAvailabilityForDate(selectedDate);
      render();
      return;
    }

    loading = true;
    error = null;
    render();

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      error = 'You appear to be offline.';
      loading = false;
      render();
      return;
    }

    // Stripe-first flow: create Checkout Session and redirect.
    let res: Response;
    try {
      res = await fetchWithRetry(qs(cfg.apiBase, '/api/v1/stripe/checkout/create'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orgId: cfg.orgId,
          holdId,
          // Return to the embedding page.
          returnUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
    } catch {
      error = 'Network error. Please retry.';
      loading = false;
      render();
      return;
    }

    const body = await readJson(res);

    // If already confirmed, show success immediately.
    if (res.ok && typeof body === 'object' && body && 'alreadyConfirmed' in body && (body as { alreadyConfirmed?: unknown }).alreadyConfirmed) {
      const bookingId =
        typeof body === 'object' && body && 'bookingId' in body ? String((body as { bookingId?: unknown }).bookingId) : `booking_${holdId}`;
      confirmedBookingId = bookingId;
      confirmedBookingSummary = { gameId: selectedGameId ?? undefined, bookingType: type, players, startAt: selectedSlot?.startAt };
      step = 'done';
      loading = false;
      void loadConfirmedBookingSummary();
      render();
      return;
    }

    if (!res.ok) {
      const e = pickError(body) ?? 'Failed to start checkout';
      error = e === 'hold_expired' ? 'Hold expired. Please choose a new time.' : e;
      loading = false;
      render();
      return;
    }

    const url = typeof body === 'object' && body && 'url' in body ? String((body as { url?: unknown }).url) : '';
    if (!url) {
      error = 'Missing checkout URL.';
      loading = false;
      render();
      return;
    }

    // Redirect the full page to Stripe Checkout.
    window.location.href = url;
  }

  function renderMonth(yyyyMm: string, opts?: { showNav?: boolean; loading?: boolean }) {
    const card = el('div', { class: 'card' });

    const header = el('div', { class: 'calendarHeader' });
    const label = el('div', { class: 'monthLabel' });
    label.textContent = fmtMonthLabel(yyyyMm);

    const nav = el('div', { class: 'row' });
    const prev = el('button', { class: 'btn ghost' });
    prev.textContent = '‹';
    prev.onclick = () => {
      monthCursor = addMonths(monthCursor, -1);
      selectedDate = null;
      slots = [];
      selectedSlot = null;
      loadCalendarForTwoMonths(monthCursor);
    };
    const next = el('button', { class: 'btn ghost' });
    next.textContent = '›';
    next.onclick = () => {
      monthCursor = addMonths(monthCursor, 1);
      selectedDate = null;
      slots = [];
      selectedSlot = null;
      loadCalendarForTwoMonths(monthCursor);
    };

    if (opts?.showNav) nav.append(prev, next);

    header.append(label, nav);

    const dow = el('div', { class: 'dow' });
    for (const d of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) {
      const x = el('div');
      x.textContent = d;
      dow.append(x);
    }

    const days = el('div', { class: 'days' });
    const total = daysInMonth(yyyyMm);
    const firstDow = dayOfWeekIndex(`${yyyyMm}-01`);

    for (let i = 0; i < firstDow; i++) {
      const empty = el('button', { class: 'dayBtn empty' });
      empty.textContent = '';
      days.append(empty);
    }

    if (opts?.loading) {
      // skeleton grid
      for (let i = 0; i < total; i++) {
        const s = el('div', { class: 'dayBtn skeleton' });
        (s as HTMLElement).style.height = '40px';
        days.append(s);
      }
      card.append(header, dow, days);
      return card;
    }

    for (let d = 1; d <= total; d++) {
      const dd = String(d).padStart(2, '0');
      const date = `${yyyyMm}-${dd}`;
      const enabled = availableDates.has(date);
      const btn = el('button', { class: 'dayBtn' });
      btn.textContent = dd;
      if (!enabled) btn.classList.add('disabled');
      if (selectedDate === date) btn.classList.add('selected');
      btn.disabled = !enabled || loading;
      btn.onclick = () => {
        selectedDate = date;
        selectedSlot = null;
        slots = [];
        step = 'time';
        render();
        loadAvailabilityForDate(date);
      };
      days.append(btn);
    }

    card.append(header, dow, days);
    return card;
  }

  function render() {
    syncBottomBarVisibility();
    persistState();
    panel.innerHTML = '';

    const head = el('div', { class: 'header' });
    const headerLeft = el('div', { class: 'headerLeft' });
    const left = el('div');
    const title = el('h2', { class: 'title' });

    const stepTitle: Record<Step, string> = {
      game: 'Choose game',
      date: 'Pick a date',
      time: 'Pick a time',
      participants: 'Participants',
      checkout: 'Checkout',
      done: 'Booking confirmed',
    };

    title.textContent = stepTitle[step];
    const subtitle = el('div', { class: 'sub' });

    const stepOrder: Record<Step, number> = {
      game: 1,
      date: 2,
      time: 3,
      participants: 4,
      checkout: 4,
      done: 4,
    };

    subtitle.textContent = `Step ${stepOrder[step]} of 4 • Calendar-first booking widget (v2).`;
    left.append(title, subtitle);

    // Back button (mobile + desktop)
    const back = el('button', { class: 'btn ghost' });
    back.textContent = 'Back';
    back.style.height = '36px';
    back.onclick = () => {
      error = null;
      if (step === 'date') {
        step = 'game';
        return render();
      }
      if (step === 'time') {
        step = 'date';
        selectedSlot = null;
        slots = [];
        return render();
      }
      if (step === 'participants') {
        step = 'time';
        holdId = null;
        holdExpiresAt = null;
        return render();
      }
      if (step === 'checkout') {
        // Going back means the user intends to change players/type.
        // Invalidate any existing hold so checkout always reflects latest selection.
        holdId = null;
        holdExpiresAt = null;
        step = 'participants';
        return render();
      }
    };

    const pill = el('div', { class: 'pill' });
    const cd = getCountdown();
    pill.textContent = holdId && cd ? `Hold ${cd}` : 'v2';

    const themeToggle = el('button', { class: 'btn ghost themeToggle' });
    themeToggle.type = 'button';
    themeToggle.setAttribute('aria-label', `Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`);
    themeToggle.textContent = themeMode === 'dark' ? '☀' : '☾';
    themeToggle.onclick = () => {
      themeMode = themeMode === 'dark' ? 'light' : 'dark';
      writeStoredTheme(cfg.orgId, themeMode);
      applyStyle();
      render();
    };

    // Compose header
    if (step === 'game' && !cfg.gameId) {
      // no back
    } else if (!(step === 'game' && cfg.gameId)) {
      headerLeft.append(back);
    }
    headerLeft.append(left);
    if (debug && dbg) {
      // show debug pill on the left header side (compact)
      dbg.style.marginTop = '2px';
      headerLeft.append(dbg);
    }

    head.append(headerLeft, pill);

    const layout = el('div', { class: 'layout' });
    const main = el('div', { class: 'card main' });
    // Show the sticky bar on all steps (users expect persistent CTA),
    // but never during typing on checkout.
    const shouldShowSummary = !hideBottomBar;
    const summary = el('div', { class: `card summary ${shouldShowSummary ? '' : 'hidden'}`.trim() });

    // Dynamic bottom padding so fixed bar never overlaps the main content.
    // (Needed for mobile Safari + small screens.)
    const setBottomPad = () => {
      const isMobile = window.matchMedia('(max-width: 859px)').matches;
      if (!isMobile || !shouldShowSummary || wrap.classList.contains('typing')) {
        wrap.style.setProperty('--bottom-pad', '0px');
        return;
      }
      const h = Math.min(220, Math.max(96, summary.getBoundingClientRect().height + 18));
      wrap.style.setProperty('--bottom-pad', `${h}px`);
    };


    // Summary
    const sTitle = el('div', { class: 'cardTitle' });
    sTitle.textContent = 'Booking Details';

    const chips = el('div', { class: 'chips' });

    const addChip = (text: string) => {
      const c = el('div', { class: 'chip' });
      c.textContent = text;
      chips.append(c);
    };

    if (selectedGame) addChip(selectedGame.name);
    if (selectedDate) addChip(selectedDate);
    if (selectedSlot) addChip(`${fmtTime(selectedSlot.startAt)}`);
    addChip(`${players} players`);
    addChip(type);

    const actions = el('div', { class: 'summaryActions' });
    const reset = el('button', { class: 'btn ghost small' });
    reset.textContent = 'Reset';
    reset.onclick = () => {
      step = cfg.gameId ? 'date' : 'game';
      selectedGameId = cfg.gameId ?? null;
      selectedGame = cfg.gameId ? selectedGame : null;
      selectedDate = null;
      slots = [];
      selectedSlot = null;
      holdId = null;
      holdExpiresAt = null;
      confirmedBookingId = null;
      hideBottomBar = false;
      error = null;
      persistState(true);
      render();
      if (!cfg.gameId) loadCatalog();
      else loadCalendarForTwoMonths(monthCursor);
    };

    const next = el('button', { class: 'btn primary' });
    next.textContent = loading ? 'Working…' : step === 'checkout' ? 'Confirm booking' : 'Next';
    next.disabled = loading;

    next.onclick = async () => {
      if (step === 'game') {
        if (!selectedGameId) return;
        step = 'date';
        render();
        await loadCalendarForTwoMonths(monthCursor);
        return;
      }
      if (step === 'date') {
        // date is selected by clicking a day.
        return;
      }
      if (step === 'time') {
        if (!selectedSlot) return;
        step = 'participants';
        render();
        return;
      }
      if (step === 'participants') {
        // Create hold and move to checkout.
        await createHold();
        return;
      }
      if (step === 'checkout') {
        await confirmBooking();
        return;
      }
    };

    actions.append(reset, next);

    summary.append(sTitle, chips, actions);

    // Main
    if (error) {
      const e = el('div', { class: 'err' });
      e.textContent = error;

      const retry = el('button', { class: 'btn ghost small' });
      retry.textContent = 'Retry';
      retry.onclick = () => {
        error = null;
        // Best-effort retry based on current step.
        if (step === 'game') return loadCatalog();
        if (step === 'date') return loadCalendarForTwoMonths(monthCursor);
        if (step === 'time' && selectedDate) return loadAvailabilityForDate(selectedDate);
        if (step === 'checkout') {
          // If we have a hold, try confirm again; otherwise try to create hold again.
          if (holdId) return confirmBooking();
          return createHold();
        }
        // Participants/others: no-op
        render();
      };

      main.append(e, retry);
    }

    if (step === 'done') {
      // Final state
      next.textContent = 'Thank you';
      next.disabled = true;

      // If we have an id but no summary (e.g., refresh), best-effort fetch.
      if (confirmedBookingId && !confirmedBookingSummary) void loadConfirmedBookingSummary();

      const t = el('div', { class: 'cardTitle' });
      t.textContent = 'Thank you!';

      const p = el('div', { class: 'muted' });
      p.textContent = confirmedBookingId ? `Confirmation: ${confirmedBookingId}` : 'Confirmed.';

      const d = el('div', { class: 'muted' });
      if (confirmedBookingSummary?.startAt) d.textContent = `Start: ${fmtTime(confirmedBookingSummary.startAt)}`;

      main.append(t, p);
      if (confirmedBookingSummary?.startAt) main.append(d);

      layout.append(main, summary);
      panel.append(head, layout);
      return;
    }

    if (step === 'game') {
      const h = el('div', { class: 'cardTitle' });
      h.textContent = 'Choose an experience';
      const p = el('div', { class: 'muted' });
      p.textContent = 'Select a game to view available dates and times.';

      const list = el('div', { class: 'games' });
      for (const g of catalog) {
        const b = el('button', { class: 'gameCard' });
        b.onclick = () => {
          selectedGameId = g.gameId;
          selectedGame = g;
          type = g.allowPrivate ? 'private' : 'public';
          players = Math.max(g.minPlayers, Math.min(players, g.maxPlayers));
          render();
        };

        // Media preview
        const media = el('div', { class: 'gameMedia' });
        // Minimal + reliable: prefer hero image. Video is optional and autoplay is OFF.
        const hero = g.heroImageThumbUrl || g.heroImageUrl;
        if (hero) {
          const img = document.createElement('img');
          img.src = hero;
          img.alt = g.name;
          img.loading = 'lazy';
          media.append(img);
        } else if (g.previewVideoUrl) {
          const v = document.createElement('video');
          v.src = g.previewVideoUrl;
          v.autoplay = false;
          v.muted = true;
          v.loop = false;
          v.controls = true;
          v.playsInline = true;
          v.preload = 'metadata';
          media.append(v);
        } else {
          const sk = el('div', { class: 'skeleton' });
          (sk as HTMLElement).style.width = '100%';
          (sk as HTMLElement).style.height = '100%';
          media.append(sk);
        }

        const name = el('div', { class: 'gameName' });
        name.textContent = g.name;
        const chips = el('div', { class: 'chips' });
        const c1 = el('div', { class: 'chip' });
        c1.textContent = `${g.durationMins}m + ${g.bufferMins}m`;
        const c2 = el('div', { class: 'chip' });
        c2.textContent = `${g.minPlayers}-${g.maxPlayers} players`;
        chips.append(c1, c2);

        if (typeof g.startingUnitAmountCents === 'number') {
          const c3 = el('div', { class: 'chip' });
          const cur = (g.pricingCurrency || 'usd').toLowerCase();
          c3.textContent = `From ${fmtMoney(g.startingUnitAmountCents, cur)}`;
          chips.append(c3);
        }

        b.append(media, name, chips);
        list.append(b);
      }

      if (loading) {
        const l = el('div', { class: 'muted' });
        l.textContent = 'Loading…';
        main.append(h, p, l);
      } else {
        main.append(h, p, list);
      }

      next.disabled = loading || !selectedGameId;
    }

    if (step === 'date') {
      const h = el('div', { class: 'cardTitle' });
      h.textContent = 'When?';
      const p = el('div', { class: 'muted' });
      p.textContent = 'Pick a date with availability.';

      const quickRow = el('div', { class: 'row' });
      const nextAvail = el('button', { class: 'btn' });
      nextAvail.textContent = 'Next available';
      nextAvail.disabled = loading || availableDates.size === 0;
      nextAvail.onclick = () => {
        const today = isoDateToday();
        const sorted = Array.from(availableDates).sort();
        const d = sorted.find((x) => x >= today) ?? sorted[0];
        if (!d) return;
        selectedDate = d;
        selectedSlot = null;
        slots = [];
        step = 'time';
        render();
        loadAvailabilityForDate(d);
      };

      const todayBtn = el('button', { class: 'btn ghost' });
      todayBtn.textContent = 'Today';
      todayBtn.disabled = loading;
      todayBtn.onclick = () => {
        const d = isoDateToday();
        if (!availableDates.has(d)) {
          error = 'No availability today. Try “Next available”.';
          return render();
        }
        selectedDate = d;
        selectedSlot = null;
        slots = [];
        step = 'time';
        render();
        loadAvailabilityForDate(d);
      };

      quickRow.append(nextAvail, todayBtn);

      // Show current month + next month stacked (design reference).
      const stack = el('div', { class: 'grid2' });
      stack.append(
        renderMonth(monthCursor, { showNav: true, loading }),
        renderMonth(addMonths(monthCursor, 1), { loading })
      );
      main.append(h, p, quickRow, stack);
      next.disabled = true;
    }

    if (step === 'time') {
      const h = el('div', { class: 'cardTitle' });
      h.textContent = selectedDate ? `Available times – ${selectedDate}` : 'Available times';
      const p = el('div', { class: 'muted' });
      p.textContent = 'Select a timeslot.';
      main.append(h, p);

      const grid = el('div', { class: 'slots' });

      if (loading) {
        for (let i = 0; i < 8; i++) {
          const sk = el('div', { class: 'slot skeleton' });
          (sk as HTMLElement).style.height = '56px';
          grid.append(sk);
        }
        main.append(grid);
      } else {
        for (const s of slots) {
          const room = s.availableRooms[0];
          if (!room) continue;
          const active = selectedSlot && selectedSlot.startAt === s.startAt && selectedSlot.roomId === room.roomId;
          const btn = el('button', { class: `slot ${active ? 'active' : ''}`.trim() });
          btn.disabled = false;
          btn.onclick = () => {
            selectedSlot = { startAt: s.startAt, endAt: s.endAt, roomId: room.roomId };
            render();
          };

          const t = el('div', { class: 'slotTitle' });
          t.textContent = `${fmtTime(s.startAt)} – ${fmtTime(s.endAt)}`;
          const sub = el('div', { class: 'slotSub' });
          const rem = typeof room.remainingPlayers === 'number' ? ` • ${room.remainingPlayers} left` : '';
          const displayRoomName = room.name && room.name !== room.roomId ? room.name : '';
          sub.textContent = displayRoomName ? `${displayRoomName}${rem}` : (rem ? rem.replace(' • ', '') : '');
          btn.append(t, sub);
          grid.append(btn);
        }
        main.append(grid);
      }

      if (!loading && slots.length === 0) {
        const n = el('div', { class: 'muted' });
        n.textContent = 'No times available for this date.';
        main.append(n);
      }

      main.append(grid);
      next.disabled = loading || !selectedSlot;
    }

    if (step === 'participants') {
      const h = el('div', { class: 'cardTitle' });
      h.textContent = 'Participants';
      const p = el('div', { class: 'muted' });
      p.textContent = 'Confirm party size and booking type.';
      main.append(h, p);

      const row = el('div', { class: 'stepper' });
      const minus = el('button', { class: 'btn' });
      minus.textContent = '−';
      minus.onclick = () => {
        const min = selectedGame?.minPlayers ?? 1;
        players = Math.max(min, players - 1);
        // changing players invalidates existing holds
        holdId = null;
        holdExpiresAt = null;
        render();
      };
      const box = el('div', { class: 'btn count' });
      box.textContent = `${players} players`;
      const plus = el('button', { class: 'btn' });
      plus.textContent = '+';
      plus.onclick = () => {
        const max = selectedGame?.maxPlayers ?? 20;
        players = Math.min(max, players + 1);
        holdId = null;
        holdExpiresAt = null;
        render();
      };
      row.append(minus, box, plus);

      const typeRow = el('div', { class: 'segmented' });
      const bPriv = el('button', { class: `btn ${type === 'private' ? 'primary' : ''}`.trim() });
      bPriv.textContent = 'Private';
      bPriv.disabled = selectedGame ? !selectedGame.allowPrivate : false;
      bPriv.onclick = async () => {
        type = 'private';
        holdId = null;
        holdExpiresAt = null;
        selectedDate = null;
        selectedSlot = null;
        slots = [];
        await loadCalendarForTwoMonths(monthCursor);
      };
      const bPub = el('button', { class: `btn ${type === 'public' ? 'primary' : ''}`.trim() });
      bPub.textContent = 'Public';
      bPub.disabled = selectedGame ? !selectedGame.allowPublic : false;
      bPub.onclick = async () => {
        type = 'public';
        holdId = null;
        holdExpiresAt = null;
        selectedDate = null;
        selectedSlot = null;
        slots = [];
        await loadCalendarForTwoMonths(monthCursor);
      };
      typeRow.append(bPriv, bPub);

      main.append(row, el('div', { class: 'sub' }), typeRow);
      next.disabled = loading;
    }

    if (step === 'checkout') {
      const h = el('div', { class: 'cardTitle' });
      h.textContent = 'Checkout';
      const p = el('div', { class: 'muted' });
      p.textContent = 'Enter details and confirm booking.';
      main.append(h, p);

      const countdown = getCountdown();
      if (holdId && countdown) {
        const c = el('div', { class: isHoldExpired() ? 'err' : 'ok' });
        c.textContent = isHoldExpired() ? 'Hold expired. Go back and pick a new time.' : `Hold active: ${countdown}`;
        main.append(c);
      }

      // Pricing breakdown (server-calculated)
      if (
        holdPricing &&
        typeof holdPricing.subtotalCents === 'number' &&
        typeof holdPricing.processingFeeCents === 'number' &&
        typeof holdPricing.totalCents === 'number'
      ) {
        const currency = holdPricing.currency ?? 'usd';
        const box = el('div', { class: 'sub' });

        const line = (label: string, value: string, strong = false) => {
          const r = el('div');
          (r as HTMLElement).style.display = 'flex';
          (r as HTMLElement).style.justifyContent = 'space-between';
          (r as HTMLElement).style.gap = '12px';
          const l = el('div', { class: 'muted' });
          l.textContent = label;
          const v = el('div');
          v.textContent = value;
          if (strong) (v as HTMLElement).style.fontWeight = '600';
          r.append(l, v);
          return r;
        };

        box.append(
          line('Subtotal', fmtMoney(holdPricing.subtotalCents, currency)),
          line(holdPricing.processingFeeLabel ?? 'Processing Fee', fmtMoney(holdPricing.processingFeeCents, currency)),
          line('Total', fmtMoney(holdPricing.totalCents, currency), true)
        );
        main.append(box);
      }

      const onFocusField = () => {
        // Do NOT re-render on focus (it recreates DOM and prevents iOS keyboard).
        wrap.classList.add('typing');
        setTimeout(setBottomPad, 0);
      };
      const onBlurField = () => {
        setTimeout(() => {
          const active = (document.activeElement as HTMLElement | null) ?? null;
          const isInput = active?.tagName === 'INPUT' && wrap.contains(active);
          if (!isInput) {
            wrap.classList.remove('typing');
            setTimeout(setBottomPad, 0);
          }
        }, 0);
      };

      const f1 = el('input');
      f1.placeholder = 'Name';
      f1.value = name;
      f1.autocomplete = 'name';
      f1.oninput = () => (name = f1.value);
      f1.onfocus = () => {
        onFocusField();
        log('focus:Name');
      };
      f1.onblur = onBlurField;

      const f2 = el('input');
      f2.placeholder = 'Phone';
      f2.value = phone;
      f2.autocomplete = 'tel';
      f2.inputMode = 'tel';
      f2.oninput = () => (phone = f2.value);
      f2.onfocus = () => {
        onFocusField();
        log('focus:Phone');
      };
      f2.onblur = onBlurField;

      const f3 = el('input');
      f3.placeholder = 'Email';
      f3.value = email;
      f3.autocomplete = 'email';
      f3.inputMode = 'email';
      f3.oninput = () => (email = f3.value);
      f3.onfocus = () => {
        onFocusField();
        log('focus:Email');
      };
      f3.onblur = onBlurField;

      // Inline validation hints
      if (email && !isValidEmailOrEmpty(email)) {
        const e = el('div', { class: 'err' });
        e.textContent = 'Please enter a valid email.';
        main.append(e);
      }

      main.append(f1, el('div', { class: 'sub' }), f2, el('div', { class: 'sub' }), f3);

      next.textContent = loading ? 'Working…' : 'Confirm booking';
      next.disabled = loading || isHoldExpired();
    }

    // Disable summary next if game not chosen.
    if (step === 'date' && !selectedGameId) next.disabled = true;

    // Put together.
    layout.append(main, summary);
    panel.append(head, layout);

    // After the DOM is painted, compute the bottom padding needed for the fixed bar.
    // (Timeout ensures layout is ready.)
    setTimeout(setBottomPad, 0);
  }

  // bootstrap load
  render();
  wrap.append(bg, panel);
  // Mount
  if (useShadow) {
    (root as ShadowRoot).append(style, wrap);
  } else {
    const host = root as HTMLElement;
    host.innerHTML = '';
    host.append(style, wrap);
  }

  // Restore persisted state (best effort)
  restoreState();

  // Stripe redirect return handling (for embed widget).
  // If payment succeeded, we poll until webhook confirms the booking.
  try {
    const sp = new URLSearchParams(window.location.search);
    const stripe = sp.get('stripe');
    const spHoldId = sp.get('holdId');

    if (stripe && spHoldId) {
      if (stripe === 'cancel') {
        error = 'Payment canceled. Please try again.';
      }

      if (stripe === 'success') {
        step = 'checkout';
        loading = true;
        error = null;
        render();

        const bookingId = `booking_${spHoldId}`;

        (async () => {
          for (let i = 0; i < 40; i++) {
            try {
              const u = new URL(qs(cfg.apiBase, `/api/v1/bookings/${encodeURIComponent(bookingId)}`));
              u.searchParams.set('orgId', cfg.orgId);
              const res = await fetchWithRetry(u.toString());
              if (res.ok) {
                confirmedBookingId = bookingId;
                confirmedBookingSummary = {
                  gameId: selectedGameId ?? undefined,
                  bookingType: type,
                  players,
                };
                step = 'done';
                holdId = null;
                holdExpiresAt = null;
                loading = false;
                void loadConfirmedBookingSummary();
                render();

                // Clean URL params to avoid re-running polling on refresh.
                try {
                  sp.delete('stripe');
                  sp.delete('session_id');
                  // keep holdId in URL? remove it too (privacy).
                  sp.delete('holdId');
                  const nextUrl = `${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}${window.location.hash || ''}`;
                  window.history.replaceState({}, '', nextUrl);
                } catch {
                  // ignore
                }

                return;
              }
            } catch {
              // ignore
            }
            await new Promise((r) => setTimeout(r, 1000));
          }

          error = 'Payment received but confirmation is still processing. Please refresh.';
          loading = false;
          render();
        })();
      }
    }
  } catch {
    // ignore
  }

  // Start data fetching.
  if (!cfg.gameId) {
    loadCatalog();
    if (selectedGameId) loadCalendarForTwoMonths(monthCursor);
    if (selectedDate) loadAvailabilityForDate(selectedDate);
  } else {
    // We still need catalog for constraints and type defaults; but we can proceed without.
    loadCatalog().finally(() => loadCalendarForTwoMonths(monthCursor));
    if (selectedDate) loadAvailabilityForDate(selectedDate);
  }

  // Hold countdown ticker.
  // IMPORTANT: do not re-render while user is typing on mobile (it kills iOS keyboard).
  setInterval(() => {
    if (!holdExpiresAt) return;

    const ae = document.activeElement as HTMLElement | null;
    const typing = wrap.classList.contains('typing');
    const isInput = ae?.tagName === 'INPUT' && wrap.contains(ae);
    if (typing || isInput) return;

    render();
  }, 1000);
}

function inferConfigFromScriptTag(script: HTMLScriptElement): Partial<Config> {
  const apiBase = script.getAttribute('data-api-base') ?? '';
  const orgId = script.getAttribute('data-org-id') ?? '';
  const gameId = script.getAttribute('data-game-id') ?? undefined;
  const accent = script.getAttribute('data-accent') ?? undefined;
  return {
    apiBase,
    orgId,
    gameId,
    theme: { accent },
  };
}

function findOrCreateContainer(id = 'bookingflow-widget') {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement('div');
    node.id = id;
    document.body.appendChild(node);
  }
  return node;
}

(function bootstrap() {
  const script = (document.currentScript as HTMLScriptElement | null) ?? null;
  if (!script) return;
  const cfg = inferConfigFromScriptTag(script);
  if (!cfg.apiBase || !cfg.orgId) return;

  const containerId = script.getAttribute('data-container-id') ?? 'bookingflow-widget';
  const container = findOrCreateContainer(containerId);
  mountBookingFlowWidget(container, cfg as Config);

  // Initialize lightweight behavior tracker for nudge system
  try {
    initEmbedTracker(cfg.apiBase, cfg.orgId);
  } catch {
    // silently ignore — nudge system is non-critical
  }
})();

/** Minimal vanilla JS tracker for the CDN embed widget */
function initEmbedTracker(apiBase: string, orgId: string) {
  const buf: Array<{ type: string; target?: string; value?: string; duration?: number; timestamp: number }> = [];
  let lastSent = 0;
  let lastMouse = Date.now();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const MIN_INTERVAL = 10000;
  const MAX_BUF = 20;

  function push(evt: { type: string; target?: string; value?: string; duration?: number }) {
    buf.push({ ...evt, timestamp: Date.now() });
    if (buf.length > MAX_BUF) buf.splice(0, buf.length - MAX_BUF);
  }

  async function send() {
    if (timer) { clearTimeout(timer); timer = null; }
    const now = Date.now();
    if (now - lastSent < MIN_INTERVAL) {
      timer = setTimeout(send, MIN_INTERVAL - (now - lastSent));
      return;
    }
    if (buf.length === 0) return;
    lastSent = now;
    try {
      const res = await fetch(`${apiBase}/api/v1/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, events: buf.slice() }),
      });
      if (res.ok) {
        const nudge = await res.json();
        if (nudge.show && nudge.message) {
          showEmbedNudge(nudge.message, nudge.type ?? 'toast');
        }
      }
    } catch { /* ignore */ }
  }

  function scheduleSend() {
    if (!timer) timer = setTimeout(send, MIN_INTERVAL);
  }

  // Track page view
  push({ type: 'page_view' });

  // Mouse move for hesitation detection
  window.addEventListener('mousemove', () => { lastMouse = Date.now(); }, { passive: true });

  // Hesitation check every 5s
  setInterval(() => {
    const elapsed = Date.now() - lastMouse;
    if (elapsed >= 15000) {
      push({ type: 'hesitation', target: 'page', duration: elapsed });
      scheduleSend();
    }
  }, 5000);

  // Send periodically
  setInterval(scheduleSend, MIN_INTERVAL);
}

/** Show a simple nudge toast in the embed context */
function showEmbedNudge(message: string, type: string) {
  try {
    // Check session limits
    const countKey = 'bf_nudge_count';
    const count = parseInt(sessionStorage.getItem(countKey) || '0', 10);
    if (count >= 5) return;
    sessionStorage.setItem(countKey, String(count + 1));

    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;${type === 'banner' ? 'top:8px;left:50%;transform:translateX(-50%)' : 'bottom:16px;right:16px'};
      max-width:320px;background:#fff;border:1px solid #eee;border-left:3px solid #FF4F00;
      border-radius:8px;padding:12px 16px;font-size:14px;color:#333;
      box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:99999;
      animation:bfNudgeIn 0.3s ease-out;font-family:Inter,system-ui,sans-serif;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `@keyframes bfNudgeIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => { toast.remove(); style.remove(); }, 300);
    }, 8000);
  } catch { /* ignore */ }
}

declare global {
  interface Window {
    BookingFlowWidget?: {
      mount: (container: HTMLElement, cfg: Config) => void;
    };
  }
}

window.BookingFlowWidget = {
  mount: (container: HTMLElement, cfg: Config) => mountBookingFlowWidget(container, cfg),
};

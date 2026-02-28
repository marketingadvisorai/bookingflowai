import type { Slot } from './widget-utils';

export const SMART_DEFAULT_PLAYERS = 4;

export type NudgeVariant = 'neutral' | 'warm' | 'alert';

export type Nudge = {
  id: string;
  message: string;
  variant: NudgeVariant;
  autoDismissMs?: number;
};

/* ── Smart default date: today if before 2PM, else tomorrow ── */
export function getSmartDefaultDate(): string {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 14) return yyyyMmDdLocal(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return yyyyMmDdLocal(tomorrow);
}

function yyyyMmDdLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ── Slot nudges ── */
export function getSlotNudges(slots: Slot[]): Nudge[] {
  const nudges: Nudge[] = [];

  const withCapacity = slots.filter(s => s.available && s.remainingPlayers != null);
  if (withCapacity.length > 0) {
    const lowestCapacity = Math.min(...withCapacity.map(s => s.remainingPlayers!));
    if (lowestCapacity < 4 && lowestCapacity > 0) {
      nudges.push({
        id: 'slot-low-capacity',
        message: `⚡ Only ${lowestCapacity} spot${lowestCapacity !== 1 ? 's' : ''} left!`,
        variant: 'alert',
        autoDismissMs: 7000,
      });
    }
  }

  for (const slot of slots) {
    if (!slot.available) continue;
    try {
      const d = new Date(slot.startAt);
      const day = d.getDay();
      const hour = d.getHours();
      if ((day === 5 || day === 6) && hour >= 18) {
        nudges.push({
          id: 'slot-weekend-evening',
          message: '✨ Most popular: Saturday evenings!',
          variant: 'warm',
          autoDismissMs: 6000,
        });
        break;
      }
    } catch { /* skip */ }
  }

  return nudges;
}

/* ── Date nudges ── */
export function getDateNudge(date: string): Nudge | null {
  try {
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    if (day === 5 || day === 6 || day === 0) {
      return {
        id: 'date-weekend',
        message: 'High demand day. Earlier slots tend to open up.',
        variant: 'neutral',
        autoDismissMs: 5000,
      };
    }
  } catch { /* skip */ }
  return null;
}

/* ── Player count nudges ── */
export function getPlayerNudge(players: number): Nudge | null {
  if (players >= 7) {
    return {
      id: 'players-large',
      message: 'Large group. Some time slots may have limited availability.',
      variant: 'neutral',
      autoDismissMs: 4000,
    };
  }
  return null;
}

/* ── Progress encouragement ── */
export function getProgressNudge(stage: 'game_selected' | 'slot_selected' | 'customer'): Nudge | null {
  switch (stage) {
    case 'slot_selected':
      return {
        id: 'progress-slot',
        message: '🎯 Great choice! Fill in your details to lock it in.',
        variant: 'warm',
        autoDismissMs: 3000,
      };
    case 'customer':
      return {
        id: 'progress-customer',
        message: '💡 Almost there! Complete payment to secure your spot.',
        variant: 'warm',
        autoDismissMs: 6000,
      };
    default:
      return null;
  }
}

/* ── Welcome nudge ── */
export function getWelcomeNudge(): Nudge {
  return {
    id: 'welcome',
    message: '👋 Pick a time slot to get started!',
    variant: 'neutral',
    autoDismissMs: 5000,
  };
}

/* ── Idle recovery nudges ── */
export function getIdleNudge(idleSeconds: number, hasHold: boolean, countdown: string | null): Nudge | null {
  if (hasHold && idleSeconds >= 60 && idleSeconds < 180) {
    return {
      id: 'idle-60s',
      message: countdown
        ? `Your reservation expires in ${countdown}.`
        : 'Your reservation is still active.',
      variant: 'alert',
    };
  }
  if (idleSeconds >= 180 && idleSeconds < 190) {
    return {
      id: 'idle-180s',
      message: 'You can come back anytime to finish booking.',
      variant: 'neutral',
      autoDismissMs: 5000,
    };
  }
  return null;
}

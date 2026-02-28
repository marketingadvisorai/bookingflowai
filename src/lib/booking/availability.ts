import type { BookingType, Game, Hold, Room, Schedule } from './types';
import { addMinutes, overlaps, parseHHMM, parseLocalDate, toIso } from './time';

export type SlotAvailability = {
  startAt: string;
  endAt: string;
  availableRooms: { roomId: string; name: string; remainingPlayers?: number }[];
};

/** Max slots returned per request to keep response sizes reasonable */
const MAX_SLOTS = 20;

/**
 * Compute available time slots for a game on a specific date.
 *
 * Performance: O(slots × rooms × conflicts). Pre-indexes conflicts by roomId
 * to avoid repeated filtering. Typically <1ms for 10 slots × 5 rooms.
 */
export function computeSlots(params: {
  game: Game;
  rooms: Room[];
  schedule: Schedule;
  date: string; // YYYY-MM-DD
  bookingType: BookingType;
  players: number;
  holds: Hold[];
  bookings: { roomId: string; startAt: string; endAt: string; bookingType: BookingType; players: number }[];
}): SlotAvailability[] {
  const { game, rooms, schedule, date, bookingType, players, holds, bookings } = params;

  if (rooms.length === 0 || players < 1 || !schedule.openingHours?.length) return [];

  const base = parseLocalDate(date);
  const dow = base.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const hours = schedule.openingHours.find((x) => x.dayOfWeek === dow);
  if (!hours) return [];

  const { hh: sh, mm: sm } = parseHHMM(hours.start);
  const { hh: eh, mm: em } = parseHHMM(hours.end);
  const startWindow = new Date(base.getFullYear(), base.getMonth(), base.getDate(), sh, sm, 0, 0);
  const endWindow = new Date(base.getFullYear(), base.getMonth(), base.getDate(), eh, em, 0, 0);

  const slotMins = game.slotIntervalMins;
  const durationWindowMins = game.durationMins + game.bufferMins;

  const enabledRooms = rooms.filter((r) => r.enabled);
  if (enabledRooms.length === 0) return [];

  // Filter expired holds once (holds past expiresAt are treated as inactive)
  const now = Date.now();
  const activeHolds = holds.filter(
    (h) => h.status === 'active' && new Date(h.expiresAt).getTime() > now
  );

  // Pre-index conflicts by roomId to avoid O(n) filter per slot×room
  type Conflict = { start: Date; end: Date; bookingType: BookingType; players: number };
  const conflictsByRoom = new Map<string, Conflict[]>();
  for (const r of enabledRooms) {
    const roomConflicts: Conflict[] = [];
    for (const b of bookings) {
      if (b.roomId === r.roomId) {
        roomConflicts.push({ start: new Date(b.startAt), end: new Date(b.endAt), bookingType: b.bookingType, players: b.players });
      }
    }
    for (const h of activeHolds) {
      if (h.roomId === r.roomId) {
        roomConflicts.push({ start: new Date(h.startAt), end: new Date(h.endAt), bookingType: h.bookingType, players: h.players });
      }
    }
    conflictsByRoom.set(r.roomId, roomConflicts);
  }

  const slots: SlotAvailability[] = [];
  for (let t = new Date(startWindow); addMinutes(t, durationWindowMins) <= endWindow; t = addMinutes(t, slotMins)) {
    const end = addMinutes(t, durationWindowMins);

    const availableRooms: SlotAvailability['availableRooms'] = [];

    for (const r of enabledRooms) {
      const roomConflicts = conflictsByRoom.get(r.roomId) ?? [];
      const overlapping = roomConflicts.filter((x) => overlaps(t, end, x.start, x.end));

      if (bookingType === 'private') {
        if (overlapping.length === 0 && players <= r.maxPlayers) {
          availableRooms.push({ roomId: r.roomId, name: r.name });
        }
      } else {
        // Public: blocked if any private conflict
        if (overlapping.some((c) => c.bookingType === 'private')) continue;
        const usedPlayers = overlapping
          .filter((c) => c.bookingType === 'public')
          .reduce((acc, c) => acc + c.players, 0);
        const remaining = r.maxPlayers - usedPlayers;
        if (players <= remaining) {
          availableRooms.push({ roomId: r.roomId, name: r.name, remainingPlayers: remaining });
        }
      }
    }

    if (availableRooms.length > 0) {
      slots.push({ startAt: toIso(t), endAt: toIso(end), availableRooms });
    }

    if (slots.length >= MAX_SLOTS) break;
  }

  return slots;
}

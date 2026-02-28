import type { Booking, Game, Hold, Org, Room, Schedule } from './types';

// NOTE: Step-2 MVP uses an in-memory store. In AWS-only deployment,
// these map to database tables + TTL for holds.

import type { Session, User } from '@/lib/auth/types';

export type Store = {
  orgs: Org[];
  users: User[];
  sessions: Session[];
  games: Game[];
  rooms: Room[];
  schedules: Schedule[];
  holds: Hold[];
  bookings: Booking[];
};

let STORE: Store | null = null;

export function getStore(): Store {
  if (STORE) return STORE;

  // Seed data so the API can be exercised immediately.
  STORE = {
    orgs: [{ orgId: 'org_demo', name: 'Demo Escape', timezone: 'Asia/Dhaka' }],
    users: [],
    sessions: [],
    games: [
      {
        orgId: 'org_demo',
        gameId: 'game_prison',
        name: 'Prison Break',
        durationMins: 60,
        bufferMins: 15,
        slotIntervalMins: 30,
        minPlayers: 2,
        maxPlayers: 10,
        allowPrivate: true,
        allowPublic: true,
        heroImageUrl:
          'https://images.unsplash.com/photo-1520975682031-ae983b35bb22?auto=format&fit=crop&w=1200&q=60',
        previewVideoUrl: undefined,
        galleryImageUrls: [
          'https://images.unsplash.com/photo-1520975682031-ae983b35bb22?auto=format&fit=crop&w=1200&q=60',
          'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=60',
        ],
      },
    ],
    rooms: [
      { orgId: 'org_demo', roomId: 'room_a', gameId: 'game_prison', name: 'Room A', maxPlayers: 10, enabled: true },
      { orgId: 'org_demo', roomId: 'room_b', gameId: 'game_prison', name: 'Room B', maxPlayers: 10, enabled: true },
    ],
    schedules: [
      {
        orgId: 'org_demo',
        scheduleId: 'sched_prison',
        gameId: 'game_prison',
        openingHours: [
          { dayOfWeek: 0, start: '10:00', end: '22:00' },
          { dayOfWeek: 1, start: '10:00', end: '22:00' },
          { dayOfWeek: 2, start: '10:00', end: '22:00' },
          { dayOfWeek: 3, start: '10:00', end: '22:00' },
          { dayOfWeek: 4, start: '10:00', end: '22:00' },
          { dayOfWeek: 5, start: '10:00', end: '23:00' },
          { dayOfWeek: 6, start: '10:00', end: '23:00' },
        ],
      },
    ],
    holds: [],
    bookings: [],
  };

  return STORE;
}

export function resetStore() {
  STORE = null;
}

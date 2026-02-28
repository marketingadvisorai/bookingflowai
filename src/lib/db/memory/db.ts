import type { Db } from '@/lib/db/types';
import { getStore } from '@/lib/booking/store';
import type { Room } from '@/lib/booking/types';
import type { Session, User } from '@/lib/auth/types';

export function createMemoryDb(): Db {
  return {
    async listOrgs(orgId) {
      const s = getStore();
      return orgId ? s.orgs.filter((o) => o.orgId === orgId) : s.orgs;
    },
    async getOrg(orgId) {
      const s = getStore();
      return s.orgs.find((o) => o.orgId === orgId) ?? null;
    },
    async putOrg(org) {
      const s = getStore();
      const idx = s.orgs.findIndex((o) => o.orgId === org.orgId);
      if (idx >= 0) s.orgs[idx] = org;
      else s.orgs.push(org);
    },

    async listGames(orgId) {
      return getStore().games.filter((g) => g.orgId === orgId);
    },
    async getGame(orgId, gameId) {
      return getStore().games.find((g) => g.orgId === orgId && g.gameId === gameId) ?? null;
    },
    async putGame(orgId, game) {
      const s = getStore();
      const idx = s.games.findIndex((g) => g.orgId === orgId && g.gameId === game.gameId);
      if (idx >= 0) s.games[idx] = game;
      else s.games.push(game);
    },
    async deleteGame(orgId, gameId) {
      const s = getStore();
      s.games = s.games.filter((g) => !(g.orgId === orgId && g.gameId === gameId));
      // Demo behavior: disable rooms for deleted game.
      s.rooms = s.rooms.map((r) => (r.orgId === orgId && r.gameId === gameId ? ({ ...r, enabled: false } as Room) : r));
    },

    async listRooms(orgId) {
      return getStore().rooms.filter((r) => r.orgId === orgId);
    },
    async getRoom(orgId, roomId) {
      return getStore().rooms.find((r) => r.orgId === orgId && r.roomId === roomId) ?? null;
    },
    async putRoom(orgId, room) {
      const s = getStore();
      const idx = s.rooms.findIndex((r) => r.orgId === orgId && r.roomId === room.roomId);
      if (idx >= 0) s.rooms[idx] = room;
      else s.rooms.push(room);
    },
    async deleteRoom(orgId, roomId) {
      const s = getStore();
      s.rooms = s.rooms.filter((r) => !(r.orgId === orgId && r.roomId === roomId));
    },

    async listSchedules(orgId) {
      return getStore().schedules.filter((sc) => sc.orgId === orgId);
    },
    async getSchedule(orgId, scheduleId) {
      return getStore().schedules.find((sc) => sc.orgId === orgId && sc.scheduleId === scheduleId) ?? null;
    },
    async putSchedule(orgId, schedule) {
      const s = getStore();
      const idx = s.schedules.findIndex((sc) => sc.orgId === orgId && sc.scheduleId === schedule.scheduleId);
      if (idx >= 0) s.schedules[idx] = schedule;
      else s.schedules.push(schedule);
    },
    async deleteSchedule(orgId, scheduleId) {
      const s = getStore();
      s.schedules = s.schedules.filter((sc) => !(sc.orgId === orgId && sc.scheduleId === scheduleId));
    },

    async listHoldsForGame(orgId, gameId) {
      return getStore().holds.filter((h) => h.orgId === orgId && h.gameId === gameId);
    },
    async getHold(orgId, holdId) {
      return getStore().holds.find((h) => h.orgId === orgId && h.holdId === holdId) ?? null;
    },
    async putHold(_orgId, hold) {
      const s = getStore();
      const idx = s.holds.findIndex((h) => h.holdId === hold.holdId);
      if (idx >= 0) s.holds[idx] = hold;
      else s.holds.push(hold);
    },

    async extendHoldTTL(_orgId, holdId, newExpiresAt) {
      const s = getStore();
      const hold = s.holds.find((h) => h.holdId === holdId);
      if (hold) hold.expiresAt = newExpiresAt;
    },

    async listBookingsForGame(orgId, gameId) {
      return getStore().bookings.filter((b) => b.orgId === orgId && b.gameId === gameId);
    },
    async getBooking(orgId, bookingId) {
      return getStore().bookings.find((b) => b.orgId === orgId && b.bookingId === bookingId) ?? null;
    },
    async putBooking(_orgId, booking) {
      const s = getStore();
      const idx = s.bookings.findIndex((b) => b.bookingId === booking.bookingId);
      if (idx >= 0) s.bookings[idx] = booking;
      else s.bookings.push(booking);
    },

    async getRecentBookings(orgId, limit) {
      const s = getStore();
      return s.bookings
        .filter((b) => b.orgId === orgId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },

    async countBookingsForOrg(orgId) {
      return getStore().bookings.filter((b) => b.orgId === orgId).length;
    },

    async getTotalRevenue(orgId) {
      const s = getStore();
      return s.bookings
        .filter((b) => b.orgId === orgId && b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalCents ?? 0), 0);
    },

    // users
    async getUserByEmail(email: string) {
      const s = getStore();
      return s.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async getUserById(userId: string) {
      const s = getStore();
      return s.users.find((u) => u.userId === userId) ?? null;
    },
    async putUser(user: User) {
      const s = getStore();
      const idx = s.users.findIndex((u) => u.userId === user.userId);
      if (idx >= 0) s.users[idx] = user;
      else s.users.push(user);
    },

    // sessions
    async getSession(sessionToken: string) {
      const s = getStore();
      const ses = s.sessions.find((x) => x.sessionToken === sessionToken) ?? null;
      if (!ses) return null;
      if (new Date(ses.expiresAt).getTime() <= Date.now()) return null;
      return ses;
    },
    async putSession(session: Session) {
      const s = getStore();
      const idx = s.sessions.findIndex((x) => x.sessionToken === session.sessionToken);
      if (idx >= 0) s.sessions[idx] = session;
      else s.sessions.push(session);
    },
    async deleteSession(sessionToken: string) {
      const s = getStore();
      s.sessions = s.sessions.filter((x) => x.sessionToken !== sessionToken);
    },
    async deleteSessionsForUser(userId: string) {
      const s = getStore();
      s.sessions = s.sessions.filter((x) => x.userId !== userId);
    },

    // admin
    async scanAllUsers() {
      return [...getStore().users];
    },
    async scanAllOrgs() {
      return [...getStore().orgs];
    },
    async countAllBookings() {
      return getStore().bookings.length;
    },

    // Gift cards (not implemented in memory mode - PostgreSQL only)
    async createGiftCard() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async getGiftCardByCode() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async getGiftCardById() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async listGiftCardsByOrg() {
      return [];
    },
    async updateGiftCardBalance() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async updateGiftCardStatus() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async redeemGiftCard() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    async listGiftCardTransactions() {
      return [];
    },
    async createGiftCardTransaction() {
      throw new Error('Gift cards not implemented in memory mode');
    },
    
    // Hold cleanup
    async expireStaleHolds() {
      const s = getStore();
      const nowIso = new Date().toISOString();
      let count = 0;
      for (const h of s.holds) {
        if (h.status === 'active' && h.expiresAt < nowIso) {
          h.status = 'expired';
          count++;
        }
      }
      return count;
    },
    async countActiveHolds() {
      const s = getStore();
      const nowIso = new Date().toISOString();
      return s.holds.filter((h) => h.status === 'active' && h.expiresAt >= nowIso).length;
    },
  } satisfies Db;
}

export const memoryDbSingleton = createMemoryDb();

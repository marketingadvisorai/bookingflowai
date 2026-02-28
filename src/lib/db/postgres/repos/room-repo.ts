import { eq, and } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { rooms } from '../schema';
import type { Room } from '@/lib/booking/types';

function toRoom(row: typeof rooms.$inferSelect): Room {
  return {
    orgId: row.orgId, roomId: row.roomId, gameId: row.gameId,
    name: row.name, maxPlayers: row.maxPlayers, enabled: row.enabled,
  };
}

export function createRoomRepo(db: DrizzleDb) {
  return {
    async listRooms(orgId: string): Promise<Room[]> {
      const rows = await db.select().from(rooms).where(eq(rooms.orgId, orgId));
      return rows.map(toRoom);
    },
    async getRoom(orgId: string, roomId: string): Promise<Room | null> {
      const rows = await db.select().from(rooms)
        .where(and(eq(rooms.orgId, orgId), eq(rooms.roomId, roomId)));
      return rows[0] ? toRoom(rows[0]) : null;
    },
    async putRoom(orgId: string, room: Room): Promise<void> {
      const values = { orgId, roomId: room.roomId, gameId: room.gameId, name: room.name, maxPlayers: room.maxPlayers, enabled: room.enabled };
      await db.insert(rooms).values(values)
        .onConflictDoUpdate({ target: [rooms.orgId, rooms.roomId], set: values });
    },
    async deleteRoom(orgId: string, roomId: string): Promise<void> {
      await db.delete(rooms).where(and(eq(rooms.orgId, orgId), eq(rooms.roomId, roomId)));
    },
  };
}

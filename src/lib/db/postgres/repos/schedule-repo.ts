import { eq, and } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { schedules } from '../schema';
import type { Schedule } from '@/lib/booking/types';

function toSchedule(row: typeof schedules.$inferSelect): Schedule {
  return {
    orgId: row.orgId, scheduleId: row.scheduleId, gameId: row.gameId,
    openingHours: row.openingHours as Schedule['openingHours'],
  };
}

export function createScheduleRepo(db: DrizzleDb) {
  return {
    async listSchedules(orgId: string): Promise<Schedule[]> {
      const rows = await db.select().from(schedules).where(eq(schedules.orgId, orgId));
      return rows.map(toSchedule);
    },
    async getSchedule(orgId: string, scheduleId: string): Promise<Schedule | null> {
      const rows = await db.select().from(schedules)
        .where(and(eq(schedules.orgId, orgId), eq(schedules.scheduleId, scheduleId)));
      return rows[0] ? toSchedule(rows[0]) : null;
    },
    async putSchedule(orgId: string, schedule: Schedule): Promise<void> {
      const values = { orgId, scheduleId: schedule.scheduleId, gameId: schedule.gameId, openingHours: schedule.openingHours };
      await db.insert(schedules).values(values)
        .onConflictDoUpdate({ target: [schedules.orgId, schedules.scheduleId], set: values });
    },
    async deleteSchedule(orgId: string, scheduleId: string): Promise<void> {
      await db.delete(schedules)
        .where(and(eq(schedules.orgId, orgId), eq(schedules.scheduleId, scheduleId)));
    },
  };
}

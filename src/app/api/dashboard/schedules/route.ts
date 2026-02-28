import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

const openingHoursSchema = z.object({
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const createSchema = z.object({
  gameId: z.string().min(1),
  openingHours: z.array(openingHoursSchema).min(1),
});

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const schedules = await db.listSchedules(sess.orgId);
  return NextResponse.json({ ok: true, schedules });
}

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const scheduleId = `sched_${createId()}`;
  const db = getDb();
  await db.putSchedule(sess.orgId, { orgId: sess.orgId, scheduleId, ...parsed.data });
  return NextResponse.json({ ok: true, scheduleId });
}

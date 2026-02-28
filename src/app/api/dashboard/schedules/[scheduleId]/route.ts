import { NextResponse } from 'next/server';
import { z } from 'zod';
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

const updateSchema = z.object({
  gameId: z.string().min(1),
  openingHours: z.array(openingHoursSchema).min(1),
});

export async function PUT(req: Request, ctx: { params: Promise<{ scheduleId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { scheduleId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const existing = await db.getSchedule(sess.orgId, scheduleId);
  if (!existing) return NextResponse.json({ ok: false, error: 'schedule_not_found' }, { status: 404 });

  await db.putSchedule(sess.orgId, { ...existing, ...parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ scheduleId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { scheduleId } = await ctx.params;
  const db = getDb();
  await db.deleteSchedule(sess.orgId, scheduleId);
  return NextResponse.json({ ok: true });
}

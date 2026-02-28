import { NextResponse } from 'next/server';
import { createScheduleSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function GET(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });
  const db = getDb();
  const schedules = await db.listSchedules(orgId);
  return NextResponse.json({ ok: true, schedules });
}

export async function POST(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => null);
  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const gameExists = await db.getGame(parsed.data.orgId, parsed.data.gameId);
  if (!gameExists) return NextResponse.json({ ok: false, error: 'game_not_found' }, { status: 404 });

  const exists = await db.getSchedule(parsed.data.orgId, parsed.data.scheduleId);
  if (exists) return NextResponse.json({ ok: false, error: 'schedule_exists' }, { status: 409 });

  await db.putSchedule(parsed.data.orgId, {
    orgId: parsed.data.orgId,
    scheduleId: parsed.data.scheduleId,
    gameId: parsed.data.gameId,
    openingHours: parsed.data.openingHours.map((o) => ({
      dayOfWeek: o.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      start: o.start,
      end: o.end,
    })),
  });

  return NextResponse.json({ ok: true });
}


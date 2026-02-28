import { NextResponse } from 'next/server';
import { updateScheduleSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function PUT(req: Request, ctx: { params: Promise<{ scheduleId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { scheduleId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const current = await db.getSchedule(parsed.data.orgId, scheduleId);
  if (!current) return NextResponse.json({ ok: false, error: 'schedule_not_found' }, { status: 404 });
  const next = {
    ...current,
    ...parsed.data,
    scheduleId: current.scheduleId,
    openingHours:
      parsed.data.openingHours?.map((o) => ({
        dayOfWeek: o.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        start: o.start,
        end: o.end,
      })) ?? current.openingHours,
  };

  await db.putSchedule(parsed.data.orgId, next);
  return NextResponse.json({ ok: true, schedule: next });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ scheduleId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { scheduleId } = await ctx.params;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });

  const db = getDb();
  const existing = await db.getSchedule(orgId, scheduleId);
  if (!existing) return NextResponse.json({ ok: false, error: 'schedule_not_found' }, { status: 404 });

  await db.deleteSchedule(orgId, scheduleId);

  return NextResponse.json({ ok: true });
}

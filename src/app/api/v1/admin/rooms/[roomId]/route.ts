import { NextResponse } from 'next/server';
import { updateRoomSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function PUT(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { roomId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const current = await db.getRoom(parsed.data.orgId, roomId);
  if (!current) return NextResponse.json({ ok: false, error: 'room_not_found' }, { status: 404 });

  const next = { ...current, ...parsed.data, roomId: current.roomId };
  await db.putRoom(parsed.data.orgId, next);

  return NextResponse.json({ ok: true, room: next });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { roomId } = await ctx.params;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });

  const db = getDb();
  const existing = await db.getRoom(orgId, roomId);
  if (!existing) return NextResponse.json({ ok: false, error: 'room_not_found' }, { status: 404 });

  await db.deleteRoom(orgId, roomId);

  return NextResponse.json({ ok: true });
}

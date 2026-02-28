import { NextResponse } from 'next/server';
import { createRoomSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function GET(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });
  const db = getDb();
  const rooms = await db.listRooms(orgId);
  return NextResponse.json({ ok: true, rooms });
}

export async function POST(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => null);
  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const gameExists = await db.getGame(parsed.data.orgId, parsed.data.gameId);
  if (!gameExists) return NextResponse.json({ ok: false, error: 'game_not_found' }, { status: 404 });

  const exists = await db.getRoom(parsed.data.orgId, parsed.data.roomId);
  if (exists) return NextResponse.json({ ok: false, error: 'room_exists' }, { status: 409 });

  await db.putRoom(parsed.data.orgId, { ...parsed.data });
  return NextResponse.json({ ok: true });
}

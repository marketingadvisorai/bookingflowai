import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

const createSchema = z.object({
  name: z.string().min(1),
  gameId: z.string().min(1),
  maxPlayers: z.number().int().min(1).max(100),
  enabled: z.boolean(),
});

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const rooms = await db.listRooms(sess.orgId);
  return NextResponse.json({ ok: true, rooms });
}

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const roomId = `room_${createId()}`;
  await db.putRoom(sess.orgId, { orgId: sess.orgId, roomId, ...parsed.data });
  return NextResponse.json({ ok: true, roomId });
}

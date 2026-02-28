import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

const updateSchema = z.object({
  name: z.string().min(1),
  gameId: z.string().min(1),
  maxPlayers: z.number().int().min(1).max(100),
  enabled: z.boolean(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { roomId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const existing = await db.getRoom(sess.orgId, roomId);
  if (!existing) return NextResponse.json({ ok: false, error: 'room_not_found' }, { status: 404 });

  await db.putRoom(sess.orgId, { ...existing, ...parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ roomId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { roomId } = await ctx.params;
  const db = getDb();
  await db.deleteRoom(sess.orgId, roomId);
  return NextResponse.json({ ok: true });
}

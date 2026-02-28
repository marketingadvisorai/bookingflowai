import { NextResponse } from 'next/server';
import { updateGameSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function PUT(req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { gameId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = updateGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const current = await db.getGame(parsed.data.orgId, gameId);
  if (!current) return NextResponse.json({ ok: false, error: 'game_not_found' }, { status: 404 });

  const next = { ...current, ...parsed.data, gameId: current.gameId };
  if (next.minPlayers > next.maxPlayers) {
    return NextResponse.json({ ok: false, error: 'invalid_min_max_players' }, { status: 400 });
  }
  await db.putGame(parsed.data.orgId, next);

  return NextResponse.json({ ok: true, game: next });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;

  const { gameId } = await ctx.params;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });

  const db = getDb();
  const existing = await db.getGame(orgId, gameId);
  if (!existing) return NextResponse.json({ ok: false, error: 'game_not_found' }, { status: 404 });

  await db.deleteGame(orgId, gameId);

  return NextResponse.json({ ok: true });
}

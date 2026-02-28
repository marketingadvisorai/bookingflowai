import { NextResponse } from 'next/server';
import { createGameSchema } from '@/lib/booking/admin/validators';
import { getDb } from '@/lib/db';
import { requireAdminKey } from '@/lib/auth/admin';

export async function GET(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });
  const db = getDb();
  const games = await db.listGames(orgId);
  return NextResponse.json({ ok: true, games });
}

export async function POST(req: Request) {
  const unauthorized = requireAdminKey(req);
  if (unauthorized) return unauthorized;
  const body = await req.json().catch(() => null);
  const parsed = createGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const exists = await db.getGame(parsed.data.orgId, parsed.data.gameId);
  if (exists) {
    return NextResponse.json({ ok: false, error: 'game_exists' }, { status: 409 });
  }

  if (parsed.data.minPlayers > parsed.data.maxPlayers) {
    return NextResponse.json({ ok: false, error: 'invalid_min_max_players' }, { status: 400 });
  }

  await db.putGame(parsed.data.orgId, { ...parsed.data });
  return NextResponse.json({ ok: true });
}

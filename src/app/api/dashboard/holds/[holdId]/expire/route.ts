import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

export async function POST(_req: Request, ctx: { params: Promise<{ holdId: string }> }) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const { holdId } = await ctx.params;
  const db = getDb();
  const hold = await db.getHold(sess.orgId, holdId);
  if (!hold) return NextResponse.json({ ok: false, error: 'hold_not_found' }, { status: 404 });

  if (hold.status !== 'active') return NextResponse.json({ ok: true, status: hold.status });

  hold.status = 'expired';
  await db.putHold(sess.orgId, hold);
  return NextResponse.json({ ok: true, status: 'expired' });
}

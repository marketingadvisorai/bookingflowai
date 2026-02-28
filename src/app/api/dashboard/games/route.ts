import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';

const pricingTierSchema = z
  .object({
    minPlayers: z.number().int().min(1).max(100),
    maxPlayers: z.number().int().min(1).max(100).optional(),
    unitAmountCents: z.number().int().min(1).max(1_000_000),
    label: z.string().optional(),
  })
  .refine((t) => (t.maxPlayers == null ? true : t.minPlayers <= t.maxPlayers), { message: 'minPlayers must be <= maxPlayers', path: ['minPlayers'] });

const createSchema = z
  .object({
    name: z.string().min(1),
    durationMins: z.number().int().min(15).max(240),
    bufferMins: z.number().int().min(0).max(120),
    slotIntervalMins: z.number().int().min(5).max(180),
    minPlayers: z.number().int().min(1).max(100),
    maxPlayers: z.number().int().min(1).max(100),
    allowPrivate: z.boolean(),
    allowPublic: z.boolean(),
    heroImageUrl: z.string().min(1).optional(),
    heroImageThumbUrl: z.string().min(1).optional(),
    previewVideoUrl: z.string().min(1).optional(),
    galleryImageUrls: z.array(z.string().min(1)).optional(),

    pricingModel: z.literal('per_person').optional(),
    pricingCurrency: z.string().min(3).max(10).optional(),
    pricingTiers: z.array(pricingTierSchema).optional(),
  })
  .refine((v) => v.minPlayers <= v.maxPlayers, { message: 'minPlayers must be <= maxPlayers', path: ['minPlayers'] });

export async function GET() {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const games = await db.listGames(sess.orgId);
  return NextResponse.json({ ok: true, games });
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
  // Allow client to supply a pre-generated gameId (for image uploads before creation)
  const clientGameId = typeof (body as Record<string, unknown>)?.gameId === 'string' ? (body as Record<string, unknown>).gameId as string : null;
  const gameId = clientGameId && /^game_[a-z0-9]{20,30}$/.test(clientGameId) ? clientGameId : `game_${createId()}`;
  await db.putGame(sess.orgId, { orgId: sess.orgId, gameId, ...parsed.data });
  return NextResponse.json({ ok: true, gameId });
}

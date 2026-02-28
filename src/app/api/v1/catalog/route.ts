import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { computeStartingUnitAmountCents } from '@/lib/booking/pricing-starting';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;
  const headers = cors.headers;
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org_id' }, { status: 400 });

  const db = getDb();
  const [org, games] = await Promise.all([db.getOrg(orgId), db.listGames(orgId)]);

  // Public catalog response (minimal + pricing + tenant fees).
  const items = games.map((g) => ({
    gameId: g.gameId,
    name: g.name,
    durationMins: g.durationMins,
    bufferMins: g.bufferMins,
    slotIntervalMins: g.slotIntervalMins,
    minPlayers: g.minPlayers,
    maxPlayers: g.maxPlayers,
    allowPrivate: g.allowPrivate,
    allowPublic: g.allowPublic,
    heroImageUrl: g.heroImageUrl,
    heroImageThumbUrl: g.heroImageThumbUrl,
    previewVideoUrl: g.previewVideoUrl,
    galleryImageUrls: g.galleryImageUrls,

    pricingModel: g.pricingModel ?? null,
    pricingCurrency: g.pricingCurrency ?? 'usd',
    pricingTiers: g.pricingTiers ?? [],

    startingUnitAmountCents: computeStartingUnitAmountCents(g),
  }));

  return NextResponse.json(
    {
      ok: true,
      orgId,
      org: org
        ? {
            name: org.name,
            timezone: org.timezone,
            feeLabel: org.feeLabel ?? 'Processing Fee',
            serviceFeeBps: org.serviceFeeBps ?? 0,
          }
        : null,
      games: items,
    },
    { headers }
  );
}

import { getDb } from '@/lib/db';
import { corsHeaders } from '@/lib/http/cors';

function json(statusCode: number, body: unknown, origin: string | null) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(origin),
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: unknown) {
  const e = event as Record<string, unknown>;

  const requestContext = (e.requestContext as Record<string, unknown> | undefined) ?? undefined;
  const http = (requestContext?.http as Record<string, unknown> | undefined) ?? undefined;
  const method = http?.method;

  const headers = (e.headers as Record<string, unknown> | undefined) ?? undefined;
  const origin = typeof headers?.origin === 'string' ? headers.origin : null;

  if (method === 'OPTIONS') return json(204, null, origin);

  const qs = (e.queryStringParameters as Record<string, unknown> | undefined) ?? {};
  const orgId = typeof qs.orgId === 'string' && qs.orgId ? qs.orgId : 'org_demo';

  const db = getDb();
  const games = await db.listGames(orgId);
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
    previewVideoUrl: g.previewVideoUrl,
    galleryImageUrls: g.galleryImageUrls,
  }));

  return json(200, { ok: true, orgId, games: items }, origin);
}

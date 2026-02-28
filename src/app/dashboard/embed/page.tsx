import { headers } from 'next/headers';

import { requireDashboardSession } from '@/lib/auth/require-dashboard-session';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmbedCodeBuilder } from './ui';
import { GiftCardEmbed } from './gift-card-embed';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function baseUrlFromHeaders(h: Headers) {
  const env = process.env.BF_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, '');

  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;

  return 'http://localhost:3000';
}

export default async function EmbedPage() {
  const { orgId } = await requireDashboardSession({ nextPath: '/dashboard/embed' });
  const db = getDb();
  const games = await db.listGames(orgId);

  const h = await headers();
  const baseUrl = baseUrlFromHeaders(h);

  return (
    <div className="grid gap-6">
      <SetupGuide orgId={orgId} page="embed" />
      <Card className="glass">
      <CardHeader>
        <CardTitle>Embed</CardTitle>
        <CardDescription>
          Copy and paste the code into your website. Your customers will be able to select a time and book.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmbedCodeBuilder
          baseUrl={baseUrl}
          orgId={orgId}
          games={games.map((g) => ({ gameId: g.gameId, name: g.name }))}
        />
      </CardContent>
    </Card>
      <GiftCardEmbed orgId={orgId} baseUrl={baseUrl} />
    </div>
  );
}

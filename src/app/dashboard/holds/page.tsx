import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ForceExpireHoldButton } from './_components/force-expire-hold-button';
import { getDb } from '@/lib/db';
import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import type { Game, Hold } from '@/lib/booking/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function toStr(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : '';
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default async function HoldsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const orgId = await getDashboardOrgId('/dashboard/holds');
  const sp = await searchParams;
  const q = toStr(sp.q).trim();
  const status = toStr(sp.status).trim();
  const gameId = toStr(sp.gameId).trim();

  const db = getDb();

  const games: Game[] = await db.listGames(orgId);
  const gameById = new Map(games.map((g) => [g.gameId, g] as const));

  const lists = await Promise.all(games.map((g) => db.listHoldsForGame(orgId, g.gameId)));
  let holds: Hold[] = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (gameId) holds = holds.filter((h) => h.gameId === gameId);
  if (status) holds = holds.filter((h) => h.status === status);

  if (q) {
    const qq = q.toLowerCase();
    holds = holds.filter((h) => {
      const gameName = gameById.get(h.gameId)?.name ?? '';
      return (
        h.holdId.toLowerCase().includes(qq) ||
        h.gameId.toLowerCase().includes(qq) ||
        gameName.toLowerCase().includes(qq) ||
        (h.customer?.name ?? '').toLowerCase().includes(qq) ||
        (h.customer?.email ?? '').toLowerCase().includes(qq) ||
        (h.customer?.phone ?? '').toLowerCase().includes(qq)
      );
    });
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Holds</CardTitle>
        <CardDescription>Filter holds and force-expire stuck checkouts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 sm:grid-cols-2 md:grid-cols-5" action="/dashboard/holds" method="get">
          <Input name="q" placeholder="Search holdId, customer, game…" defaultValue={q} className="sm:col-span-2 md:col-span-2" />

          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          >
            <option value="">All statuses</option>
            <option value="active">active</option>
            <option value="expired">expired</option>
            <option value="confirmed">confirmed</option>
            <option value="canceled">canceled</option>
          </select>

          <select
            name="gameId"
            defaultValue={gameId}
            className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          >
            <option value="">All games</option>
            {games.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="flex flex-col gap-2 sm:flex-row sm:col-span-2 md:col-span-5">
            <Button type="submit" variant="secondary" className="min-h-[44px] w-full sm:w-auto">
              Apply Filters
            </Button>
            <Button type="submit" variant="ghost" formAction="/dashboard/holds" className="min-h-[44px] w-full sm:w-auto">
              Reset
            </Button>
          </div>
        </form>

        {holds.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
            <div className="text-lg font-medium">No holds found</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Holds appear when customers start the booking process. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hold</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holds.map((h) => (
                    <TableRow key={h.holdId}>
                      <TableCell className="font-medium" title={h.holdId}>{h.holdId.slice(0, 8)}…</TableCell>
                      <TableCell>{gameById.get(h.gameId)?.name ?? h.gameId}</TableCell>
                      <TableCell>{h.bookingType}</TableCell>
                      <TableCell>{h.players}</TableCell>
                      <TableCell className="text-sm">{fmt(h.startAt)}</TableCell>
                      <TableCell className="text-sm">{fmt(h.expiresAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          h.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                          h.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {h.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{h.status === 'active' ? <ForceExpireHoldButton holdId={h.holdId} /> : null}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {holds.map((h) => (
                <div key={h.holdId} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium" title={h.holdId}>{h.holdId.slice(0, 8)}…</div>
                      <div className="text-xs text-muted-foreground">{gameById.get(h.gameId)?.name ?? h.gameId}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      h.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                      h.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{h.bookingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span>{h.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start:</span>
                      <span>{fmt(h.startAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{fmt(h.expiresAt)}</span>
                    </div>
                    {h.customer?.name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{h.customer.name}</span>
                      </div>
                    )}
                  </div>
                  {h.status === 'active' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <ForceExpireHoldButton holdId={h.holdId} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

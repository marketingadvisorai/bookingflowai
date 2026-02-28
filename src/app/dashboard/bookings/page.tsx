import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDb } from '@/lib/db';
import type { Booking, Game } from '@/lib/booking/types';
import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import { CancelBookingButton } from './_components/cancel-booking-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function toStr(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : '';
}

function isYmd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const orgId = await getDashboardOrgId('/dashboard/bookings');
  const sp = await searchParams;
  const q = toStr(sp.q).trim();
  const status = toStr(sp.status).trim();
  const gameId = toStr(sp.gameId).trim();
  const from = toStr(sp.from).trim();
  const to = toStr(sp.to).trim();

  const db = getDb();

  const games: Game[] = await db.listGames(orgId);
  const gameById = new Map(games.map((g) => [g.gameId, g] as const));

  const lists = await Promise.all(games.map((g) => db.listBookingsForGame(orgId, g.gameId)));
  let bookings: Booking[] = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (gameId) bookings = bookings.filter((b) => b.gameId === gameId);
  if (status) bookings = bookings.filter((b) => b.status === status);
  if (from && isYmd(from)) bookings = bookings.filter((b) => b.startAt.slice(0, 10) >= from);
  if (to && isYmd(to)) bookings = bookings.filter((b) => b.startAt.slice(0, 10) <= to);

  if (q) {
    const qq = q.toLowerCase();
    bookings = bookings.filter((b) => {
      const gameName = gameById.get(b.gameId)?.name ?? '';
      return (
        b.bookingId.toLowerCase().includes(qq) ||
        b.gameId.toLowerCase().includes(qq) ||
        gameName.toLowerCase().includes(qq) ||
        (b.customer?.name ?? '').toLowerCase().includes(qq) ||
        (b.customer?.email ?? '').toLowerCase().includes(qq) ||
        (b.customer?.phone ?? '').toLowerCase().includes(qq)
      );
    });
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>Search, filter, and cancel bookings (no refunds yet; Stripe comes later).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 sm:grid-cols-2 md:grid-cols-6" action="/dashboard/bookings" method="get">
          <Input name="q" placeholder="Search bookingId, customer, game…" defaultValue={q} className="sm:col-span-2 md:col-span-2" />

          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="confirmed">confirmed</option>
            <option value="canceled">canceled</option>
          </select>

          <select
            name="gameId"
            defaultValue={gameId}
            className="h-11 rounded-md border border-border bg-card px-3 text-sm"
          >
            <option value="">All games</option>
            {games.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.name}
              </option>
            ))}
          </select>

          <div>
            <label htmlFor="from" className="block text-xs text-muted-foreground mb-1">From</label>
            <Input id="from" name="from" type="date" defaultValue={from} />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs text-muted-foreground mb-1">To</label>
            <Input id="to" name="to" type="date" defaultValue={to} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:col-span-2 md:col-span-6">
            <Button type="submit" variant="secondary" className="min-h-[44px] w-full sm:w-auto">
              Apply Filters
            </Button>
            <Button type="submit" variant="ghost" formAction="/dashboard/bookings" className="min-h-[44px] w-full sm:w-auto">
              Reset
            </Button>
          </div>
        </form>

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
            <div className="text-lg font-medium">No bookings found</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.bookingId}>
                      <TableCell className="font-medium" title={b.bookingId}>{b.bookingId.slice(0, 8)}…</TableCell>
                      <TableCell>{gameById.get(b.gameId)?.name ?? b.gameId}</TableCell>
                      <TableCell>{b.bookingType}</TableCell>
                      <TableCell>{b.players}</TableCell>
                      <TableCell className="text-sm">{fmt(b.startAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {b.status === 'confirmed' ? <CancelBookingButton bookingId={b.bookingId} /> : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {bookings.map((b) => (
                <div key={b.bookingId} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium" title={b.bookingId}>{b.bookingId.slice(0, 8)}…</div>
                      <div className="text-xs text-muted-foreground">{gameById.get(b.gameId)?.name ?? b.gameId}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{b.bookingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span>{b.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start:</span>
                      <span>{fmt(b.startAt)}</span>
                    </div>
                    {b.customer?.name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span>{b.customer.name}</span>
                      </div>
                    )}
                  </div>
                  {b.status === 'confirmed' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <CancelBookingButton bookingId={b.bookingId} />
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

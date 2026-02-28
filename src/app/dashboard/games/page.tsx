import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Game } from '@/lib/booking/types';
import { getDb } from '@/lib/db';
import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import { CreateGameForm } from './_components/create-game-form';
import { DeleteGameButton } from './_components/delete-game-button';
import { EditGameDialog } from './_components/edit-game-dialog';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GamesPage() {
  const orgId = await getDashboardOrgId('/dashboard/games');
  const db = getDb();
  const games: Game[] = await db.listGames(orgId);
  const rooms = await db.listRooms(orgId);
  const roomsByGame = new Map<string, number>();
  for (const r of rooms) {
    roomsByGame.set(r.gameId, (roomsByGame.get(r.gameId) ?? 0) + 1);
  }

  return (
    <div className="grid gap-6">
      <SetupGuide orgId={orgId} page="games" />
      <CreateGameForm orgId={orgId} />

      <Card className="glass">
        <CardHeader>
          <CardTitle>Games</CardTitle>
          <CardDescription>Escape room products (duration, slot interval, booking types).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">List view. Use Create/Edit/Delete to manage games.</div>
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <a href="/api/dashboard/games" target="_blank" rel="noreferrer">
                View JSON
              </a>
            </Button>
          </div>

          {games.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
              <div className="text-lg font-medium">No games yet</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first game using the form above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Interval</TableHead>
                      <TableHead>Players</TableHead>
                      <TableHead>Types</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((g) => (
                      <TableRow key={g.gameId}>
                        <TableCell>
                          <div className="font-medium">{g.name}</div>
                          {!roomsByGame.get(g.gameId) && (
                            <div className="mt-1 text-xs text-amber-600">⚠ No rooms assigned — can&apos;t accept bookings</div>
                          )}
                          {(!g.pricingTiers || g.pricingTiers.length === 0) && (
                            <div className="mt-0.5 text-xs text-amber-600">⚠ No pricing set — widget will show &quot;pricing not configured&quot;</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {g.durationMins}m + {g.bufferMins}m
                        </TableCell>
                        <TableCell>{g.slotIntervalMins}m</TableCell>
                        <TableCell>
                          {g.minPlayers}–{g.maxPlayers}
                        </TableCell>
                        <TableCell>
                          {g.allowPrivate ? 'private' : ''}
                          {g.allowPrivate && g.allowPublic ? ' + ' : ''}
                          {g.allowPublic ? 'public' : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditGameDialog
                              orgId={orgId}
                              gameId={g.gameId}
                              initial={{
                                name: g.name,
                                durationMins: g.durationMins,
                                bufferMins: g.bufferMins,
                                slotIntervalMins: g.slotIntervalMins,
                                minPlayers: g.minPlayers,
                                maxPlayers: g.maxPlayers,
                                allowPrivate: g.allowPrivate,
                                allowPublic: g.allowPublic,
                                heroImageUrl: g.heroImageUrl ?? '',
                                heroImageThumbUrl: g.heroImageThumbUrl ?? '',
                                previewVideoUrl: g.previewVideoUrl ?? '',
                                galleryImageUrlsText: (g.galleryImageUrls ?? []).join('\n'),
                                pricingTiers: (g.pricingTiers ?? []).map((t) => ({
                                  minPlayers: t.minPlayers,
                                  ...(t.maxPlayers ? { maxPlayers: t.maxPlayers } : {}),
                                  unitAmountDollars: String(((t.unitAmountCents ?? 0) / 100).toFixed(2)).replace(/\.00$/, ''),
                                })),
                              }}
                            />
                            <DeleteGameButton gameId={g.gameId} gameName={g.name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {games.map((g) => (
                  <div key={g.gameId} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-muted-foreground">{g.gameId}</div>
                      {!roomsByGame.get(g.gameId) && (
                        <div className="mt-1 text-xs text-amber-600">⚠ No rooms assigned — can&apos;t accept bookings</div>
                      )}
                      {(!g.pricingTiers || g.pricingTiers.length === 0) && (
                        <div className="mt-0.5 text-xs text-amber-600">⚠ No pricing set — widget will show &quot;pricing not configured&quot;</div>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{g.durationMins}m + {g.bufferMins}m buffer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interval:</span>
                        <span>{g.slotIntervalMins}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span>{g.minPlayers}–{g.maxPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Types:</span>
                        <span>
                          {g.allowPrivate ? 'private' : ''}
                          {g.allowPrivate && g.allowPublic ? ' + ' : ''}
                          {g.allowPublic ? 'public' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      <EditGameDialog
                        orgId={orgId}
                        gameId={g.gameId}
                        initial={{
                          name: g.name,
                          durationMins: g.durationMins,
                          bufferMins: g.bufferMins,
                          slotIntervalMins: g.slotIntervalMins,
                          minPlayers: g.minPlayers,
                          maxPlayers: g.maxPlayers,
                          allowPrivate: g.allowPrivate,
                          allowPublic: g.allowPublic,
                          heroImageUrl: g.heroImageUrl ?? '',
                          heroImageThumbUrl: g.heroImageThumbUrl ?? '',
                          previewVideoUrl: g.previewVideoUrl ?? '',
                          galleryImageUrlsText: (g.galleryImageUrls ?? []).join('\n'),
                          pricingTiers: (g.pricingTiers ?? []).map((t) => ({
                            minPlayers: t.minPlayers,
                            ...(t.maxPlayers ? { maxPlayers: t.maxPlayers } : {}),
                            unitAmountDollars: String(((t.unitAmountCents ?? 0) / 100).toFixed(2)).replace(/\.00$/, ''),
                          })),
                        }}
                      />
                      <DeleteGameButton gameId={g.gameId} gameName={g.name} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

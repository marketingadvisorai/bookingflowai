import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Game, Room } from '@/lib/booking/types';
import { getDb } from '@/lib/db';
import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import { CreateRoomForm } from './_components/create-room-form';
import { DeleteRoomButton } from './_components/delete-room-button';
import { EditRoomDialog } from './_components/edit-room-dialog';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RoomsPage() {
  const orgId = await getDashboardOrgId('/dashboard/rooms');
  const db = getDb();
  const rooms: Room[] = await db.listRooms(orgId);
  const games: Game[] = await db.listGames(orgId);
  const gameOptions = games.map((g) => ({ gameId: g.gameId, name: g.name }));
  const gameById = new Map(games.map((g) => [g.gameId, g.name]));

  return (
    <div className="grid gap-6">
      <SetupGuide orgId={orgId} page="rooms" />
      <CreateRoomForm gameOptions={gameOptions} />

      <Card className="glass">
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
          <CardDescription>Physical rooms (resources) tied to a game.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">List view. Use Create/Edit/Delete to manage rooms.</div>
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <a href="/api/dashboard/rooms" target="_blank" rel="noreferrer">
                View JSON
              </a>
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
              <div className="text-lg font-medium">No rooms yet</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first room using the form above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((r) => (
                      <TableRow key={r.roomId}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{gameById.get(r.gameId) ?? r.gameId}</TableCell>
                        <TableCell>{r.maxPlayers}</TableCell>
                        <TableCell>
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            r.enabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {r.enabled ? 'enabled' : 'disabled'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditRoomDialog
                              roomId={r.roomId}
                              gameOptions={gameOptions}
                              initial={{
                                name: r.name,
                                gameId: r.gameId,
                                maxPlayers: r.maxPlayers,
                                enabled: r.enabled,
                              }}
                            />
                            <DeleteRoomButton roomId={r.roomId} roomName={r.name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {rooms.map((r) => (
                  <div key={r.roomId} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{gameById.get(r.gameId) ?? r.gameId}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        r.enabled ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {r.enabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span>{r.maxPlayers} players</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      <EditRoomDialog
                        roomId={r.roomId}
                        gameOptions={gameOptions}
                        initial={{
                          name: r.name,
                          gameId: r.gameId,
                          maxPlayers: r.maxPlayers,
                          enabled: r.enabled,
                        }}
                      />
                      <DeleteRoomButton roomId={r.roomId} roomName={r.name} />
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

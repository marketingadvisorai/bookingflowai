import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Game, OpeningHours, Schedule } from '@/lib/booking/types';
import { getDb } from '@/lib/db';
import { getDashboardOrgId } from '@/lib/auth/dashboard-org';
import { CreateScheduleForm } from './_components/create-schedule-form';
import { DeleteScheduleButton } from './_components/delete-schedule-button';
import { EditScheduleDialog } from './_components/edit-schedule-dialog';
import { SetupGuide } from '@/components/ai-guide/setup-guide';

function dowLabel(dow: number) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow] ?? String(dow);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SchedulesPage() {
  const orgId = await getDashboardOrgId('/dashboard/schedules');
  const db = getDb();
  const schedules: Schedule[] = await db.listSchedules(orgId);
  const games: Game[] = await db.listGames(orgId);
  const gameOptions = games.map((g) => ({ gameId: g.gameId, name: g.name }));
  const gameById = new Map(games.map((g) => [g.gameId, g.name]));

  return (
    <div className="grid gap-6">
      <SetupGuide orgId={orgId} page="schedules" />
      <CreateScheduleForm gameOptions={gameOptions} />

      <Card className="glass">
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
          <CardDescription>Opening hours per day (exceptions later).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">List view. Use Create/Edit/Delete to manage schedules.</div>
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <a href="/api/dashboard/schedules" target="_blank" rel="noreferrer">
                View JSON
              </a>
            </Button>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-lg border border-border/50 bg-card/30 p-8 text-center">
              <div className="text-lg font-medium">No schedules yet</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first schedule using the form above.
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
                      <TableHead>Hours</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((s) => (
                      <TableRow key={s.scheduleId}>
                        <TableCell className="font-medium">{gameById.get(s.gameId) ?? s.gameId}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {s.openingHours.map((o: OpeningHours, idx: number) => (
                              <div key={idx} className="text-xs text-muted-foreground">
                                {dowLabel(o.dayOfWeek)}: {o.start}–{o.end}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditScheduleDialog
                              scheduleId={s.scheduleId}
                              gameOptions={gameOptions}
                              initial={{ gameId: s.gameId, openingHours: s.openingHours }}
                            />
                            <DeleteScheduleButton scheduleId={s.scheduleId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {schedules.map((s) => (
                  <div key={s.scheduleId} className="rounded-lg border border-border bg-card/50 p-4">
                    <div className="mb-3">
                      <div className="font-medium">{gameById.get(s.gameId) ?? s.gameId}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">Opening Hours:</div>
                      <div className="space-y-1">
                        {s.openingHours.map((o: OpeningHours, idx: number) => (
                          <div key={idx} className="text-sm flex justify-between">
                            <span className="text-muted-foreground">{dowLabel(o.dayOfWeek)}:</span>
                            <span>{o.start}–{o.end}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      <EditScheduleDialog
                        scheduleId={s.scheduleId}
                        gameOptions={gameOptions}
                        initial={{ gameId: s.gameId, openingHours: s.openingHours }}
                      />
                      <DeleteScheduleButton scheduleId={s.scheduleId} />
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

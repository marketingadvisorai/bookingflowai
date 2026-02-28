'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
// cuid2 not needed (id generated server-side)

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Native select used for reliable mobile touch support

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);

const daySchema = z.object({
  enabled: z.boolean(),
  start: hhmm,
  end: hhmm,
});

function hhmmToMinutes(s: string) {
  const [hh, mm] = s.split(':').map((n) => Number(n));
  return (hh ?? 0) * 60 + (mm ?? 0);
}

const formSchema = z
  .object({
    gameId: z.string().min(1, 'Game is required'),
    days: z.tuple([daySchema, daySchema, daySchema, daySchema, daySchema, daySchema, daySchema]),
  })
  .superRefine((val, ctx) => {
    val.days.forEach((d, idx) => {
      if (!d.enabled) return;
      if (hhmmToMinutes(d.start) >= hhmmToMinutes(d.end)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid hours for ${DOW[idx]}: start must be before end`,
          path: ['days', idx, 'start'],
        });
      }
    });
  });

type FormState = z.infer<typeof formSchema>;

type Props = {
  gameOptions: { gameId: string; name: string }[];
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function CreateScheduleForm({ gameOptions }: Props) {
  const defaults: FormState = useMemo(
    () => ({
      gameId: gameOptions[0]?.gameId ?? '',
      days: [
        { enabled: true, start: '10:00', end: '22:00' },
        { enabled: true, start: '10:00', end: '22:00' },
        { enabled: true, start: '10:00', end: '22:00' },
        { enabled: true, start: '10:00', end: '22:00' },
        { enabled: true, start: '10:00', end: '22:00' },
        { enabled: true, start: '10:00', end: '23:00' },
        { enabled: true, start: '10:00', end: '23:00' },
      ],
    }),
    [gameOptions]
  );

  const [state, setState] = useState<FormState>(defaults);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDay(idx: number, patch: Partial<FormState['days'][number]>) {
    setState((s) => {
      const next = [...s.days] as FormState['days'];
      next[idx] = { ...next[idx], ...patch } as FormState['days'][number];
      return { ...s, days: next };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse(state);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    const openingHours = parsed.data.days
      .map((d, dayOfWeek) => (d.enabled ? { dayOfWeek, start: d.start, end: d.end } : null))
      .filter(Boolean);

    if (openingHours.length === 0) {
      setError('At least one day must be enabled');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/dashboard/schedules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gameId: parsed.data.gameId, openingHours }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as unknown;
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Request failed');
        return;
      }

      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Create schedule</CardTitle>
        <CardDescription>Define opening hours per day for a game (exceptions later).</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label>Game</Label>
            <select
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              value={state.gameId}
              onChange={(e) => setState((s) => ({ ...s, gameId: e.target.value }))}
            >
              <option value="" disabled>Select a game</option>
              {gameOptions.map((g) => (
                <option key={g.gameId} value={g.gameId}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-auto">
              <div className="grid grid-cols-[72px_1fr_1fr_100px] gap-2 p-3 text-xs text-muted-foreground">
                <div>Day</div>
                <div>Start</div>
                <div>End</div>
                <div className="text-right">Enabled</div>
              </div>
              <div className="divide-y divide-border">
                {state.days.map((d, idx) => (
                  <div key={idx} className="grid grid-cols-[72px_1fr_1fr_100px] items-center gap-2 p-3">
                    <div className="text-sm">{DOW[idx]}</div>
                    <Input
                      value={d.start}
                      onChange={(e) => setDay(idx, { start: e.target.value })}
                      disabled={!d.enabled}
                    />
                    <Input value={d.end} onChange={(e) => setDay(idx, { end: e.target.value })} disabled={!d.enabled} />
                    <div className="flex justify-end">
                      <input
                        type="checkbox"
                        checked={d.enabled}
                        onChange={(e) => setDay(idx, { enabled: e.target.checked })}
                        className="h-4 w-4 accent-[#FF4F00]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {state.days.map((d, idx) => (
                <div key={idx} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">{DOW[idx]}</div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={d.enabled}
                        onChange={(e) => setDay(idx, { enabled: e.target.checked })}
                        className="h-5 w-5 accent-[#FF4F00]"
                      />
                      <span className="text-muted-foreground">Enabled</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 text-xs text-muted-foreground">Start</Label>
                      <Input
                        value={d.start}
                        onChange={(e) => setDay(idx, { start: e.target.value })}
                        disabled={!d.enabled}
                        className="min-h-[44px]"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 text-xs text-muted-foreground">End</Label>
                      <Input 
                        value={d.end} 
                        onChange={(e) => setDay(idx, { end: e.target.value })} 
                        disabled={!d.enabled}
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={pending || gameOptions.length === 0} className="min-h-[44px] w-full sm:w-auto">
              {pending ? 'Creating…' : 'Create Schedule'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setState(defaults)} disabled={pending} className="min-h-[44px] w-full sm:w-auto">
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

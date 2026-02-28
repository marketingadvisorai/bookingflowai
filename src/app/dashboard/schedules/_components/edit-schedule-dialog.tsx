'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const schema = z
  .object({
    gameId: z.string().min(1),
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

type FormState = z.infer<typeof schema>;

type OpeningHours = { dayOfWeek: number; start: string; end: string };

type Props = {
  scheduleId: string;
  gameOptions: { gameId: string; name: string }[];
  initial: {
    gameId: string;
    openingHours: OpeningHours[];
  };
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function toDays(openingHours: OpeningHours[]): FormState['days'] {
  const base = Array.from({ length: 7 }, () => ({ enabled: false, start: '10:00', end: '22:00' }));
  for (const o of openingHours) {
    const idx = o.dayOfWeek;
    if (idx >= 0 && idx <= 6) base[idx] = { enabled: true, start: o.start, end: o.end };
  }
  return base as FormState['days'];
}

export function EditScheduleDialog({ scheduleId, gameOptions, initial }: Props) {
  const defaults: FormState = useMemo(
    () => ({
      gameId: initial.gameId,
      days: toDays(initial.openingHours),
    }),
    [initial]
  );

  const [open, setOpen] = useState(false);
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

  async function onSave() {
    setError(null);
    const parsed = schema.safeParse(state);
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
      const res = await fetch(`/api/dashboard/schedules/${encodeURIComponent(scheduleId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gameId: parsed.data.gameId, openingHours }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as unknown;
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Save failed');
        return;
      }

      setOpen(false);
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (setOpen(v), v ? setState(defaults) : null)}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-3xl border-border ">
        <DialogHeader>
          <DialogTitle>Edit schedule</DialogTitle>
          <DialogDescription>Update opening hours per day (exceptions later).</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Game</Label>
            <Select value={state.gameId} onValueChange={(v) => setState((s) => ({ ...s, gameId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {gameOptions.map((g) => (
                  <SelectItem key={g.gameId} value={g.gameId}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-auto rounded-lg border border-border">
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
                  <Input value={d.start} onChange={(e) => setDay(idx, { start: e.target.value })} disabled={!d.enabled} />
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

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={pending}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

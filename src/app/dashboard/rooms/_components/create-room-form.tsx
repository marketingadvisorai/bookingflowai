'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
// cuid2 not needed (id generated server-side)

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gameId: z.string().min(1, 'Game is required'),
  maxPlayers: z.coerce.number().int().min(1).max(100),
  enabled: z.boolean(),
});

type FormState = z.infer<typeof formSchema>;

type Props = {
  gameOptions: { gameId: string; name: string }[];
};

export function CreateRoomForm({ gameOptions }: Props) {
  const defaults: FormState = useMemo(
    () => ({
      name: '',
      gameId: gameOptions[0]?.gameId ?? '',
      maxPlayers: 10,
      enabled: true,
    }),
    [gameOptions]
  );

  const [state, setState] = useState<FormState>(defaults);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = formSchema.safeParse(state);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/dashboard/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data }),
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
        <CardTitle>Create room</CardTitle>
        <CardDescription>Add a physical room (resource) and tie it to a game.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Room name</Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Room C"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="grid gap-2">
              <Label htmlFor="maxPlayers">Capacity (max players)</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={state.maxPlayers}
                onChange={(e) => setState((s) => ({ ...s, maxPlayers: Number(e.target.value) }))}
                min={1}
                max={100}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
            <div className="text-sm">
              <div className="font-medium">Enabled</div>
              <div className="text-xs text-muted-foreground">Disable to hide room from availability.</div>
            </div>
            <Switch checked={state.enabled} onCheckedChange={(v) => setState((s) => ({ ...s, enabled: v }))} />
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={pending || gameOptions.length === 0} className="min-h-[44px] w-full sm:w-auto">
              {pending ? 'Creating…' : 'Create Room'}
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

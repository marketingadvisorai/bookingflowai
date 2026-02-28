'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const schema = z.object({
  name: z.string().min(1),
  gameId: z.string().min(1),
  maxPlayers: z.coerce.number().int().min(1).max(100),
  enabled: z.boolean(),
});

type FormState = z.infer<typeof schema>;

type Props = {
  roomId: string;
  initial: FormState;
  gameOptions: { gameId: string; name: string }[];
};

export function EditRoomDialog({ roomId, initial, gameOptions }: Props) {
  const defaults = useMemo(() => initial, [initial]);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FormState>(defaults);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setError(null);
    const parsed = schema.safeParse(state);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/dashboard/rooms/${encodeURIComponent(roomId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data }),
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
      <DialogContent className="max-w-2xl border border-border bg-background">
        <DialogHeader>
          <DialogTitle>Edit room</DialogTitle>
          <DialogDescription>Update configuration for this room.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Room name</Label>
            <Input value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Game</Label>
              <Select value={state.gameId} onValueChange={(v) => setState((s) => ({ ...s, gameId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select game" />
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
              <Label>Capacity (max players)</Label>
              <Input
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

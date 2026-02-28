'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PricingTiersEditor, toApiPricingTiers } from './pricing-tiers-editor';
import { ImageUpload } from './image-upload';

const tierSchema = z
  .object({
    minPlayers: z.coerce.number().int().min(1).max(100),
    maxPlayers: z.coerce.number().int().min(1).max(100).optional(),
    unitAmountDollars: z.string().min(1, 'Price is required'),
    label: z.string().optional(),
  })
  .refine((t) => (t.maxPlayers == null ? true : t.minPlayers <= t.maxPlayers), { path: ['minPlayers'], message: 'minPlayers must be <= maxPlayers' });

const schema = z
  .object({
    name: z.string().min(1),
    durationMins: z.coerce.number().int().min(15).max(240),
    bufferMins: z.coerce.number().int().min(0).max(120),
    slotIntervalMins: z.coerce.number().int().min(5).max(180),
    minPlayers: z.coerce.number().int().min(1).max(100),
    maxPlayers: z.coerce.number().int().min(1).max(100),
    allowPrivate: z.boolean(),
    allowPublic: z.boolean(),

    heroImageUrl: z.string().optional().or(z.literal('')),
    heroImageThumbUrl: z.string().optional().or(z.literal('')),
    previewVideoUrl: z.string().optional().or(z.literal('')),
    galleryImageUrlsText: z.string().optional(),

    pricingTiers: z.array(tierSchema).default([]),
  })
  .refine((v) => v.minPlayers <= v.maxPlayers, { path: ['minPlayers'], message: 'minPlayers must be <= maxPlayers' });

type FormState = z.infer<typeof schema>;

type Props = {
  orgId: string;
  gameId: string;
  initial: FormState;
};

export function EditGameDialog({ orgId, gameId, initial }: Props) {
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
      const pricingTiers = toApiPricingTiers(parsed.data.pricingTiers);
      const galleryImageUrls = String(parsed.data.galleryImageUrlsText ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);

      const { galleryImageUrlsText: _unused, ...rest } = parsed.data;
      const res = await fetch(`/api/dashboard/games/${encodeURIComponent(gameId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...rest,
          heroImageUrl: parsed.data.heroImageUrl || undefined,
          heroImageThumbUrl: parsed.data.heroImageThumbUrl || undefined,
          previewVideoUrl: parsed.data.previewVideoUrl || undefined,
          galleryImageUrls: galleryImageUrls.length ? galleryImageUrls : undefined,
          pricingModel: 'per_person',
          pricingCurrency: 'usd',
          pricingTiers,
        }),
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
          <DialogTitle>Edit game</DialogTitle>
          <DialogDescription>Update configuration for this game.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Duration</Label>
              <Input
                type="number"
                value={state.durationMins}
                onChange={(e) => setState((s) => ({ ...s, durationMins: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Buffer</Label>
              <Input
                type="number"
                value={state.bufferMins}
                onChange={(e) => setState((s) => ({ ...s, bufferMins: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Interval</Label>
              <Input
                type="number"
                value={state.slotIntervalMins}
                onChange={(e) => setState((s) => ({ ...s, slotIntervalMins: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Min players</Label>
              <Input
                type="number"
                value={state.minPlayers}
                onChange={(e) => setState((s) => ({ ...s, minPlayers: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Max players</Label>
              <Input
                type="number"
                value={state.maxPlayers}
                onChange={(e) => setState((s) => ({ ...s, maxPlayers: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
              <div className="text-sm">
                <div className="font-medium">Private bookings</div>
                <div className="text-xs text-muted-foreground">Exclusive room reservation.</div>
              </div>
              <Switch checked={state.allowPrivate} onCheckedChange={(v) => setState((s) => ({ ...s, allowPrivate: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
              <div className="text-sm">
                <div className="font-medium">Public bookings</div>
                <div className="text-xs text-muted-foreground">Shared capacity sessions.</div>
              </div>
              <Switch checked={state.allowPublic} onCheckedChange={(v) => setState((s) => ({ ...s, allowPublic: v }))} />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="heroImageUrl">Hero image URL (optional)</Label>
              <ImageUpload
                orgId={orgId}
                gameId={gameId}
                kind="hero"
                onUploaded={(url) => setState((s) => ({ ...s, heroImageUrl: url }))}
              />
            </div>
            <Input
              id="heroImageUrl"
              value={state.heroImageUrl}
              onChange={(e) => setState((s) => ({ ...s, heroImageUrl: e.target.value }))}
              placeholder="https://.../hero.webp"
            />

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="heroImageThumbUrl">Hero thumb URL (optional)</Label>
              <ImageUpload
                orgId={orgId}
                gameId={gameId}
                kind="hero_thumb"
                onUploaded={(url) => setState((s) => ({ ...s, heroImageThumbUrl: url }))}
              />
            </div>
            <Input
              id="heroImageThumbUrl"
              value={state.heroImageThumbUrl}
              onChange={(e) => setState((s) => ({ ...s, heroImageThumbUrl: e.target.value }))}
              placeholder="https://.../hero-thumb.webp"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="previewVideoUrl">Preview video URL (link only, optional)</Label>
            <Input
              id="previewVideoUrl"
              value={state.previewVideoUrl}
              onChange={(e) => setState((s) => ({ ...s, previewVideoUrl: e.target.value }))}
              placeholder="https://.../trailer.mp4"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="galleryImageUrls">Gallery image URLs (one per line, optional)</Label>
              <ImageUpload
                orgId={orgId}
                gameId={gameId}
                kind="gallery"
                onUploaded={(url) =>
                  setState((s) => {
                    const existing = (s.galleryImageUrlsText ?? '').split(/\r?\n/).map(u => u.trim()).filter(Boolean);
                    if (existing.length >= 3) return s;
                    return { ...s, galleryImageUrlsText: (s.galleryImageUrlsText ? `${s.galleryImageUrlsText}\n` : '') + url };
                  })
                }
              />
            </div>
            <textarea
              id="galleryImageUrls"
              className="min-h-[100px] w-full rounded-md border border-border bg-card p-2 text-sm outline-none"
              value={state.galleryImageUrlsText}
              onChange={(e) => setState((s) => ({ ...s, galleryImageUrlsText: e.target.value }))}
              placeholder="https://.../1.webp\nhttps://.../2.webp"
            />
          </div>

          <PricingTiersEditor value={state.pricingTiers} onChange={(next) => setState((s) => ({ ...s, pricingTiers: next }))} />

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

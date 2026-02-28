'use client';

import { useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  .refine((t) => (t.maxPlayers == null ? true : t.minPlayers <= t.maxPlayers), { message: 'minPlayers must be <= maxPlayers', path: ['minPlayers'] });

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
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
  .refine((v) => v.minPlayers <= v.maxPlayers, { message: 'minPlayers must be <= maxPlayers', path: ['minPlayers'] });

type FormState = z.infer<typeof formSchema>;

export function CreateGameForm({ orgId }: { orgId: string }) {
  const gameIdRef = useRef(`game_${createId()}`);
  const gameId = gameIdRef.current;

  const defaults: FormState = useMemo(
    () => ({
      name: '',
      durationMins: 60,
      bufferMins: 15,
      slotIntervalMins: 30,
      minPlayers: 2,
      maxPlayers: 10,
      allowPrivate: true,
      allowPublic: true,
      heroImageUrl: '',
      heroImageThumbUrl: '',
      previewVideoUrl: '',
      galleryImageUrlsText: '',
      pricingTiers: [{ minPlayers: 1, maxPlayers: undefined, unitAmountDollars: '' }],
    }),
    []
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
      const pricingTiers = toApiPricingTiers(parsed.data.pricingTiers);
      const galleryImageUrls = String(parsed.data.galleryImageUrlsText ?? '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/dashboard/games', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          gameId,
          heroImageUrl: parsed.data.heroImageUrl || undefined,
          heroImageThumbUrl: parsed.data.heroImageThumbUrl || undefined,
          previewVideoUrl: parsed.data.previewVideoUrl || undefined,
          galleryImageUrls: galleryImageUrls.length ? galleryImageUrls.slice(0, 3) : undefined,
          pricingModel: 'per_person',
          pricingCurrency: 'usd',
          pricingTiers,
        }),
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
        <CardTitle>Create game</CardTitle>
        <CardDescription>Add a new escape room game (product) for this org.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              placeholder="Prison Break"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="durationMins">Duration (mins)</Label>
              <Input
                id="durationMins"
                type="number"
                value={state.durationMins}
                onChange={(e) => setState((s) => ({ ...s, durationMins: Number(e.target.value) }))}
                min={15}
                max={240}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bufferMins">Buffer (mins)</Label>
              <Input
                id="bufferMins"
                type="number"
                value={state.bufferMins}
                onChange={(e) => setState((s) => ({ ...s, bufferMins: Number(e.target.value) }))}
                min={0}
                max={120}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slotIntervalMins">Slot interval (mins)</Label>
              <Input
                id="slotIntervalMins"
                type="number"
                value={state.slotIntervalMins}
                onChange={(e) => setState((s) => ({ ...s, slotIntervalMins: Number(e.target.value) }))}
                min={5}
                max={180}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="minPlayers">Min players</Label>
              <Input
                id="minPlayers"
                type="number"
                value={state.minPlayers}
                onChange={(e) => setState((s) => ({ ...s, minPlayers: Number(e.target.value) }))}
                min={1}
                max={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPlayers">Max players</Label>
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
                orgId={orgId ?? ''}
                gameId={gameId}
                kind="hero"
                onUploaded={(url) => setState((s) => ({ ...s, heroImageUrl: url }))}
              />
            </div>
            <Input
              id="heroImageUrl"
              value={state.heroImageUrl}
              onChange={(e) => setState((s) => ({ ...s, heroImageUrl: e.target.value }))}
              placeholder="https://.../hero.jpg"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="heroImageThumbUrl">Hero thumb (optional)</Label>
              <ImageUpload
                orgId={orgId ?? ''}
                gameId={gameId}
                kind="hero_thumb"
                onUploaded={(url) => setState((s) => ({ ...s, heroImageThumbUrl: url }))}
              />
            </div>
            <Input
              id="heroImageThumbUrl"
              value={state.heroImageThumbUrl}
              onChange={(e) => setState((s) => ({ ...s, heroImageThumbUrl: e.target.value }))}
              placeholder="https://.../hero-thumb.jpg"
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
              <Label htmlFor="galleryImageUrls">Gallery image URLs (one per line, max 3)</Label>
              <ImageUpload
                orgId={orgId ?? ''}
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
              placeholder="https://.../1.jpg\nhttps://.../2.jpg"
            />
          </div>

          <PricingTiersEditor value={state.pricingTiers} onChange={(next) => setState((s) => ({ ...s, pricingTiers: next }))} />

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={pending} className="min-h-[44px] w-full sm:w-auto">
              {pending ? 'Creating…' : 'Create Game'}
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

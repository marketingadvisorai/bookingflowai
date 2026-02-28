'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PRESETS = [2500, 5000, 7500, 10000];

function formatAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' }).format(cents / 100);
}

type Props = {
  onCreated: () => void;
};

export function IssueGiftCardForm({ onCreated }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const amountCents = selectedPreset ?? Math.round(Number(customAmount) * 100);
  const isValidAmount = amountCents >= 100 && amountCents <= 100000;

  async function create() {
    if (!isValidAmount) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/gift-cards', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          recipientName: recipientName || undefined,
          recipientEmail: recipientEmail || undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error || 'Failed to create gift card');
        return;
      }
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card className="glass rounded-xl">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-semibold">Issue Gift Card</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <div>
          <Label className="text-sm font-medium">Amount</Label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setSelectedPreset(p); setCustomAmount(''); }}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium border min-h-[44px] transition-all ${
                  selectedPreset === p
                    ? 'bg-[#FF4F00]/10 text-[#FF4F00] border-[#FF4F00]/30'
                    : 'border-border text-muted-foreground hover:bg-foreground/[0.04]'
                }`}
              >
                {formatAmount(p)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Custom:</span>
            <Input
              type="number"
              min={1}
              max={1000}
              placeholder="e.g. 35"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
              className="w-28 rounded-lg"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Recipient name (optional)</Label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Name" className="rounded-lg mt-1" />
          </div>
          <div>
            <Label className="text-xs">Recipient email (optional)</Label>
            <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Email" className="rounded-lg mt-1" />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="button" onClick={create} disabled={creating || !isValidAmount} className="min-h-[44px]">
          {creating ? 'Creating…' : `Issue ${isValidAmount ? formatAmount(amountCents) : ''} Gift Card`}
        </Button>
      </CardContent>
    </Card>
  );
}

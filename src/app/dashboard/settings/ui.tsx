'use client';

import { useState } from 'react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  feeLabel: z.string().min(1).max(64),
  serviceFeePercent: z.coerce.number().min(0).max(20),
});

type Props = {
  initial: {
    feeLabel: string;
    serviceFeePercent: string;
  };
};

export function OrgSettingsForm({ initial }: Props) {
  const [feeLabel, setFeeLabel] = useState(initial.feeLabel);
  const [serviceFeePercent, setServiceFeePercent] = useState(initial.serviceFeePercent);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSave() {
    setError(null);
    setDone(false);

    const parsed = schema.safeParse({ feeLabel, serviceFeePercent });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/dashboard/org', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ feeLabel: parsed.data.feeLabel, serviceFeePercent: parsed.data.serviceFeePercent }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as unknown;
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Save failed');
        return;
      }

      setDone(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="p-5 md:p-6">
        <CardTitle className="text-base font-semibold">Customer-Facing Fees</CardTitle>
        <CardDescription>Configure the processing fee shown to customers during checkout</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 md:p-6 md:pt-0 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="feeLabel" className="text-sm font-medium">
            Fee label
          </Label>
          <Input
            id="feeLabel"
            value={feeLabel}
            onChange={(e) => setFeeLabel(e.target.value)}
            className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
          />
          <p className="text-xs text-muted-foreground">Displayed to customers (e.g., "Processing Fee")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceFeePercent" className="text-sm font-medium">
            Processing fee (%)
          </Label>
          <Input
            id="serviceFeePercent"
            type="number"
            step="0.01"
            min={0}
            max={20}
            value={serviceFeePercent}
            onChange={(e) => setServiceFeePercent(e.target.value)}
            className="rounded-lg focus:ring-[#FF4F00]/20 focus:border-[#FF4F00]"
          />
          <p className="text-xs text-muted-foreground">Customer-facing fee added on top of subtotal (e.g., 1.90)</p>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
        {done && <div className="text-sm text-emerald-600 dark:text-emerald-300">Saved successfully</div>}

        <Button type="button" onClick={onSave} disabled={pending} className="w-full md:w-auto min-h-[44px]">
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
      </CardContent>
    </Card>
  );
}

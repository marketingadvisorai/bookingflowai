'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ForceExpireHoldButton({ holdId }: { holdId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    const ok = window.confirm('Force-expire this hold?');
    if (!ok) return;

    setPending(true);
    try {
      const res = await fetch(`/api/dashboard/holds/${encodeURIComponent(holdId)}/expire`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as unknown;
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Failed');
        return;
      }
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onClick}>
        {pending ? 'Expiring…' : 'Force-expire'}
      </Button>
    </div>
  );
}

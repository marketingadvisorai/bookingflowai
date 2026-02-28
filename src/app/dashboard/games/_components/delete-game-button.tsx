'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  gameId: string;
  gameName: string;
};

export function DeleteGameButton({ gameId, gameName }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);
    const ok = window.confirm(`Delete game "${gameName}"? Rooms tied to it will be disabled in this demo.`);
    if (!ok) return;

    setPending(true);
    try {
      const url = `/api/dashboard/games/${encodeURIComponent(gameId)}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as unknown;
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Delete failed');
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
      <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={onDelete}>
        {pending ? 'Deleting…' : 'Delete'}
      </Button>
    </div>
  );
}

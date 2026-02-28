'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    const ok = window.confirm('Cancel this booking?');
    if (!ok) return;

    setPending(true);
    try {
      const res = await fetch(`/api/dashboard/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'POST' });
      const body = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const maybeError =
          typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
        setError(maybeError ?? 'Cancel failed');
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
        {pending ? 'Canceling…' : 'Cancel'}
      </Button>
    </div>
  );
}

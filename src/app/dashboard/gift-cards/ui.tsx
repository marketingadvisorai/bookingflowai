'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GiftCardList } from './gift-card-list';
import { IssueGiftCardForm } from './issue-gift-card-form';

type GiftCard = {
  id: string;
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  currency: string;
  status: string;
  purchaserEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
  createdAt: string;
};

function formatAmount(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function GiftCardsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [showIssue, setShowIssue] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/gift-cards', { cache: 'no-store' });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error || 'Failed to load gift cards');
        return;
      }
      setGiftCards(body.giftCards ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{giftCards.length} gift card{giftCards.length !== 1 ? 's' : ''}</div>
        <Button type="button" onClick={() => setShowIssue(!showIssue)} className="min-h-[44px]">
          {showIssue ? 'Cancel' : 'Issue Gift Card'}
        </Button>
      </div>

      {showIssue && (
        <IssueGiftCardForm
          onCreated={() => { setShowIssue(false); load(); }}
        />
      )}

      <GiftCardList cards={giftCards} formatAmount={formatAmount} />
    </div>
  );
}

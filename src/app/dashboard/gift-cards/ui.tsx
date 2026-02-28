'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
  purchaserName?: string;
  recipientName?: string;
  recipientEmail?: string;
  personalMessage?: string;
  createdAt: string;
};

function formatAmount(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function GiftCardsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [orgName, setOrgName] = useState<string>('');
  const [showIssue, setShowIssue] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [gcRes, orgRes] = await Promise.all([
        fetch('/api/dashboard/gift-cards', { cache: 'no-store' }),
        fetch('/api/dashboard/org', { cache: 'no-store' }),
      ]);
      const gcBody = await gcRes.json().catch(() => null);
      const orgBody = await orgRes.json().catch(() => null);
      if (!gcRes.ok || !gcBody?.ok) {
        setError(gcBody?.error || 'Failed to load gift cards');
        return;
      }
      setGiftCards(gcBody.giftCards ?? []);
      if (orgBody?.org?.name) setOrgName(orgBody.org.name);
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

      <GiftCardList cards={giftCards} formatAmount={formatAmount} orgName={orgName} />
    </div>
  );
}

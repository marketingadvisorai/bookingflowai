'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

type Transaction = {
  id: string;
  amountCents: number;
  balanceAfterCents: number;
  type: string;
  bookingId?: string;
  note?: string;
  createdAt: string;
};

type Props = {
  cards: GiftCard[];
  formatAmount: (cents: number, currency?: string) => string;
};

const statusColor = (s: string) => {
  if (s === 'active') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
  if (s === 'redeemed') return 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30';
  return 'bg-muted text-muted-foreground border-border';
};

export function GiftCardList({ cards, formatAmount }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  async function loadTransactions(cardId: string) {
    if (selectedId === cardId) { setSelectedId(null); return; }
    setSelectedId(cardId);
    setTxLoading(true);
    try {
      const res = await fetch(`/api/dashboard/gift-cards?cardId=${cardId}`);
      const body = await res.json().catch(() => null);
      setTransactions(body?.transactions ?? []);
    } catch { setTransactions([]); }
    finally { setTxLoading(false); }
  }

  if (cards.length === 0) {
    return (
      <Card className="glass rounded-xl">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No gift cards yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {cards
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((gc) => (
          <div key={gc.id}>
            <button
              type="button"
              onClick={() => loadTransactions(gc.id)}
              className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-mono font-semibold tracking-wide">{gc.code}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Value: {formatAmount(gc.initialAmountCents, gc.currency)}</span>
                    <span>Balance: {formatAmount(gc.remainingAmountCents, gc.currency)}</span>
                    <span>{new Date(gc.createdAt).toLocaleDateString()}</span>
                    {gc.recipientName && <span>To: {gc.recipientName}</span>}
                    {gc.recipientEmail && <span>{gc.recipientEmail}</span>}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize w-fit ${statusColor(gc.status)}`}>
                  {gc.status}
                </span>
              </div>
            </button>

            {selectedId === gc.id && (
              <div className="ml-4 mt-2 rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Transaction History</div>
                {txLoading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No transactions yet</p>
                ) : (
                  <div className="space-y-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div className="text-muted-foreground">
                          {tx.type} {tx.bookingId && `• ${tx.bookingId.slice(0, 8)}…`}
                          {tx.note && ` • ${tx.note}`}
                        </div>
                        <div className="font-mono">
                          {tx.amountCents < 0 ? '-' : '+'}
                          {formatAmount(Math.abs(tx.amountCents))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

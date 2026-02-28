'use client';

import { useState } from 'react';

type Props = {
  orgId?: string;
  onApplied: (code: string, balanceCents: number) => void;
  onRemoved?: () => void;
  appliedCode?: string;
  appliedBalance?: number;
};

export function GiftCardField({ orgId, onApplied, onRemoved, appliedCode, appliedBalance }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  if (!orgId) return null;

  if (appliedCode) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Gift card applied</span>
            <span className="ml-2 text-xs font-mono text-gray-700 dark:text-[rgba(255,255,255,0.55)]">{appliedCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ${((appliedBalance ?? 0) / 100).toFixed(2)}
            </span>
            {onRemoved && (
              <button
                type="button"
                onClick={onRemoved}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove gift card"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.35)] hover:text-[var(--widget-primary)] transition-colors"
      >
        Have a gift card?
      </button>
    );
  }

  async function check() {
    if (!code.trim()) return;
    setChecking(true);
    setError('');
    try {
      const qs = new URLSearchParams({ code: code.trim(), ...(orgId ? { orgId } : {}) });
      const res = await fetch(`/api/v1/gift-cards/check?${qs}`);
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.message || 'Invalid gift card');
        return;
      }
      const gc = body.giftCard;
      if (gc.status !== 'active' || gc.remainingAmountCents <= 0) {
        setError(gc.status === 'expired' ? 'This gift card has expired' : 'This gift card has no balance');
        return;
      }
      onApplied(gc.code, gc.remainingAmountCents);
    } catch {
      setError('Could not check gift card');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="BKGF-XXXX-XXXX"
          maxLength={14}
          className="h-10 flex-1 rounded-xl bg-gray-100 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm font-mono text-gray-900 dark:text-[#fafaf9] outline-none focus:border-[var(--widget-primary)]/50 transition-all"
        />
        <button
          type="button"
          onClick={check}
          disabled={checking || code.length < 10}
          className="h-10 px-4 rounded-xl bg-[var(--widget-primary)] text-white text-xs font-medium disabled:opacity-50 hover:opacity-90 transition-all"
        >
          {checking ? '…' : 'Apply'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

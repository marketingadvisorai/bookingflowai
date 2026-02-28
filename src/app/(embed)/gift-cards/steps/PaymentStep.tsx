'use client';

import { useState } from 'react';
import { GiftCardPreview } from '../components/GiftCardPreview';

type GiftCardFormData = {
  amountCents: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  personalMessage: string;
};

type Props = {
  orgId: string;
  form: GiftCardFormData;
  venueName: string;
  onBack: () => void;
  onSuccess: (code: string, giftCardId: string) => void;
};

export function PaymentStep({ orgId, form, venueName, onBack, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePurchase() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/gift-cards/purchase', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orgId,
          amountCents: form.amountCents,
          purchaserName: form.purchaserName || undefined,
          purchaserEmail: form.purchaserEmail,
          recipientName: form.recipientName || undefined,
          recipientEmail: form.recipientEmail || undefined,
          personalMessage: form.personalMessage || undefined,
          returnUrl: window.location.origin + '/gift-cards',
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.message || body?.error || 'Failed to create gift card');
        return;
      }
      onSuccess(body.code, body.giftCardId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  const amountDisplay = `$${(form.amountCents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Full Gift Card Preview */}
      <div className="flex justify-center">
        <GiftCardPreview
          amountCents={form.amountCents}
          recipientName={form.recipientName || undefined}
          senderName={form.purchaserName || undefined}
          venueName={venueName}
          className="w-full max-w-md"
        />
      </div>

      {/* Review & Payment */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#222225] p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">
          Review & Pay
        </h2>
        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              Gift card amount
            </span>
            <span className="font-semibold text-gray-900 dark:text-[#fafaf9]">
              {amountDisplay}
            </span>
          </div>
          {form.recipientName && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">For</span>
              <span className="text-gray-900 dark:text-[#fafaf9]">{form.recipientName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[rgba(255,255,255,0.55)]">From</span>
            <span className="text-gray-900 dark:text-[#fafaf9]">
              {form.purchaserName || form.purchaserEmail}
            </span>
          </div>
          {form.personalMessage && (
            <div className="border-t border-gray-100 pt-2 dark:border-white/[0.06]">
              <p className="text-xs text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                Message
              </p>
              <p className="mt-1 italic text-gray-700 dark:text-[rgba(255,255,255,0.55)]">
                &ldquo;{form.personalMessage}&rdquo;
              </p>
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="h-12 rounded-xl border border-gray-200 px-5 text-sm text-gray-600 transition-all hover:bg-gray-50 dark:border-white/[0.06] dark:text-[rgba(255,255,255,0.55)] dark:hover:bg-white/[0.03]"
          >
            Back
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handlePurchase}
            className="h-12 flex-1 rounded-xl bg-[#FF4F00] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E64600] disabled:opacity-60"
          >
            {loading ? 'Processing…' : `Pay ${amountDisplay}`}
          </button>
        </div>
      </div>
    </div>
  );
}

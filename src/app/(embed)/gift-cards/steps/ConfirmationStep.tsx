'use client';

import { useState } from 'react';
import { GiftCardPreview } from '../components/GiftCardPreview';
import { Confetti } from '../components/Confetti';

type Props = {
  code: string;
  amountCents: number;
  recipientName?: string;
  senderName?: string;
  venueName: string;
};

export function ConfirmationStep({
  code,
  amountCents,
  recipientName,
  senderName,
  venueName,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById('gift-card-code');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div className="relative space-y-6">
      <Confetti />

      <div className="flex justify-center">
        <GiftCardPreview
          amountCents={amountCents}
          recipientName={recipientName}
          senderName={senderName}
          venueName={venueName}
          code={code}
          className="w-full max-w-md"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-white/[0.06] dark:bg-[#222225]">
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#fafaf9]">
          Gift Card Sent!
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
          {recipientName
            ? `${recipientName} will love it!`
            : 'Your gift card is ready!'}
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="mb-2 text-xs text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
            Gift Card Code
          </p>
          <p
            id="gift-card-code"
            className="font-mono text-2xl font-bold tracking-wider text-gray-900 dark:text-[#fafaf9]"
          >
            {code}
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-white/[0.06] dark:bg-[#1a1a1d] dark:text-[rgba(255,255,255,0.55)] dark:hover:bg-white/[0.03]"
          >
            {copied ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
          Use this code at checkout to redeem your gift card.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 h-12 w-full rounded-xl bg-[#FF4F00] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E64600]"
        >
          Send Another Gift Card
        </button>
      </div>
    </div>
  );
}

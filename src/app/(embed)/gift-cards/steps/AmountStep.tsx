'use client';

import { useState } from 'react';
import { GiftCardPreview } from '../components/GiftCardPreview';

const PRESETS = [2500, 5000, 7500, 10000];

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

type Props = {
  amountCents: number;
  venueName: string;
  onChange: (v: number) => void;
  onNext: () => void;
};

export function AmountStep({ amountCents, venueName, onChange, onNext }: Props) {
  const [custom, setCustom] = useState('');
  const isPreset = PRESETS.includes(amountCents);
  const valid = amountCents >= 1000 && amountCents <= 100000;

  return (
    <div className="space-y-6">
      {/* Gift Card Preview */}
      <div className="flex justify-center">
        <GiftCardPreview
          amountCents={amountCents}
          venueName={venueName}
          className="w-full max-w-md"
        />
      </div>

      {/* Amount Selection */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#222225] p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">
          Choose an amount
        </h2>

        {/* Preset amounts as pills */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onChange(p);
                setCustom('');
              }}
              className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                amountCents === p && isPreset
                  ? 'border-[#FF4F00] bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/25'
                  : 'border-gray-200 text-gray-700 hover:border-[#FF4F00]/50 hover:bg-[#FF4F00]/5 dark:border-white/[0.06] dark:text-[rgba(255,255,255,0.55)] dark:hover:border-[#FF4F00]/50'
              }`}
            >
              {fmt(p)}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mt-4">
          <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
            Custom amount ($10 - $1,000)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              $
            </span>
            <input
              type="number"
              min={10}
              max={1000}
              placeholder="Enter amount"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                const cents = Math.round(Number(e.target.value) * 100);
                if (cents >= 1000) onChange(cents);
              }}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-all focus:border-[#FF4F00]/50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-[#fafaf9]"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={onNext}
          className="mt-5 h-12 w-full rounded-xl bg-[#FF4F00] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E64600] disabled:opacity-40"
        >
          Continue — {fmt(amountCents)}
        </button>
      </div>
    </div>
  );
}

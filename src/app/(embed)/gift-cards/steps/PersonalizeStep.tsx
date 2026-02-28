'use client';

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
  form: GiftCardFormData;
  venueName: string;
  onChange: (updates: Partial<GiftCardFormData>) => void;
  onBack: () => void;
  onNext: () => void;
};

const inputClass =
  'h-10 w-full rounded-xl bg-gray-50 border border-gray-200 dark:border-white/[0.06] dark:bg-white/[0.03] px-3 text-sm text-gray-900 dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)] outline-none focus:border-[#FF4F00]/50 transition-all';

export function PersonalizeStep({ form, venueName, onChange, onBack, onNext }: Props) {
  const canProceed = form.purchaserEmail.includes('@');
  const messageLength = form.personalMessage.length;

  return (
    <div className="space-y-6">
      {/* Gift Card Preview with live updates */}
      <div className="flex justify-center">
        <GiftCardPreview
          amountCents={form.amountCents}
          recipientName={form.recipientName || undefined}
          senderName={form.purchaserName || undefined}
          venueName={venueName}
          className="w-full max-w-md"
        />
      </div>

      {/* Personalization Form */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#222225] p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">
          Personalize your gift
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              Your name
            </label>
            <input
              value={form.purchaserName}
              onChange={(e) => onChange({ purchaserName: e.target.value })}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              Your email *
            </label>
            <input
              type="email"
              value={form.purchaserEmail}
              onChange={(e) => onChange({ purchaserEmail: e.target.value })}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div className="border-t border-gray-100 pb-1 pt-3 dark:border-white/[0.06]">
            <p className="text-xs text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
              Recipient (optional)
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              Recipient name
            </label>
            <input
              value={form.recipientName}
              onChange={(e) => onChange({ recipientName: e.target.value })}
              placeholder="Their name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
              Recipient email
            </label>
            <input
              type="email"
              value={form.recipientEmail}
              onChange={(e) => onChange({ recipientEmail: e.target.value })}
              placeholder="them@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
                Personal message
              </label>
              <span className="text-xs text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                {messageLength}/500
              </span>
            </div>
            <textarea
              value={form.personalMessage}
              onChange={(e) => onChange({ personalMessage: e.target.value })}
              placeholder="Enjoy your experience!"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-[#FF4F00]/50 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-[#fafaf9] dark:placeholder:text-[rgba(255,255,255,0.35)]"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-xl border border-gray-200 px-5 text-sm text-gray-600 transition-all hover:bg-gray-50 dark:border-white/[0.06] dark:text-[rgba(255,255,255,0.55)] dark:hover:bg-white/[0.03]"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={onNext}
            className="h-12 flex-1 rounded-xl bg-[#FF4F00] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E64600] disabled:opacity-40"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

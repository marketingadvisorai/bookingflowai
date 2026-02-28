'use client';

import { useState } from 'react';
import { AmountStep } from './steps/AmountStep';
import { PersonalizeStep } from './steps/PersonalizeStep';
import { PaymentStep } from './steps/PaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

type Props = {
  orgId?: string;
  orgName: string;
  initialSuccess?: boolean;
  initialGiftCardId?: string;
};

export type GiftCardFormData = {
  amountCents: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  personalMessage: string;
};

export function GiftCardPurchase({ orgId, orgName, initialSuccess }: Props) {
  const [step, setStep] = useState(initialSuccess ? 4 : 1);
  const [form, setForm] = useState<GiftCardFormData>({
    amountCents: 5000,
    purchaserName: '',
    purchaserEmail: '',
    recipientName: '',
    recipientEmail: '',
    personalMessage: '',
  });
  const [giftCardCode, setGiftCardCode] = useState('');

  if (!orgId) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
          Missing organization ID. Add ?orgId=your_org_id to the URL.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#fafaf9]">
          🎁 Gift Card
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
          {orgName}
        </p>
      </div>
      {step < 4 && (
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-[#FF4F00]'
                  : s < step
                    ? 'w-6 bg-[#FF4F00]/40'
                    : 'w-6 bg-gray-200 dark:bg-white/[0.06]'
              }`}
            />
          ))}
        </div>
      )}
      {step === 1 && (
        <AmountStep
          amountCents={form.amountCents}
          venueName={orgName}
          onChange={(v) => setForm({ ...form, amountCents: v })}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <PersonalizeStep
          form={form}
          venueName={orgName}
          onChange={(u) => setForm({ ...form, ...u })}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <PaymentStep
          orgId={orgId}
          form={form}
          venueName={orgName}
          onBack={() => setStep(2)}
          onSuccess={(code) => {
            setGiftCardCode(code);
            setStep(4);
          }}
        />
      )}
      {step === 4 && (
        <ConfirmationStep
          code={giftCardCode}
          amountCents={form.amountCents}
          recipientName={form.recipientName || undefined}
          senderName={form.purchaserName || undefined}
          venueName={orgName}
        />
      )}
    </div>
  );
}

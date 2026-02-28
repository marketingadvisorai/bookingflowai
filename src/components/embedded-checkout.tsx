'use client';

import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

type Props = {
  clientSecret: string;
  onComplete?: () => void;
};

export function EmbeddedCheckout({ clientSecret, onComplete }: Props) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#1a1a1d] p-4 overflow-hidden">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret, onComplete }}>
        <StripeEmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

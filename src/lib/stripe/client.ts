import Stripe from 'stripe';
import { getStripeEnv } from '@/lib/stripe/env';

let STRIPE: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const env = getStripeEnv();
  if (!env) return null;

  if (!STRIPE) {
    STRIPE = new Stripe(env.secretKey, {
      // Use built-in fetch in Node/Next.
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  return STRIPE;
}
// force rebuild 1771985060

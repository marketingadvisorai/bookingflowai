export type StripeEnv = {
  secretKey: string;
};

export function getStripeEnv(): StripeEnv | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return { secretKey };
}

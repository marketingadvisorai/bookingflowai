import Stripe from 'stripe';

type CreateGiftCardSessionParams = {
  stripe: Stripe;
  orgStripeAccountId: string;
  cardId: string;
  code: string;
  orgId: string;
  amountCents: number;
  returnUrl?: string;
};

export async function createGiftCardCheckoutSession(params: CreateGiftCardSessionParams) {
  const { stripe, orgStripeAccountId, cardId, code, orgId, amountCents, returnUrl } = params;

  const baseUrl = returnUrl || `${process.env.BF_PUBLIC_BASE_URL || 'https://bookingflowai.com'}/gift-cards`;
  const returnUrlFinal = `${baseUrl}?success=true&giftCardId=${cardId}&session_id={CHECKOUT_SESSION_ID}`.replace(
    '%7BCHECKOUT_SESSION_ID%7D',
    '{CHECKOUT_SESSION_ID}'
  );

  const feePercent = Number(process.env.BF_PLATFORM_FEE_PERCENT ?? '5');
  const applicationFeeAmount = feePercent > 0 ? Math.round(amountCents * (feePercent / 100)) : undefined;

  const metadata = { orgId, giftCardId: cardId, giftCardCode: code, type: 'gift_card_purchase' };

  return stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    payment_method_types: ['card'],
    return_url: returnUrlFinal,
    client_reference_id: cardId,
    payment_intent_data: {
      transfer_data: { destination: orgStripeAccountId },
      ...(applicationFeeAmount ? { application_fee_amount: applicationFeeAmount } : {}),
      metadata,
    },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: amountCents,
        product_data: {
          name: 'Gift Card',
          description: `Gift card ${code} - $${(amountCents / 100).toFixed(2)}`,
        },
      },
    }],
    metadata,
  });
}

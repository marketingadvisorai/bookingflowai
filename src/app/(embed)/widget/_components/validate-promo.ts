export type PromoStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'not_configured';

export async function validatePromoCode({
  orgId,
  code,
}: {
  orgId: string;
  code: string;
}): Promise<{ status: PromoStatus; message: string }> {
  const trimmed = code.trim();
  if (!trimmed) return { status: 'idle', message: '' };

  try {
    const res = await fetch('/api/v1/stripe/promo/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orgId, code: trimmed }),
    });

    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

    if (res.status === 501 || body?.error === 'stripe_not_configured') {
      return { status: 'not_configured', message: 'Promo validation will be enabled after Stripe keys are added.' };
    }

    if (res.status >= 500) {
      return { status: 'invalid', message: 'Promo validation is temporarily unavailable. Try again.' };
    }

    if (!res.ok || !body?.ok) {
      return { status: 'invalid', message: 'Invalid promo code' };
    }

    return { status: 'valid', message: 'Promo code applied' };
  } catch {
    return { status: 'invalid', message: 'Could not validate promo code' };
  }
}

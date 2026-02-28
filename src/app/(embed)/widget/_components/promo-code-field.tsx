'use client';

import { emitBFEvent } from './widget-tracking';

export function PromoCodeField({
  orgId,
  gameId,
  promoCode,
  setPromoCode,
  promoStatus,
  promoMessage,
  onApply,
  setPromoStatus,
  setPromoMessage,
}: {
  orgId: string;
  gameId: string;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoStatus: 'idle' | 'checking' | 'valid' | 'invalid' | 'not_configured';
  promoMessage: string;
  onApply: () => void;
  setPromoStatus: (v: 'idle' | 'checking' | 'valid' | 'invalid' | 'not_configured') => void;
  setPromoMessage: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-xs text-muted-foreground">Promo code (optional)</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            setPromoStatus('idle');
            setPromoMessage('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onApply();
          }}
          onBlur={() => {
            const code = promoCode.trim();
            if (code) emitBFEvent('promo_code_entered', { orgId, gameId, code });
          }}
          placeholder="SAVE10"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          className="h-10 w-full rounded-xl bg-gray-100 dark:bg-muted/60 px-3 text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!promoCode.trim() || promoStatus === 'checking'}
          className="h-10 w-full rounded-xl bg-[var(--widget-primary)] px-4 text-sm font-semibold text-white hover:opacity-95 disabled:bg-gray-200 dark:disabled:bg-muted/70 disabled:text-gray-500 dark:disabled:text-muted-foreground disabled:opacity-60 sm:w-auto"
        >
          {promoStatus === 'checking' ? 'Checking…' : 'Apply'}
        </button>
      </div>

      {promoMessage ? (
        <div
          role="status"
          aria-live="polite"
          className={
            'text-xs ' +
            (promoStatus === 'valid'
              ? 'text-emerald-600'
              : promoStatus === 'not_configured'
                ? 'text-muted-foreground'
                : promoStatus === 'checking'
                  ? 'text-muted-foreground'
                  : 'text-destructive')
          }
        >
          {promoMessage}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
          Discount will be applied at checkout if eligible.
        </div>
      )}
    </div>
  );
}

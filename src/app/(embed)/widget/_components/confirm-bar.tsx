'use client';

export function ConfirmBar({
  holdId,
  loading,
  onConfirm,
}: {
  holdId: string | null;
  loading: boolean;
  onConfirm: () => void;
}) {
  const ctaText = loading ? 'Working…' : holdId ? 'Pay & confirm' : 'No active hold';

  return (
    <div className="sticky bottom-0 z-10 mt-4 rounded-2xl border border-border bg-white dark:bg-[var(--glass-bg)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-xs text-muted-foreground sm:mr-auto" role="status" aria-live="polite">
          {holdId
            ? 'Ready to pay & confirm your booking.'
            : 'Select a time slot above to reserve it and enable checkout.'}
        </div>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!holdId || loading}
          className="w-full rounded-full bg-[var(--widget-primary)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto sm:py-2 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{ctaText}</span>
        </button>
      </div>
    </div>
  );
}

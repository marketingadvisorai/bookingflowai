const PLAN_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  free: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', border: 'border-neutral-300 dark:border-neutral-600' },
  pro: { bg: 'bg-transparent', text: '', border: '' },
  business: { bg: '', text: '', border: '' },
  enterprise: { bg: '', text: 'text-white', border: '' },
};

export function PlanBadge({ plan }: { plan: string }) {
  const p = plan?.toLowerCase() ?? 'free';

  if (p === 'pro') {
    return (
      <span
        className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium"
        style={{ borderColor: '#FF4F00', color: '#FF4F00' }}
      >
        Pro
      </span>
    );
  }

  if (p === 'business') {
    return (
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#D4A017', color: '#fff' }}
      >
        Business
      </span>
    );
  }

  if (p === 'enterprise') {
    return (
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#201515', color: '#fff' }}
      >
        Enterprise
      </span>
    );
  }

  const s = PLAN_STYLES.free;
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
      Free
    </span>
  );
}

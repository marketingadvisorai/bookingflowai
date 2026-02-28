'use client';

const planStyles: Record<string, string> = {
  free: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  pro: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
  business: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  enterprise: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
};

export function PlanBadge({ plan }: { plan: string }) {
  const p = plan?.toLowerCase() ?? 'free';
  const cls = planStyles[p] ?? planStyles.free;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {p}
    </span>
  );
}

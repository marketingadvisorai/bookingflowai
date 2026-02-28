export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pl-14 md:pl-0">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
    </div>
  );
}

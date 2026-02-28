import { PlanBadge } from './plan-badge';

interface UserRowProps {
  email: string;
  name: string;
  orgName: string;
  plan: string;
  authProvider: string;
  createdAt: string;
}

export function UserRow({ email, name, orgName, plan, authProvider, createdAt }: UserRowProps) {
  const joined = createdAt ? new Date(createdAt).toLocaleDateString() : '—';
  return (
    <>
      {/* Desktop row */}
      <tr className="hidden border-b border-neutral-100 dark:border-neutral-800 md:table-row">
        <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">{email}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{name || '—'}</td>
        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{orgName || '—'}</td>
        <td className="px-4 py-3"><PlanBadge plan={plan} /></td>
        <td className="px-4 py-3 text-sm capitalize text-neutral-500 dark:text-neutral-400">{authProvider}</td>
        <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{joined}</td>
      </tr>
      {/* Mobile card */}
      <tr className="md:hidden">
        <td colSpan={6} className="px-0 py-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="font-medium text-neutral-900 dark:text-white">{email}</p>
            <p className="mt-1 text-sm text-neutral-500">{name || 'No name'} · {orgName || 'No workspace'}</p>
            <div className="mt-2 flex items-center gap-2">
              <PlanBadge plan={plan} />
              <span className="text-xs capitalize text-neutral-400">{authProvider}</span>
              <span className="text-xs text-neutral-400">{joined}</span>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/organizations', label: 'Workspaces' },
  { href: '/dashboard/admin/observations', label: 'AI Observations' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 border-b border-border/50">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-b-2 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={isActive ? { borderBottomColor: '#FF4F00' } : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

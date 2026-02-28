'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'General' },
  { href: '/dashboard/settings/profile', label: 'Profile' },
  { href: '/dashboard/settings/payments', label: 'Payments' },
  { href: '/dashboard/settings/promotions', label: 'Promotions' },
  { href: '/dashboard/settings/tracking', label: 'Tracking' },
  { href: '/dashboard/settings/appearance', label: 'Appearance' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {SETTINGS_NAV.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap min-h-[44px] inline-flex items-center
              ${
                isActive
                  ? 'bg-[#FF4F00]/10 text-[#FF4F00]'
                  : 'bg-transparent text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

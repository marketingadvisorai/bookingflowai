'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';

type NavItem = {
  href: string;
  label: string;
  icon?: any;
  comingSoon?: boolean;
  separator?: string;
};

type Props = {
  items: NavItem[];
};

export function DesktopNav({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item, i) => {
        if (item.separator) {
          return (
            <div
              key={`sep-${item.separator}`}
              className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-4 mb-1 px-3"
            >
              {item.separator}
            </div>
          );
        }

        if (item.comingSoon) {
          return (
            <span
              key={item.href + item.label}
              className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground/60 cursor-default"
            >
              {item.label}
              <span className="text-[10px] bg-foreground/[0.06] text-muted-foreground px-1.5 py-0.5 rounded-full ml-auto">
                Soon
              </span>
            </span>
          );
        }

        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-foreground/[0.08] text-foreground font-medium'
                : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
            }`}
          >
            {item.icon && <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

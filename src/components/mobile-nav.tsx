'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

type NavItem = {
  href: string;
  label: string;
  comingSoon?: boolean;
  separator?: string;
};

type Props = {
  items: NavItem[];
};

export function MobileNav({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button - visible on mobile only */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.8} /> : <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.8} />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <nav
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="text-sm font-semibold text-foreground">Menu</div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.8} />
            </button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1">
              {items.map((item) => {
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
                      className="flex items-center rounded-lg px-3 py-2.5 text-sm text-muted-foreground/60 cursor-default"
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
                    onClick={() => setIsOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-foreground/[0.08] text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

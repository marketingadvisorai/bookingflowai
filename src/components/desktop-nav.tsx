'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

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
  const [agentsOpen, setAgentsOpen] = useState(false);

  // Split items into main nav and agent items
  const separatorIdx = items.findIndex((item) => item.separator === 'Agents');
  const mainItems = separatorIdx >= 0 ? items.slice(0, separatorIdx) : items;
  const agentItems = separatorIdx >= 0 ? items.slice(separatorIdx + 1) : [];

  return (
    <nav className="flex flex-col gap-1">
      {mainItems.map((item) => {
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

      {/* Collapsible Agents section */}
      {agentItems.length > 0 && (
        <>
          <button
            onClick={() => setAgentsOpen(!agentsOpen)}
            className="flex items-center justify-between rounded-lg px-3 py-2 mt-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-foreground/[0.04] transition-colors"
          >
            <span>Agents</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={1.8}
              className={`transition-transform duration-200 ${agentsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {agentsOpen && (
            <div className="flex flex-col gap-0.5 ml-1">
              {agentItems.map((item) => (
                <span
                  key={item.href + item.label}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground/60 cursor-default"
                >
                  {item.icon && <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />}
                  <span className="truncate">{item.label}</span>
                  <span className="text-[10px] text-[#FF4F00] font-medium px-1.5 py-0.5 rounded-full ml-auto bg-[#FF4F00]/10">
                    Soon
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </nav>
  );
}

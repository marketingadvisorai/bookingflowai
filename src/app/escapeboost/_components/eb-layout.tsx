'use client';

import { EBNav } from './eb-nav';
import { EBFooter } from './eb-footer';
import { useEffect, useRef, type ReactNode } from 'react';

export function EBLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#201515] font-sans antialiased">
      <EBNav />
      <main>{children}</main>
      <EBFooter />
    </div>
  );
}

export function EBSection({
  children,
  className = '',
  light = false,
  dark = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`py-20 lg:py-[120px] ${dark ? 'bg-[#201515] text-[#F8F4F0]' : light ? 'bg-[#F8F5F0]' : ''} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-10">{children}</div>
    </section>
  );
}

export function EBFade({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

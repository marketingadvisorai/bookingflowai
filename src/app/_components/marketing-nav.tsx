'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

const links = [
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={
          'sticky top-0 z-50 transition-all duration-300 ' +
          (scrolled
            ? 'border-b border-[#E7E5E4] bg-[#FFFDF9]/95 backdrop-blur-xl shadow-sm'
            : 'bg-transparent')
        }
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 lg:px-10 h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 hover:opacity-90 transition-opacity duration-200 relative z-50">
            <span className="font-extrabold text-xl text-[#201515] tracking-tight">booking</span>
            <span className="relative font-normal text-xl text-[#201515] tracking-tight">
              flow
              <span className="absolute -top-1 left-[5px] w-1.5 h-1.5 rounded-full bg-[#FF4A00]"></span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#574E4C] hover:text-[#201515] transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF4F00] after:transition-all after:duration-200 hover:after:w-full"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#413735] px-4 py-2 rounded-full hover:bg-black/5 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#FF4F00] text-[#FFFDF9] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile: Sign up pill + Hamburger/X */}
          <div className="md:hidden flex items-center gap-3 relative z-50">
            <Link
              href="/signup"
              className="bg-[#FF4F00] text-[#FFFDF9] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#E64700] transition-colors duration-200"
            >
              Sign up
            </Link>
            <button
              className="p-2 text-[#201515] hover:bg-black/5 rounded-lg transition-colors duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" strokeWidth={1.8} /> : <HugeiconsIcon icon={Menu01Icon} className="h-6 w-6" strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {/* Zapier-style full-screen mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#FFFDF9] animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Menu content with proper spacing from top nav */}
          <div className="flex flex-col h-full pt-[68px]">
            {/* Menu items section - scrollable if needed */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {links.map((link, idx) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-6 text-[21px] font-medium text-[#201515] hover:text-[#FF4F00] transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                  </Link>
                  {idx < links.length - 1 && (
                    <div className="border-b border-[#E7E5E4]" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom section - pinned */}
            <div className="border-t border-[#E7E5E4] px-6 py-6 bg-[#FFFDF9]">
              {/* Small links row */}
              <div className="flex items-center gap-6 mb-5">
                <Link
                  href="/developers"
                  className="text-sm font-medium text-[#6F6765] hover:text-[#201515] transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Documentation
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-[#6F6765] hover:text-[#201515] transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact sales
                </Link>
              </div>

              {/* Buttons stack */}
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-[16px] font-semibold text-[#201515] py-4 rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-[16px] font-semibold text-white py-4 rounded-full bg-[#FF4F00] hover:bg-[#E64700] hover:shadow-primary transition-all duration-200"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

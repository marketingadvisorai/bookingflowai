'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

const navLinks = [
  { label: 'Features', href: '/escapeboost/features' },
  { label: 'Pricing', href: '/escapeboost/pricing' },
  { label: 'Blog', href: '/escapeboost/blog' },
  { label: 'About', href: '/escapeboost/about' },
  { label: 'Contact', href: '/escapeboost/contact' },
];

export function EBNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[#E7E5E4] bg-[#FFFDF9]/95 backdrop-blur-xl shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <Link href="/escapeboost" className="flex items-center gap-2.5 text-[20px] font-bold text-[#201515] hover:opacity-90 transition-opacity duration-200 relative z-50">
            <span className="text-[#FF4F00]">🔥</span> EscapeBoost
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-semibold text-[#574E4C] hover:text-[#201515] transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF4F00] after:transition-all after:duration-200 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[14px] font-semibold text-[#413735] px-5 py-2.5 rounded-full hover:bg-black/5 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#FF4F00] text-[#FFFDF9] text-[14px] font-bold px-6 py-2.5 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3 relative z-50">
            <Link
              href="/signup"
              className="bg-[#FF4F00] text-[#FFFDF9] text-[14px] font-bold px-5 py-2.5 rounded-full hover:bg-[#E64700] transition-colors duration-200"
            >
              Sign up
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#201515] hover:bg-black/5 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={1.8} /> : <HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#FFFDF9] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col h-full pt-[72px]">
            <div className="flex-1 overflow-y-auto px-6 py-8">
              {navLinks.map((link, idx) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center py-6 text-[21px] font-semibold text-[#201515] hover:text-[#FF4F00] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                  {idx < navLinks.length - 1 && <div className="border-b border-[#E7E5E4]" />}
                </div>
              ))}
            </div>
            <div className="border-t border-[#E7E5E4] px-6 py-6 bg-[#FFFDF9]">
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-[16px] font-bold text-[#201515] py-4 rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-[16px] font-bold text-white py-4 rounded-full bg-[#FF4F00] hover:bg-[#E64700] hover:shadow-primary transition-all duration-200"
                >
                  Sign up free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

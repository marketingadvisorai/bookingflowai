'use client';

import { useState, useEffect } from 'react';
import styles from './HeroHeadlines.module.css';

interface Headline {
  label: string;
  headline: string;
  subheadline: string;
}

const headlines: Headline[] = [
  {
    label: 'BUILT FOR ESCAPE ROOMS & ENTERTAINMENT VENUES',
    headline: 'Fill every time slot without lifting a finger',
    subheadline:
      'Escape rooms, axe throwing, rage rooms, laser tag, VR arcades, trampoline parks, haunted attractions. BookingFlow handles your online bookings, phone calls, customer chat, and payments. Customers book in 47 seconds. You get paid upfront.',
  },
  {
    label: 'FOR MULTI-LOCATION ESCAPE ROOMS',
    headline: 'Manage 3 locations and 18 rooms from one dashboard',
    subheadline:
      'Built for escape room operators running multiple venues. See real-time availability across every location, every room, every time slot. Corporate groups book all 3 of your downtown locations in one checkout. Your staff stops playing calendar Tetris across different systems.',
  },
  {
    label: 'SWITCHING FROM FAREHARBOR?',
    headline: 'We migrated 127 venues in the last 6 months',
    subheadline:
      "Escape rooms, haunted attractions, axe throwing venues, and trampoline parks are leaving FareHarbor for one reason: our AI answers the phone and books appointments automatically. You stop paying staff to answer the same questions 40 times a week. FareHarbor can't do that.",
  },
  {
    label: 'BUILT FOR RAGE ROOMS & AXE THROWING',
    headline: 'Safety waivers signed before they walk in the door',
    subheadline:
      'Rage rooms, axe throwing, paintball, airsoft. Digital waivers collect signatures at booking. Your staff stops chasing people with clipboards. Insurance underwriters love it. Customers book their smash session at 11pm on a Tuesday and sign the waiver in 90 seconds.',
  },
  {
    label: 'FOR LASER TAG & TRAMPOLINE PARKS',
    headline: 'Birthday parties booked 6 weeks out, paid in full',
    subheadline:
      "Laser tag arenas, trampoline parks, go-kart tracks, mini golf courses, bowling alleys. Parents book the whole party online, pay the deposit, and get instant confirmation. No more \"I'll call you back on Monday\" emails that turn into no-shows costing you $280 per party.",
  },
  {
    label: 'FAREHARBOR CHARGES 6% PER BOOKING',
    headline: 'We charge $0. You keep 100% of your revenue.',
    subheadline:
      "FareHarbor takes 6% of every transaction. On a $50,000/month escape room, that's $3,000 a month in fees. BookingFlow costs $97/month flat. The math is simple. Plus our AI voice agent answers your phones 24/7. FareHarbor charges extra for that. We don't.",
  },
  {
    label: 'HAUNTED ATTRACTIONS & SEASONAL VENUES',
    headline: 'Sell out your October calendar by September 15th',
    subheadline:
      'Haunted houses, Halloween attractions, seasonal escape rooms. Time-based pricing charges more for Friday and Saturday nights. Early bird discounts fill your weekday slots. Our chatbot handles the October rush when you get 200 inquiries a day while your staff is setting up props.',
  },
  {
    label: 'FOR VR ARCADES & ENTERTAINMENT CENTERS',
    headline: 'Bowling lanes, VR bays, arcade time — one booking flow',
    subheadline:
      'Bowling alleys, VR arcades, paintball fields, go-kart tracks, mini golf. Customers reserve online, your AI handles phone bookings for corporate events, and walk-ins check real-time availability on your lobby iPad. Every channel syncs instantly. No more "let me check the book."',
  },
];

export function HeroHeadlines() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Rotation interval: ~75 seconds per headline (typing ~12s + pause 8s + fade 2s)
    const rotationInterval = setInterval(() => {
      setIsAnimating(false);
      // Fade out current, then switch after 500ms
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % headlines.length);
        setIsAnimating(true);
      }, 500);
    }, 75000);

    return () => clearInterval(rotationInterval);
  }, []);

  const current = headlines[currentIndex];

  return (
    <div className="max-w-3xl">
      {/* Orange upper label — fade transition */}
      <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
        <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
        <span
          className={`text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold transition-opacity duration-500 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {current.label}
        </span>
      </div>

      {/* Main headline — typewriter effect */}
      <h1
        className={`font-display text-[32px] sm:text-[44px] md:text-[56px] lg:text-[72px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515] ${
          isAnimating ? styles.typewriterActive : styles.typewriterInactive
        }`}
        style={
          {
            '--headline-length': current.headline.length,
          } as React.CSSProperties
        }
      >
        {current.headline}
      </h1>

      {/* Subheadline — fade transition */}
      <p
        className={`mt-6 sm:mt-8 text-[17px] sm:text-[18px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px] transition-opacity duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {current.subheadline}
      </p>

      {/* CTA buttons */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a
          href="/signup"
          className={`w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 ${styles.animatePulseGlow}`}
        >
          Start Free
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <a
          href="/features"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#201515] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#201515] focus:ring-offset-2"
        >
          See How It Works
        </a>
      </div>

      <p className="mt-5 sm:mt-6 text-[14px] font-medium text-[#93908C]">
        Free to start. No credit card required.
      </p>
    </div>
  );
}

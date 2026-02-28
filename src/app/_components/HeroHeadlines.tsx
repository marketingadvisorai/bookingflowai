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
    label: 'THE VENUE BOOKING PLATFORM',
    headline: 'Fill every time slot without lifting a finger',
    subheadline:
      'Escape rooms, axe throwing, smash rooms, laser tag, go-karts, mini golf. BookingFlow handles bookings, phone calls, and customer chat. Your customers book in under a minute. You get paid upfront.',
  },
  {
    label: 'BUILT FOR ESCAPE ROOMS',
    headline: 'Your 3 locations. One booking system. Zero headaches.',
    subheadline:
      'Multi-location escape rooms lose $3,200 a month to scheduling gaps. BookingFlow syncs every room across every location in real time. Corporate groups book 6 rooms at once. Your staff stops playing calendar Tetris.',
  },
  {
    label: 'AXE THROWING · SMASH ROOMS · RAGE ROOMS',
    headline: 'Saturday nights book out by Thursday morning',
    subheadline:
      'Your lanes and bays fill faster when customers can book at 11pm on a Tuesday. No waiting for a callback. No email back-and-forth. They pick a time, pay upfront, and show up ready to throw.',
  },
  {
    label: 'SWITCHING FROM FAREHARBOR?',
    headline: 'Same bookings. Half the fees. Twice the features.',
    subheadline:
      'FareHarbor takes a cut of every booking. BookingFlow charges a flat rate. Keep more of your revenue while getting AI chat, voice agents, and email follow-ups that FareHarbor simply does not offer.',
  },
  {
    label: 'LASER TAG · TRAMPOLINE PARKS · VR ARCADES',
    headline: 'Book in 47 seconds or they go to your competitor',
    subheadline:
      "82% of customers won't wait 2 hours for a booking confirmation. Our chatbot responds instantly, shows real-time availability across all your activities, and processes group payments on the spot.",
  },
  {
    label: 'HAUNTED ATTRACTIONS · PAINTBALL · GO-KARTS',
    headline: 'Peak season is 90 days. Every empty slot costs you.',
    subheadline:
      'Seasonal venues need to maximize every weekend. BookingFlow fills gaps with automated waitlists, last-minute deals, and an AI that upsells group packages. One haunted house filled 340 extra slots last October.',
  },
  {
    label: 'GET PAID BEFORE THEY SHOW UP',
    headline: 'No-shows cost you $18,000 a year. We fix that.',
    subheadline:
      'Collect deposits or full payment at booking through Stripe. Money hits your account immediately. Works for escape rooms, bowling alleys, mini golf courses, and every venue type in between. Refunds are automated.',
  },
  {
    label: 'MINI GOLF · BOWLING · ENTERTAINMENT CENTERS',
    headline: 'Manage 8 activities and 300 bookings from one screen',
    subheadline:
      'Birthday parties across 3 lanes, a corporate event in the VR room, and walk-ins at mini golf. All synced. All visible. Real-time dashboards show revenue per activity and peak hours so nothing gets double-booked.',
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

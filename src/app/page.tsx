'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Message01Icon,
  SmartPhone01Icon,
  Calendar03Icon,
  CreditCardIcon,
  BarChartIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';
import { HeroHeadlines } from '@/app/_components/HeroHeadlines';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      {/* Thin grid line below nav */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <Hero />
      {/* Thin grid line between Hero and Features */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <TabbedFeatures />
      {/* Thin grid line between Features and Stats */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <DarkStats />
      {/* Thin grid line between Stats and Showcase */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <ProductShowcase />
      {/* Thin grid line between Showcase and How It Works */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <HowItWorks />
      {/* Thin grid line between How It Works and Pricing */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <PricingPreview />
      {/* Thin grid line between Pricing and CTA */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <DarkCTA />
      {/* Thin grid line above footer */}
      <div className="w-full border-t border-[#E7E5E4]" />
      <MarketingFooter />
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-36 pb-16 sm:pb-20 lg:pb-32">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left — Text content */}
          <HeroHeadlines />

          {/* Right — Hero Illustration with animations */}
          <div className="relative lg:-mr-8 xl:-mr-16">
            <div className="hero-illustration-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bookingflow-venue-booking-platform-hero.avif"
                alt="BookingFlow venue booking platform — automated scheduling and time slot management"
                width={580}
                height={520}
                className="w-full h-auto max-w-none hero-float"
                loading="eager"
                fetchPriority="high"
              />
            </div>

            {/* Subtle animated glow behind illustration */}
            <div className="absolute inset-0 -z-10 hero-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Tabbed Features ─── */
const tabs = [
  {
    id: 'chatbot',
    label: 'Chatbot',
    icon: Message01Icon,
    title: 'Your 24/7 booking assistant',
    desc: 'The chatbot sits on your website, answers customer questions, checks availability, and walks visitors through booking. No staff needed.',
    mockup: 'chat',
  },
  {
    id: 'voice',
    label: 'Voice Agent',
    icon: SmartPhone01Icon,
    title: 'Never miss another phone call',
    desc: 'Your voice agent picks up every call, answers questions about your venue, and books appointments over the phone automatically.',
    mockup: 'phone',
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    icon: Calendar03Icon,
    title: 'Real-time availability, zero conflicts',
    desc: 'Manage all your rooms, time slots, and staff from one place. The system prevents double bookings and updates availability instantly.',
    mockup: 'calendar',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCardIcon,
    title: 'Get paid upfront through Stripe',
    desc: 'Collect deposits or full payments at the moment of booking. Money goes directly to your Stripe account. Refunds and cancellations are built in.',
    mockup: 'payments',
  },
];

function TabbedFeatures() {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Label */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
          <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">
            Your complete booking toolkit
          </span>
        </div>
        <h2 className="font-display text-[24px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.92] tracking-[-0.02em] text-[#201515] max-w-3xl">
          Everything your venue needs in one place
        </h2>

        {/* Tab bar - horizontal scroll on mobile */}
        <div className="mt-10 sm:mt-12 lg:mt-14 -mx-4 sm:-mx-6 lg:mx-0">
          <div className="flex gap-0 border-b-2 border-[#E7E5E4] overflow-x-auto px-4 sm:px-6 lg:px-0 scrollbar-hide">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={
                  'flex items-center gap-2.5 px-5 sm:px-6 py-4 min-h-[44px] text-[14px] sm:text-[15px] font-semibold whitespace-nowrap transition-all duration-300 border-b-2 -mb-[2px] ' +
                  (i === active
                    ? 'border-[#FF4F00] text-[#201515]'
                    : 'border-transparent text-[#6F6765] hover:text-[#201515] hover:border-[#E7E5E4]')
                }
              >
                <HugeiconsIcon icon={t.icon} className="h-5 w-5 transition-transform duration-200 hover:scale-110" strokeWidth={1.8} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div key={active} className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h3 className="font-display text-[26px] sm:text-[32px] lg:text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-[#201515]">
              {tab.title}
            </h3>
            <p className="mt-5 sm:mt-6 text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7]">{tab.desc}</p>
            <Link
              href="/features"
              className="mt-7 sm:mt-8 inline-flex items-center text-[#FF4F00] text-[15px] font-bold hover:gap-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
            >
              Learn more <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={1.8} />
            </Link>
          </div>
          <div>
            <TabMockup type={tab.mockup} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TabMockup({ type }: { type: string }) {
  if (type === 'chat') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E7E5E4]">
          <div className="h-9 w-9 rounded-full bg-[#FF4F00] flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={Message01Icon} className="h-4 w-4 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#201515]">BookingFlow Assistant</p>
            <p className="text-xs font-medium text-emerald-500">● Online</p>
          </div>
        </div>
        <div className="space-y-3.5">
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-md bg-[#FF4F00] px-4 py-3 text-sm text-white max-w-[220px] shadow-sm">
              Do you have rooms available Saturday at 3pm?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-md bg-[#F8F5F0] px-4 py-3 text-sm text-[#201515] max-w-[260px]">
              Yes! The Vault and Mystery Manor are open at 3:00 PM. Want to book one?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-md bg-[#FF4F00] px-4 py-3 text-sm text-white max-w-[180px] shadow-sm">
              The Vault, 4 people.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-md bg-[#F8F5F0] px-4 py-3 text-sm text-[#201515] max-w-[240px]">
              The Vault for 4 at 3:00 PM Saturday. Setting up your booking now.
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <div className="flex-1 h-11 rounded-full bg-[#F8F5F0] px-5 flex items-center text-sm text-[#93908C]">Type a message...</div>
          <button className="h-11 w-11 rounded-full bg-[#FF4F00] flex items-center justify-center hover:bg-[#E64700] hover:scale-105 transition-all duration-200">
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-white" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    );
  }

  if (type === 'phone') {
    return (
      <div className="rounded-2xl bg-[#201515] p-6 sm:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <div className="h-11 w-11 rounded-full bg-[#FF4F00]/20 flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={SmartPhone01Icon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[#F8F4F0] font-semibold text-sm">Active Call</p>
            <p className="text-[#F8F4F0]/50 text-xs font-medium">+1 (555) 234-5678</p>
          </div>
          <div className="ml-auto text-xs font-mono font-bold text-[#FF4F00]">02:34</div>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { who: 'caller', text: 'Hi, do you have any rooms open Friday night?' },
            { who: 'agent', text: 'We have The Vault at 7 PM and 9 PM. Would either work for your group?' },
            { who: 'caller', text: 'The 7 PM slot. Six people.' },
            { who: 'agent', text: 'Booked. The Vault, Friday at 7 PM for 6. A confirmation will be texted to this number.' },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.who === 'caller' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-3 py-2 text-xs max-w-[200px] ${
                m.who === 'caller'
                  ? 'bg-[#F8F4F0]/10 text-[#F8F4F0]/80'
                  : 'bg-[#FF4F00]/15 text-[#FF4F00]'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {/* Waveform */}
        <div className="flex items-center gap-1 h-8 justify-center">
          {[3, 5, 8, 4, 7, 10, 6, 9, 5, 7, 4, 8, 6, 3, 7, 5, 9, 4, 6, 8].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-[#FF4F00]/40"
              style={{ height: `${h * 3}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'calendar') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-base font-bold text-[#201515]">March 2026</h4>
          <div className="flex gap-2">
            <button className="h-8 w-8 rounded-lg border border-[#E7E5E4] flex items-center justify-center text-[#6F6765] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors duration-200 text-sm">&larr;</button>
            <button className="h-8 w-8 rounded-lg border border-[#E7E5E4] flex items-center justify-center text-[#6F6765] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors duration-200 text-sm">&rarr;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-[#93908C] font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 6 + 1;
            if (day < 1 || day > 31) return <div key={i} />;
            const booked = [3, 7, 12, 15, 21, 24, 28].includes(day);
            const partial = [5, 10, 18, 26].includes(day);
            const today = day === 14;
            return (
              <div
                key={i}
                className={`py-1.5 rounded-lg transition-colors ${
                  today ? 'bg-[#FF4F00] text-white font-semibold' :
                  booked ? 'bg-[#FF4F00]/10 text-[#FF4F00] font-medium' :
                  partial ? 'bg-[#FFF3E6] text-[#574E4C]' :
                  'text-[#201515] hover:bg-[#F8F5F0]'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-[#E7E5E4] space-y-2">
          {[
            { time: '2:00 PM', room: 'The Vault', people: 4, color: 'bg-[#FF4F00]' },
            { time: '4:00 PM', room: 'Mystery Manor', people: 6, color: 'bg-[#2B2358]' },
            { time: '7:00 PM', room: 'The Vault', people: 8, color: 'bg-emerald-500' },
          ].map((slot) => (
            <div key={slot.time} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${slot.color}`} />
              <span className="text-xs text-[#201515] font-medium">{slot.time}</span>
              <span className="text-xs text-[#6F6765]">{slot.room}</span>
              <span className="ml-auto text-xs text-[#93908C]">{slot.people} ppl</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // payments
  return (
    <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F6765]">This Week</p>
          <p className="text-3xl font-bold text-[#201515] mt-1">$3,240</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">+18% vs last week</div>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Sarah M.', room: 'The Vault', amount: '$120', status: 'Paid', time: '2h ago' },
          { name: 'James K.', room: 'Mystery Manor', amount: '$180', status: 'Paid', time: '4h ago' },
          { name: 'Team Outing', room: 'The Vault', amount: '$480', status: 'Deposit', time: '6h ago' },
          { name: 'Lisa R.', room: 'Mystery Manor', amount: '$90', status: 'Paid', time: '1d ago' },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center gap-3 py-2 border-b border-[#E7E5E4]/50 last:border-0">
            <div className="h-8 w-8 rounded-full bg-[#F8F5F0] flex items-center justify-center text-xs font-medium text-[#201515]">
              {tx.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#201515] truncate">{tx.name}</p>
              <p className="text-xs text-[#93908C]">{tx.room}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#201515]">{tx.amount}</p>
              <p className="text-xs text-emerald-500">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dark Stats ─── */
function DarkStats() {
  return (
    <section className="bg-[#201515] py-16 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-24 items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">
                Real results
              </span>
            </div>
            <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.92] tracking-[-0.02em] text-[#F8F4F0]">
              No hype.<br />Just bookings.
            </h2>
            <p className="mt-6 sm:mt-7 text-[17px] sm:text-[18px] text-[#F8F4F0]/70 leading-[1.7] max-w-[460px]">
              Venues using BookingFlow fill more time slots, answer every call, and collect payment upfront. The numbers tell the story.
            </p>
          </div>

          <div className="space-y-10">
            {/* Big stat */}
            <div className="border-l-4 border-[#FF4F00] pl-7">
              <p className="text-[72px] lg:text-[88px] font-bold text-[#F8F4F0] leading-none tracking-tighter">
                40%
              </p>
              <p className="mt-3 text-[16px] font-medium text-[#F8F4F0]/60 leading-[1.5]">
                Average revenue increase in the first 60 days
              </p>
            </div>

            {/* SVG growth chart */}
            <div className="bg-[#F8F4F0]/5 rounded-2xl p-6 border border-[#F8F4F0]/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#F8F4F0]/40">Booking volume over time</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#FF4F00]" />
                  <span className="text-xs text-[#F8F4F0]/40">With BookingFlow</span>
                </div>
              </div>
              <svg viewBox="0 0 400 120" className="w-full" fill="none">
                {/* Grid lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#F8F4F0" strokeOpacity="0.05" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#F8F4F0" strokeOpacity="0.05" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="#F8F4F0" strokeOpacity="0.05" />
                {/* Growth curve */}
                <path
                  d="M0,100 C40,95 80,90 120,80 C160,70 200,55 240,40 C280,28 320,18 360,12 L400,8"
                  stroke="#FF4F00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Area fill */}
                <path
                  d="M0,100 C40,95 80,90 120,80 C160,70 200,55 240,40 C280,28 320,18 360,12 L400,8 L400,120 L0,120 Z"
                  fill="url(#chartGradient)"
                />
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4F00" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FF4F00" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between text-xs text-[#F8F4F0]/30 mt-2">
                <span>Month 1</span>
                <span>Month 3</span>
                <span>Month 6</span>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="border-l-4 border-[#FF4F00]/40 pl-6">
                <p className="text-[40px] font-bold text-[#F8F4F0] leading-none">0</p>
                <p className="mt-2 text-[14px] font-medium text-[#F8F4F0]/60">Missed calls</p>
              </div>
              <div className="border-l-4 border-[#FF4F00]/40 pl-6">
                <p className="text-[40px] font-bold text-[#F8F4F0] leading-none">10 min</p>
                <p className="mt-2 text-[14px] font-medium text-[#F8F4F0]/60">Setup to live</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Product Showcase (alternating with left border) ─── */
const showcases = [
  {
    label: 'Email Marketing',
    title: 'Automated campaigns that bring customers back',
    desc: 'Booking confirmations, review requests, birthday offers, and re-engagement campaigns run automatically. No manual work required.',
    points: ['Post-booking follow-ups', 'Review request sequences', 'Birthday and anniversary campaigns'],
    visual: 'email',
  },
  {
    label: 'Analytics',
    title: 'See exactly what drives revenue',
    desc: 'One dashboard shows bookings, revenue, peak times, and room performance. Make decisions based on data instead of guesses.',
    points: ['Revenue tracking by room and time', 'Peak hour identification', 'Booking conversion insights'],
    visual: 'chart',
  },
];

function ProductShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 space-y-16 sm:space-y-20 lg:space-y-36">
        {showcases.map((s, i) => (
          <div key={s.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-8 sm:gap-8 sm:gap-10 lg:gap-20 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
            <div className={`border-l-2 border-[#FF4F00]/20 pl-6 sm:pl-8 ${i % 2 === 1 ? 'lg:[direction:ltr]' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">{s.label}</span>
              </div>
              <h2 className="font-display text-[22px] sm:text-[28px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
                {s.title}
              </h2>
              <p className="mt-5 text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7]">{s.desc}</p>
              <ul className="mt-6 sm:mt-7 space-y-3 sm:space-y-3.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
              {s.visual === 'email' ? <EmailMockup /> : <ChartMockup />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmailMockup() {
  return (
    <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E7E5E4]">
        <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
        <div>
          <p className="text-sm font-medium text-[#201515]">Automated Sequences</p>
          <p className="text-xs text-[#93908C]">3 active campaigns</p>
        </div>
      </div>
      {[
        { name: 'Post-Booking Follow-up', sent: 142, opened: '68%', status: 'Active' },
        { name: 'Review Request', sent: 89, opened: '52%', status: 'Active' },
        { name: 'Re-engagement', sent: 234, opened: '34%', status: 'Active' },
      ].map((c) => (
        <div key={c.name} className="flex items-center gap-3 py-3 border-b border-[#E7E5E4]/50 last:border-0">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#201515]">{c.name}</p>
            <p className="text-xs text-[#93908C]">{c.sent} sent, {c.opened} opened</p>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{c.status}</span>
        </div>
      ))}
    </div>
  );
}

function ChartMockup() {
  return (
    <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#6F6765]">Monthly Revenue</p>
          <p className="text-2xl font-semibold text-[#201515]">$12,480</p>
        </div>
        <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+23%</div>
      </div>
      <div className="flex items-end gap-2 h-32">
        {[40, 55, 45, 65, 50, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-[#FF4F00]/20 hover:bg-[#FF4F00]/40 transition-colors"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#93908C]">
        <span>Jan</span><span>Jun</span><span>Dec</span>
      </div>
    </div>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Connect your venue', desc: 'Add your rooms, time slots, pricing, and policies. Takes about 10 minutes.' },
    { num: '02', title: 'Embed the widget', desc: 'Copy one snippet of code into your website. Works on WordPress, Squarespace, Wix, or any platform.' },
    { num: '03', title: 'Start taking bookings', desc: 'Customers book online or by phone. You get paid upfront through Stripe. That is it.' },
  ];

  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-12 lg:mb-20">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">How it works</span>
          </div>
          <h2 className="font-display text-[24px] sm:text-[32px] lg:text-[52px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515]">
            Live in 10 minutes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-8">
          {steps.map((s) => (
            <div key={s.num} className="relative">
              <span className="text-[56px] sm:text-[64px] font-semibold text-[#FF4F00]/10 leading-none block">{s.num}</span>
              <h3 className="mt-2 text-[17px] sm:text-[18px] font-semibold text-[#201515]">{s.title}</h3>
              <p className="mt-2 text-[15px] text-[#6F6765] leading-[1.65]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Preview ─── */
const plans = [
  {
    name: 'Free', price: '$0', period: '/mo',
    desc: '150 bookings/mo, 1.9% customer fee',
    features: ['Online booking widget', 'Email confirmations', 'Stripe payments', 'Email support'],
    highlighted: false, cta: 'Start Free',
  },
  {
    name: 'Pro', price: '$49', period: '/mo',
    desc: 'Unlimited bookings, 1.5% customer fee',
    badge: 'Popular',
    features: ['AI chatbot (24/7)', 'Unlimited bookings', 'Analytics dashboard', 'Cart abandonment recovery', 'Priority support'],
    highlighted: true, cta: 'Start Free Trial',
  },
  {
    name: 'Business', price: '$99', period: '/mo',
    desc: 'Unlimited bookings, 1.2% customer fee',
    features: ['Everything in Pro', 'AI voice agent', 'Email marketing', 'API access', 'Custom branding', 'Priority support'],
    highlighted: false, cta: 'Start Free Trial',
  },
];

function PricingPreview() {
  // Reorder for mobile: Pro first (highlighted), then Free, then Business
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.highlighted) return -1;
    if (b.highlighted) return 1;
    return 0;
  });

  return (
    <section className="py-16 sm:py-20 lg:py-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-16 lg:mb-20">
          <div className="flex items-center gap-2.5 justify-center mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Pricing</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515]">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.7] text-[#574E4C] max-w-[520px] mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Mobile: show sorted (Pro first), Desktop: original order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {(typeof window !== 'undefined' && window.innerWidth < 768 ? sortedPlans : plans).map((plan) => (
            <div
              key={plan.name}
              className={
                'relative flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 ' +
                (plan.highlighted
                  ? 'border-2 border-[#FF4F00] bg-white shadow-[0_16px_48px_rgba(255,79,0,0.12)] md:scale-[1.04] z-10'
                  : 'border border-[#E7E5E4]/60 bg-white hover:shadow-card hover:-translate-y-1 hover:border-[#E7E5E4]')
              }
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-8 rounded-full bg-[#FF4F00] px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
                  {plan.badge}
                </div>
              )}
              <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#6F6765]">{plan.name}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[48px] sm:text-[56px] font-bold text-[#201515] leading-none tracking-tight">{plan.price}</span>
                <span className="text-[16px] sm:text-[18px] text-[#6F6765] font-semibold">{plan.period}</span>
              </div>
              <p className="mt-4 text-[15px] text-[#6F6765] leading-[1.6] font-medium">{plan.desc}</p>

              <ul className="mt-8 sm:mt-9 flex-1 space-y-3.5 sm:space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 flex-shrink-0 text-[#FF4F00] mt-0.5" strokeWidth={1.8} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 sm:mt-10">
                <Link
                  href="/signup"
                  className={
                    'block w-full text-center text-[15px] font-bold py-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
                    (plan.highlighted
                      ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] focus:ring-[#FF4F00]'
                      : 'bg-transparent text-[#201515] border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] focus:ring-[#201515]')
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] sm:text-sm font-medium text-[#93908C]">
          Service fees are charged to customers, not you. You pay $0 in transaction fees.{' '}
          <Link href="/pricing" className="text-[#FF4F00] underline hover:no-underline">See full pricing</Link>
        </p>
      </div>
    </section>
  );
}

/* ─── Dark CTA ─── */
function DarkCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Ready to fill every time slot?
        </h2>
        <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Setup takes 10 minutes. The free plan costs nothing. Start today.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515] animate-pulse-glow"
          >
            Start Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#F8F4F0] text-[16px] sm:text-[17px] font-medium border-2 border-[#F8F4F0]/30 px-8 py-4 min-h-[44px] rounded-full hover:bg-[#F8F4F0] hover:text-[#201515] hover:border-[#F8F4F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F8F4F0] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

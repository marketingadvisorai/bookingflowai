import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <Steps />
      <Timeline />
      <DarkCTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-20 lg:pt-36 pb-12 sm:pb-16 lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center gap-2.5 mb-5 sm:mb-7 justify-center">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">How It Works</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            From signup to first booking in 10 minutes
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px] mx-auto">
            No complicated setup. No training videos. Just a simple process that gets you live fast.
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: '01',
    title: 'Sign up',
    subtitle: 'Free, 2 minutes',
    description: 'Create your account with an email and password or sign in with Google. No credit card required.',
    details: [
      'Enter your venue name and basic info',
      'Verify your email address',
      'Choose your plan (start with Free)',
    ],
  },
  {
    number: '02',
    title: 'Set up your venue',
    subtitle: 'Rooms, pricing, schedules',
    description: 'Add your rooms or experiences. Set pricing, capacity, and operating hours. Takes about 5 minutes.',
    details: [
      'Add each room with name, description, and photos',
      'Set pricing (flat rate, per person, or deposits)',
      'Configure your weekly schedule and time slots',
      'Set buffer time between bookings',
    ],
  },
  {
    number: '03',
    title: 'Embed the widget',
    subtitle: 'Copy one line of code',
    description: 'Paste a single code snippet into your website. Works on WordPress, Squarespace, Wix, or any platform.',
    details: [
      'Copy the embed code from your dashboard',
      'Paste it into your website (usually in a footer or custom HTML block)',
      'Widget appears instantly on your site',
      'Customize colors to match your brand (optional)',
    ],
  },
  {
    number: '04',
    title: 'Customers book online 24/7',
    subtitle: 'No staff needed',
    description: 'Your website now accepts bookings around the clock. Customers see real-time availability and book in under a minute.',
    details: [
      'Customers select date, time, and room',
      'Widget shows only available slots',
      'They pay upfront via Stripe',
      'Booking confirmation sent automatically',
    ],
  },
  {
    number: '05',
    title: 'AI handles customer questions',
    subtitle: 'Chat and phone support',
    description: 'The AI chatbot answers questions on your website. The voice agent picks up phone calls and books appointments.',
    details: [
      'Chatbot responds to FAQs instantly',
      'Voice agent answers every call (Pro+ plan)',
      'Both check availability in real time',
      'Transfer to staff only when needed',
    ],
  },
  {
    number: '06',
    title: 'Manage everything from one dashboard',
    subtitle: 'Bookings, customers, analytics',
    description: 'See all your bookings, process refunds, update schedules, and track revenue from your dashboard.',
    details: [
      'View bookings by day, week, or month',
      'Check in customers when they arrive',
      'Process cancellations and refunds',
      'Export reports for accounting',
    ],
  },
  {
    number: '07',
    title: 'Get paid directly',
    subtitle: 'Stripe account',
    description: 'Money goes straight to your Stripe account. Get paid on Stripe\'s schedule (usually 2 business days).',
    details: [
      'Connect your Stripe account (or create one)',
      'Customers pay at checkout',
      'Service fee deducted automatically',
      'You receive payouts from Stripe',
    ],
  },
];

function Steps() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative"
            >
              {/* Connecting line (except for last step) */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[23px] top-[60px] bottom-[-60px] w-[2px] bg-gradient-to-b from-[#FF4F00]/40 to-[#FF4F00]/10 hidden sm:block" />
              )}

              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-10">
                {/* Number circle */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-[#FF4F00] flex items-center justify-center shadow-md relative z-10">
                    <span className="text-white font-bold text-[17px]">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 hover:border-[#FF4F00]/30 hover:shadow-card transition-all duration-300">
                  <div className="flex items-baseline gap-3 mb-3">
                    <h2 className="text-[22px] sm:text-[26px] lg:text-[32px] font-semibold text-[#201515] leading-[1.1]">
                      {step.title}
                    </h2>
                    <span className="text-[14px] text-[#93908C] font-medium">{step.subtitle}</span>
                  </div>
                  <p className="text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7] mb-5">
                    {step.description}
                  </p>
                  <ul className="space-y-2.5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3 text-[15px] text-[#6F6765] leading-[1.6]">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-[#FF4F00] flex-shrink-0 mt-0.5 stroke-[2.5]" strokeWidth={1.8} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Your first day with BookingFlow
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7]">
            Here's what actually happens when you sign up.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-[#FF4F00]/20 hidden sm:block" />

          <div className="space-y-10 sm:space-y-12">
            <TimelineItem time="0:00" title="Sign up" desc="Create account, verify email." />
            <TimelineItem time="0:02" title="Dashboard tour" desc="Quick walkthrough of the interface (skip if you want)." />
            <TimelineItem time="0:05" title="Add first room" desc="Name, description, pricing. Photos optional for now." />
            <TimelineItem time="0:08" title="Set schedule" desc="Choose operating hours for each day of the week." />
            <TimelineItem time="0:10" title="Copy embed code" desc="Paste into your website. Widget goes live." />
            <TimelineItem time="0:12" title="Connect Stripe" desc="Link your Stripe account (or create one in 5 min)." />
            <TimelineItem time="0:15" title="Test booking" desc="Run a test booking to see the customer experience." />
            <TimelineItem time="0:20" title="First real booking" desc="Your widget is live. Customers can book." />
          </div>
        </div>

        <div className="mt-14 sm:mt-16 text-center">
          <p className="text-[15px] font-medium text-[#6F6765] mb-6">
            Most venues are live and taking bookings within 20 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200"
          >
            Start Your Setup Now <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ time, title, desc }: { time: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5 sm:gap-6">
      <div className="flex-shrink-0 relative z-10">
        <div className="h-10 w-10 rounded-full bg-white border-2 border-[#FF4F00] flex items-center justify-center">
          <HugeiconsIcon icon={CircleIcon} className="h-3 w-3 fill-[#FF4F00] text-[#FF4F00]" strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[13px] font-mono font-bold text-[#FF4F00]">{time}</span>
          <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#201515]">{title}</h3>
        </div>
        <p className="text-[15px] text-[#6F6765] leading-[1.6]">{desc}</p>
      </div>
    </div>
  );
}

function DarkCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Ready to get started?
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Create your account and start taking bookings in the next 10 minutes.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Start Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
          <Link
            href="/features"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#F8F4F0] text-[16px] sm:text-[17px] font-medium border-2 border-[#F8F4F0]/30 px-8 py-4 min-h-[44px] rounded-full hover:bg-[#F8F4F0] hover:text-[#201515] hover:border-[#F8F4F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F8F4F0] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            View All Features
          </Link>
        </div>
      </div>
    </section>
  );
}

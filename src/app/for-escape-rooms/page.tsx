import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Calendar03Icon,
  CreditCardIcon,
  UserGroupIcon,
  FlashIcon,
  BarChartIcon,
  Mail01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  SmartPhone01Icon,
  Globe02Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Escape Room Booking Software | BookingFlow',
  description: 'Purpose-built booking software for escape rooms. Real-time availability, AI phone agents, group bookings, and a widget that embeds on any website. Start free.',
  openGraph: {
    title: 'Escape Room Booking Software | BookingFlow',
    description: 'Purpose-built booking software for escape rooms. Real-time availability, AI phone agents, and a widget that works on any website.',
  },
};

export default function ForEscapeRoomsPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <WhyEscapeRooms />
      <Features />
      <UseCases />
      <Testimonials />
      <DarkCTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">For Escape Rooms</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            Booking software built for escape rooms
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px]">
            Fill more time slots, answer every phone call, and let customers book 24/7. Built specifically for how escape rooms operate.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Start Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" strokeWidth={1.8} />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#201515] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#201515] focus:ring-offset-2"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-5 sm:mt-6 text-[14px] font-medium text-[#93908C]">Free plan available. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}

const escapeRoomChallenges = [
  {
    stat: '30-40%',
    label: 'of escape room bookings come from phone calls',
    detail: 'Miss a call, lose $150-300 in revenue.',
  },
  {
    stat: '60%+',
    label: 'of customers book on their phones',
    detail: 'Your booking page needs to be fast and mobile-first.',
  },
  {
    stat: '15-20%',
    label: 'of bookings are abandoned at checkout',
    detail: 'Automated recovery emails bring them back.',
  },
];

function WhyEscapeRooms() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            We know the escape room business
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            These numbers shape everything we build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {escapeRoomChallenges.map((item) => (
            <div
              key={item.stat}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 text-center hover:border-[#FF4F00]/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <p className="text-[40px] sm:text-[48px] font-bold text-[#FF4F00] leading-[1]">{item.stat}</p>
              <p className="mt-3 text-[16px] sm:text-[17px] font-semibold text-[#201515] leading-[1.4]">{item.label}</p>
              <p className="mt-2 text-[14px] text-[#6F6765] leading-[1.6]">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Calendar03Icon,
    title: 'Room-based scheduling',
    description: 'Set unique time slots, buffer times, and capacity for each room. Block dates for maintenance or private events. Your calendar stays accurate across every channel.',
  },
  {
    icon: UserGroupIcon,
    title: 'Group and private bookings',
    description: 'Let customers book the whole room or join a public session. Handle corporate team-building events with custom pricing and deposit requirements.',
  },
  {
    icon: CreditCardIcon,
    title: 'Flexible payments',
    description: 'Collect full payment or deposits upfront. Sell gift vouchers and promo codes. Process refunds from your dashboard in two clicks.',
  },
  {
    icon: FlashIcon,
    title: 'AI phone agent',
    description: 'Answers every call, day and night. Books rooms, explains difficulty levels, handles cancellations. Two missed calls recovered per week pays for the entire platform.',
  },
  {
    icon: SmartPhone01Icon,
    title: 'AI chatbot',
    description: 'Lives on your website. Answers questions about rooms, pricing, parking, and group sizes. Guides customers to the right booking without staff involvement.',
  },
  {
    icon: Globe02Icon,
    title: 'Embeddable widget',
    description: 'One line of code on your website. Works on WordPress, Squarespace, Wix, or any custom site. Fully responsive and matches your branding.',
  },
  {
    icon: BarChartIcon,
    title: 'Revenue analytics',
    description: 'See which rooms make the most money. Track peak hours, slow days, and booking patterns. Know exactly where to focus your marketing spend.',
  },
  {
    icon: Mail01Icon,
    title: 'Automated emails',
    description: 'Confirmation, reminders, review requests, and re-engagement campaigns. Bring past customers back without lifting a finger.',
  },
];

function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Everything an escape room needs
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            Replace your stack of disconnected tools with one platform that actually understands your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-7 hover:border-[#FF4F00]/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-[#FF4F00] flex items-center justify-center mb-5 shadow-md">
                <HugeiconsIcon icon={feature.icon} className="h-6 w-6 text-white" strokeWidth={1.8} />
              </div>
              <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#201515] leading-[1.3] mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[#6F6765] leading-[1.65]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const useCases = [
  {
    venue: 'Single-location escape room',
    challenge: 'Owner answering phones between games. Missing calls during busy weekends. No time for marketing.',
    solution: 'AI voice agent handles all phone bookings. Widget on website converts visitors 24/7. Automated emails bring past customers back.',
    result: '35% more bookings in the first month.',
  },
  {
    venue: 'Multi-room escape room',
    challenge: 'Managing 6 rooms with different schedules. Corporate groups need custom pricing. Staff spending hours on admin.',
    solution: 'Each room has its own schedule and capacity settings. Corporate booking flow with deposits. Dashboard shows all rooms at a glance.',
    result: 'Staff saves 8+ hours per week on booking admin.',
  },
  {
    venue: 'Franchise escape room',
    challenge: 'Inconsistent booking experience across locations. No centralized analytics. Each location using different tools.',
    solution: 'One platform for all locations. Standardized booking widget. Revenue analytics by location, room, and time slot.',
    result: 'Consistent 4.8-star booking experience across all locations.',
  },
];

function UseCases() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            How escape rooms use BookingFlow
          </h2>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {useCases.map((useCase, idx) => (
            <div
              key={useCase.venue}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 lg:p-10 shadow-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-[#FF4F00] flex items-center justify-center text-white font-bold text-[17px]">
                  {idx + 1}
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#201515]">{useCase.venue}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Challenge</p>
                  <p className="text-[15px] text-[#574E4C] leading-[1.65]">{useCase.challenge}</p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Solution</p>
                  <p className="text-[15px] text-[#574E4C] leading-[1.65]">{useCase.solution}</p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Result</p>
                  <p className="text-[15px] font-semibold text-[#FF4F00] leading-[1.65]">{useCase.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: 'We switched from Resova and immediately noticed the difference. Customers actually complete their bookings now instead of abandoning halfway through.',
    name: 'Escape room owner',
    location: 'Austin, TX',
  },
  {
    quote: 'The AI phone agent is a game changer. We were missing 10-15 calls a week during peak hours. Now every single one gets answered.',
    name: 'Escape room manager',
    location: 'Chicago, IL',
  },
];

function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            What escape room owners say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 hover:border-[#FF4F00]/30 hover:shadow-card transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FF4F00] text-[18px]">★</span>
                ))}
              </div>
              <p className="text-[16px] text-[#574E4C] leading-[1.7] italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 pt-4 border-t border-[#E7E5E4]/60">
                <p className="text-[15px] font-semibold text-[#201515]">{t.name}</p>
                <p className="text-[14px] text-[#93908C]">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Stop losing bookings to missed calls
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Start free. Add your rooms. Embed the widget. You are live in 10 minutes.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
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

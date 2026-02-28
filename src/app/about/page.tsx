import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, FlashIcon, FavouriteIcon, Shield01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata = { title: 'About | BookingFlow' };

const values = [
  {
    icon: FlashIcon, title: 'Speed over complexity',
    desc: 'Every feature should be live in minutes, not weeks. We build tools that work out of the box so you can focus on your venue, not on software.',
  },
  {
    icon: FavouriteIcon, title: 'Built for venues, not developers',
    desc: 'We design for the person running the front desk, not the person writing code. If it needs a manual, we have not finished building it.',
  },
  {
    icon: Shield01Icon, title: 'Honest, transparent pricing',
    desc: 'No hidden fees, no surprise charges, no "contact us for pricing" games. You see exactly what you pay and what you get.',
  },
  {
    icon: UserGroupIcon, title: 'Your success is our success',
    desc: 'When your venue fills more time slots and makes more revenue, we have done our job. Every decision we make starts with that goal.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      {/* Mission Hero */}
      <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">About BookingFlow</span>
            </div>
            <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
              We build the tools venues need to thrive
            </h1>
            <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[620px]">
              BookingFlow started with a simple observation: venues spend too much time managing bookings and not enough time creating great experiences. We set out to fix that.
            </p>
          </div>
        </div>
      </section>

      {/* Story with left border accent */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <div className="border-l-2 border-[#FF4F00]/20 pl-6 sm:pl-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Our Story</span>
              </div>
              <h2 className="font-display text-[26px] sm:text-[32px] lg:text-[40px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515]">
                The problem we saw
              </h2>
              <div className="mt-6 space-y-4 text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7]">
                <p>
                  Escape rooms, entertainment venues, and restaurants were using five or six different tools just to handle bookings. One for the website widget, another for phone calls, another for email, another for payments.
                </p>
                <p>
                  Most of those tools were built for generic businesses. None of them understood the specific needs of venues that sell time slots to groups of people.
                </p>
                <p>
                  We built BookingFlow as the one platform that handles it all. Online bookings, phone calls, customer chat, email follow-ups, and payments. Built specifically for venues.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#E7E5E4]/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
              <div className="space-y-6">
                <div className="border-l-2 border-[#FF4F00] pl-5">
                  <p className="text-[48px] font-medium text-[#FF4F00] leading-none">5+</p>
                  <p className="mt-2 text-sm text-[#6F6765]">Tools replaced by one platform</p>
                </div>
                <div className="border-t border-[#E7E5E4]" />
                <div className="border-l-2 border-[#FF4F00]/40 pl-5">
                  <p className="text-[48px] font-medium text-[#FF4F00] leading-none">10</p>
                  <p className="mt-2 text-sm text-[#6F6765]">Minutes to go live</p>
                </div>
                <div className="border-t border-[#E7E5E4]" />
                <div className="border-l-2 border-[#FF4F00]/40 pl-5">
                  <p className="text-[48px] font-medium text-[#FF4F00] leading-none">24/7</p>
                  <p className="mt-2 text-sm text-[#6F6765]">Handling bookings and calls</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-12 lg:mb-20">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Our Values</span>
            </div>
            <h2 className="font-display text-[24px] sm:text-[32px] lg:text-[52px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515]">
              What we believe
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 sm:p-8 border border-[#E7E5E4]/60 hover:shadow-card hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF4F00]/10 mb-5">
                  <HugeiconsIcon icon={v.icon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={2} />
                </div>
                <h3 className="text-[18px] font-semibold text-[#201515] mb-2">{v.title}</h3>
                <p className="text-[15px] text-[#6F6765] leading-[1.6]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Vision */}
      <section className="bg-[#201515] py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10 text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Our Vision</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[38px] lg:text-[48px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            A world where every venue fills every time slot
          </h2>
          <p className="mt-6 text-[16px] sm:text-[17px] text-[#F8F4F0]/60 leading-[1.7]">
            We are building toward a future where venue owners spend zero time on booking logistics and 100% of their time creating memorable experiences.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Join the venues using BookingFlow
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
            Free to start. See why growing venues trust BookingFlow.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Get Started Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { EBLayout } from '../_components/eb-layout';

export const metadata: Metadata = {
  title: 'About — EscapeBoost',
  description: 'Built by marketers who have worked with 50+ escape rooms. We know the industry because we live in it.',
};

const values = [
  {
    title: 'Escape rooms are special',
    desc: 'This isn\'t a generic booking tool with an escape room skin. Every feature was designed around how escape room players actually behave and how owners actually run their business.',
  },
  {
    title: 'Simple beats clever',
    desc: 'Your booking system should be invisible. Players book without thinking about it. You check your dashboard and rooms are full. No training manuals, no complicated setup.',
  },
  {
    title: 'Owners should own their time',
    desc: 'You opened an escape room because you love creating experiences, not because you love answering phones and managing spreadsheets. Let the software handle the busywork.',
  },
  {
    title: 'Data drives decisions',
    desc: 'Which rooms need a promo? When should you hire another game master? What\'s your actual no-show rate? You can\'t improve what you don\'t measure.',
  },
  {
    title: 'No lock-in, ever',
    desc: 'Your data is yours. Export anytime. Cancel anytime. We earn your business every month, not through contracts.',
  },
  {
    title: 'Built to grow with you',
    desc: 'Whether you have 2 rooms or 20 locations, the platform scales. Start free, upgrade as you grow. The pricing grows with your revenue, not ahead of it.',
  },
];

export default function AboutPage() {
  return (
    <EBLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 lg:pt-36 pb-24 lg:pb-32">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,79,0,0.06),transparent_70%)] opacity-80" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-7">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">About EscapeBoost</span>
            </div>
            <h1 className="font-display text-[40px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
              Built by people who fill escape rooms for a living
            </h1>
            <p className="mt-8 text-[17px] sm:text-[18px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[600px]">
              We&apos;ve spent years running marketing for escape room businesses. We know the
              industry because we&apos;ve been in the trenches: running ads, answering phones,
              watching bookings come in (and not come in). EscapeBoost exists because we
              kept building the same tools for every client and thought: why not build it once, properly?
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#F8F5F0] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center gap-2.5 justify-center mb-5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Our mission</span>
            </div>
            <h2 className="font-display text-[28px] sm:text-[40px] lg:text-[52px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515]">
              Make every escape room bookable 24/7 without the owner losing sleep over it
            </h2>
            <p className="mt-7 text-[17px] sm:text-[18px] text-[#574E4C] leading-[1.7]">
              There are thousands of incredible escape rooms run by passionate owners who are
              stretched thin. They built amazing experiences but spend half their day on admin
              tasks that software should handle. We&apos;re fixing that.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14 lg:mb-20">
            <div className="flex items-center gap-2.5 justify-center mb-5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">What we believe</span>
            </div>
            <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[#201515]">
              Principles that guide everything we build
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white border border-[#E7E5E4]/60 rounded-2xl p-7 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300 h-full">
                <h3 className="text-[17px] font-semibold text-[#201515]">{v.title}</h3>
                <p className="mt-3 text-[15px] text-[#574E4C] leading-[1.7]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Want to talk?
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-md mx-auto">
            We love hearing from escape room owners. Tell us about your business.
          </p>
          <Link
            href="/escapeboost/contact"
            className="mt-10 inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Get in Touch <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" strokeWidth={1.8} />
          </Link>
        </div>
      </section>
    </EBLayout>
  );
}

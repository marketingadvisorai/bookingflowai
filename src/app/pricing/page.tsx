'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, ArrowRight01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';
import { generateFAQSchema, renderStructuredData } from '@/lib/seo/structured-data';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Start free. Grow when ready.',
    features: [
      '150 bookings per month',
      '1.9% customer service fee',
      'Online booking widget',
      'Email confirmations',
      'Stripe payments',
      'Basic analytics',
      'Email support',
      '"Powered by BookingFlow" badge',
    ],
    highlighted: false,
    cta: 'Start Free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$49',
    annualPrice: '$39',
    period: '/mo',
    desc: 'For venues ready to scale.',
    badge: 'Most Popular',
    features: [
      'Unlimited bookings',
      '1.5% customer service fee',
      'AI chatbot (24/7)',
      'Employee management',
      'Gift vouchers',
      'Cart abandonment recovery',
      'Analytics dashboard',
      'Priority support',
      '"Powered by BookingFlow" badge',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
    href: '/signup',
  },
  {
    name: 'Business',
    price: '$99',
    annualPrice: '$79',
    period: '/mo',
    desc: 'For serious operations.',
    features: [
      'Unlimited bookings',
      '1.2% customer service fee',
      'AI voice agent',
      'Email marketing',
      'Digital waivers',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Priority support',
      '"Powered by BookingFlow" badge',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
    href: '/signup',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'White-label. Multi-location.',
    features: [
      'Custom pricing and fees',
      'White-label (badge removed)',
      'Multi-location management',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
      'Onboarding & training',
    ],
    highlighted: false,
    cta: 'Contact Sales',
    href: '/contact',
  },
];

const comparisonRows = [
  {
    category: 'The Math',
    features: [
      { name: 'On a $180 booking, customer pays:', starter: '$3.42', pro: '$2.70', business: '$2.16', enterprise: 'Custom' },
      { name: 'You receive (after Stripe 2.9% + $0.30):', starter: '$174.78', pro: '$174.78', business: '$174.78', enterprise: '~$179.10' },
    ],
  },
  {
    category: 'Limits',
    features: [
      { name: 'Bookings per month', starter: '150', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Features',
    features: [
      { name: 'Online booking widget', starter: true, pro: true, business: true, enterprise: true },
      { name: 'Stripe payments', starter: true, pro: true, business: true, enterprise: true },
      { name: 'AI chatbot (24/7)', starter: false, pro: true, business: true, enterprise: true },
      { name: 'AI voice agent', starter: false, pro: false, business: true, enterprise: true },
      { name: 'Email marketing', starter: false, pro: false, business: true, enterprise: true },
      { name: 'Digital waivers', starter: false, pro: false, business: true, enterprise: true },
      { name: 'API access', starter: false, pro: false, business: true, enterprise: true },
      { name: 'White-label (badge removed)', starter: false, pro: false, business: false, enterprise: true },
    ],
  },
];

const competitorComparison = [
  { name: 'BookingFlow (Business)', fee: '1.2%', on180: '$2.16', notes: 'Lowest fees. You pay $0.' },
  { name: 'FareHarbor', fee: '~6%', on180: '$10.80', notes: '"Free" but 6% hidden booking fee' },
  { name: 'Peek Pro', fee: '6-8%', on180: '$10.80-14.40', notes: '"Free" but 6-8% per booking' },
  { name: 'Xola', fee: '~6%', on180: '$10.80', notes: '"Free" but 6% per booking' },
  { name: 'Bookeo', fee: '$39.95-79.95/mo', on180: 'N/A', notes: 'Monthly fee + limited bookings' },
  { name: 'Resova', fee: '$59-199/mo', on180: 'N/A', notes: 'Monthly fee, booking caps on lower tiers' },
];

const faqs = [
  {
    q: 'How does the service fee work?',
    a: "The service fee is charged to the booking customer, not to you. It's transparently displayed at checkout. Your customer sees the booking price + service fee. You receive the full booking amount (minus Stripe's standard 2.9% + $0.30 processing fee).",
  },
  {
    q: 'What payment processor do you use?',
    a: "Stripe. The most trusted payment platform in the world. You connect your own Stripe account, and funds go directly to you. BookingFlow collects our service fee automatically. We never hold your venue's money.",
  },
  {
    q: 'Are there any hidden fees?',
    a: "No. Your plan price + service fee. That's it. Stripe charges their standard 2.9% + $0.30 per transaction (this is industry-standard and applies to any payment processor). No setup fees, no cancellation fees, no transaction minimums.",
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes. Upgrade or downgrade anytime from your dashboard. Changes take effect immediately and billing is prorated. No penalties for switching.',
  },
  {
    q: 'What happens if I exceed the Free plan limit?',
    a: "We'll notify you when you're approaching 150 bookings. Your widget stays active, but new bookings pause until the next month. Upgrade to Pro for unlimited bookings anytime.",
  },
  {
    q: 'Do you offer annual discounts?',
    a: 'Yes. Save 20% with annual billing. Pro drops from $49/mo to $39/mo. Business drops from $99/mo to $79/mo. Pay once a year, save $120-240.',
  },
  {
    q: 'Why is BookingFlow cheaper than competitors?',
    a: 'We built the platform to be efficient. No legacy infrastructure, no bloated teams. We charge less because we can. Our 1.2% service fee on Business is up to 5x cheaper than traditional booking platforms. Lower fees. Better tech.',
  },
  {
    q: 'Can I try Pro or Business before paying?',
    a: 'Yes. Start on the Free plan. Upgrade anytime with a 14-day free trial on Pro or Business. No credit card required for Free plan.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const faqSchema = generateFAQSchema(faqs.map((faq) => ({ question: faq.q, answer: faq.a })));

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={renderStructuredData(faqSchema)} />
      <MarketingNav />

      {/* Hero */}
      <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 text-center">
          <div className="flex items-center gap-2.5 justify-center mb-5 sm:mb-7">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Pricing</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515] max-w-3xl mx-auto">
            Simple pricing. Lower fees than anyone.
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-[#574E4C] max-w-[640px] mx-auto">
            On a $180 booking, your customer pays just <strong className="font-bold text-[#201515]">$2.16</strong> in service fees with Business. 
            That's up to 5x less than traditional booking platforms. Start free. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 bg-[#F9F7F3] p-1.5 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={
                'px-6 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 ' +
                (billingCycle === 'monthly'
                  ? 'bg-white text-[#201515] shadow-sm'
                  : 'text-[#6F6765] hover:text-[#201515]')
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={
                'px-6 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 flex items-center gap-2 ' +
                (billingCycle === 'annual'
                  ? 'bg-white text-[#201515] shadow-sm'
                  : 'text-[#6F6765] hover:text-[#201515]')
              }
            >
              Annual
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#FF4F00] text-white text-[10px] font-black uppercase tracking-wider">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-20 lg:pb-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {plans.map((plan) => {
              const displayPrice =
                billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price;
              return (
                <div
                  key={plan.name}
                  className={
                    'relative flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 animate-fade-in ' +
                    (plan.highlighted
                      ? 'border-2 border-[#FF4F00] bg-white shadow-[0_16px_48px_rgba(255,79,0,0.12)] lg:scale-[1.04] z-10'
                      : 'border border-[#E7E5E4]/60 bg-white hover:shadow-card hover:-translate-y-1 hover:border-[#E7E5E4]')
                  }
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-6 rounded-full bg-[#FF4F00] px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
                      {plan.badge}
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#6F6765]">{plan.name}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-[48px] font-bold text-[#201515] leading-none tracking-tight">
                      {displayPrice}
                    </span>
                    <span className="text-[16px] text-[#6F6765] font-semibold">{plan.period}</span>
                  </div>
                  {billingCycle === 'annual' && plan.annualPrice && (
                    <p className="mt-2 text-[13px] text-[#6F6765]">
                      Billed ${parseInt(plan.annualPrice.replace('$', '')) * 12}/year
                    </p>
                  )}
                  <p className="mt-4 text-[15px] text-[#6F6765] leading-[1.6] font-medium">{plan.desc}</p>

                  <ul className="mt-9 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px] text-[#574E4C] leading-[1.6]">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 flex-shrink-0 text-[#FF4F00] mt-0.5 stroke-[2.5]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 sm:mt-10">
                    <Link
                      href={plan.href}
                      className={
                        'block w-full text-center text-[15px] font-bold py-4 min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
                        (plan.highlighted
                          ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] focus:ring-[#FF4F00]'
                          : 'bg-transparent text-[#201515] border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] focus:ring-[#201515]')
                      }
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Compare</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] text-center mb-12 sm:mb-14">
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            {comparisonRows.map((section) => (
              <div key={section.category} className="mb-8">
                <h3 className="text-[14px] font-bold text-[#6F6765] uppercase tracking-wider mb-4 px-4">
                  {section.category}
                </h3>
                <table className="w-full bg-white rounded-xl overflow-hidden border border-[#E7E5E4]/60">
                  <thead>
                    <tr className="border-b border-[#E7E5E4]">
                      <th className="text-left py-4 px-4 text-sm font-medium text-[#6F6765] w-2/5">Feature</th>
                      <th className="text-center py-4 px-3 text-sm font-medium text-[#6F6765]">Free</th>
                      <th className="text-center py-4 px-3 text-sm font-semibold text-[#FF4F00]">Pro</th>
                      <th className="text-center py-4 px-3 text-sm font-medium text-[#6F6765]">Business</th>
                      <th className="text-center py-4 px-3 text-sm font-medium text-[#6F6765]">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.features.map((f, i) => (
                      <tr key={f.name} className={i < section.features.length - 1 ? 'border-b border-[#E7E5E4]/50' : ''}>
                        <td className="py-4 px-4 text-sm text-[#201515]">{f.name}</td>
                        {(['starter', 'pro', 'business', 'enterprise'] as const).map((plan) => (
                          <td key={plan} className="text-center py-4 px-3">
                            {typeof f[plan] === 'boolean' ? (
                              f[plan] ? (
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-[#FF4F00] mx-auto" />
                              ) : (
                                <span className="text-[#93908C]">&#x2013;</span>
                              )
                            ) : (
                              <span className="text-sm text-[#574E4C] font-medium">{f[plan]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">The Math</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] text-center mb-6">
            vs the competition
          </h2>
          <p className="text-[16px] text-[#574E4C] leading-[1.7] text-center max-w-[600px] mx-auto mb-12">
            On a $180 booking, here's what your customer pays in service fees. Lower fees mean happier customers and more bookings.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#E7E5E4]/60 bg-white">
            <table className="w-full">
              <thead className="bg-[#F9F7F3]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Platform</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Service Fee</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">On $180 Booking</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((comp, i) => (
                  <tr
                    key={comp.name}
                    className={
                      (i < competitorComparison.length - 1 ? 'border-b border-[#E7E5E4]/50 ' : '') +
                      (comp.name.includes('BookingFlow') ? 'bg-[#FF4F00]/5' : '')
                    }
                  >
                    <td className="px-6 py-5 text-[15px] font-semibold text-[#201515]">{comp.name}</td>
                    <td className="px-6 py-5 text-[14px] text-[#574E4C]">{comp.fee}</td>
                    <td className="px-6 py-5">
                      <span
                        className={
                          'text-[18px] font-bold ' +
                          (comp.name.includes('BookingFlow') ? 'text-[#FF4F00]' : 'text-[#201515]')
                        }
                      >
                        {comp.on180}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[14px] text-[#6F6765]">{comp.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-[14px] text-[#6F6765] leading-[1.7] text-center">
            <strong className="font-semibold text-[#201515]">Note:</strong> All fees shown are customer-facing service fees. 
            Stripe's standard processing fee (2.9% + $0.30) applies to all platforms. <Link href="/payment-services" className="text-[#FF4F00] underline hover:no-underline">Learn more about our fee structure</Link>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-[120px]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">FAQ</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] text-center mb-12 sm:mb-14">
            Common questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Start filling time slots today
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
            Free to start. No credit card. Upgrade anytime.
          </p>
          <Link
            href="/signup"
            className="mt-8 sm:mt-10 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Start Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E7E5E4]/60 rounded-xl overflow-hidden hover:shadow-card hover:border-[#E7E5E4] transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 sm:px-7 py-5 text-left hover:bg-[#F9F7F3] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-inset"
      >
        <span className="text-[15px] sm:text-[16px] font-semibold text-[#201515] pr-4 leading-[1.5]">{question}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} className={`h-5 w-5 text-[#6F6765] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 sm:px-7 pb-6 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[15px] text-[#574E4C] leading-[1.7]">{answer}</p>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, MinusSignIcon } from '@hugeicons/core-free-icons';
import { useState } from 'react';
import { EBLayout } from '../_components/eb-layout';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'For new rooms just getting started',
    features: ['150 bookings/mo', '1.9% customer service fee', 'Online booking widget', 'Email notifications', '"Powered by EscapeBoost" badge'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    desc: 'For growing escape room businesses',
    features: ['Unlimited bookings', '1.5% customer service fee', 'AI booking chatbot', 'Analytics dashboard', 'Priority support', '"Powered by EscapeBoost" badge'],
    cta: 'Start Pro Trial',
    highlighted: true,
    badge: 'Popular',
  },
  {
    name: 'Business',
    price: '$99',
    period: '/mo',
    desc: 'For serious operations',
    features: ['Unlimited bookings', '1.2% customer service fee', 'Everything in Pro', 'AI voice agent', 'Email marketing', 'API access', 'Custom branding', '"Powered by EscapeBoost" badge'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

const comparison = [
  { feature: 'Monthly bookings', free: '150', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Customer service fee', free: '1.9%', pro: '1.5%', business: '1.2%' },
  { feature: 'Booking widget', free: true, pro: true, business: true },
  { feature: 'AI chatbot', free: false, pro: true, business: true },
  { feature: 'AI voice agent', free: false, pro: false, business: true },
  { feature: 'Email reminders', free: true, pro: true, business: true },
  { feature: 'Analytics', free: false, pro: true, business: true },
  { feature: 'Email marketing', free: false, pro: false, business: true },
  { feature: 'Custom branding', free: false, pro: false, business: true },
  { feature: 'API access', free: false, pro: false, business: true },
  { feature: 'Priority support', free: false, pro: true, business: true },
];

const faqs = [
  {
    q: 'Can I try EscapeBoost before committing?',
    a: 'Yes. The Free plan is genuinely free with no credit card required. You can run up to 150 bookings per month. Most single-location rooms start here and upgrade when they outgrow it.',
  },
  {
    q: 'How does the AI chatbot work with my specific rooms?',
    a: 'During setup, you tell us about your rooms: themes, difficulty levels, player counts, pricing, and any FAQs. The chatbot uses this to answer player questions accurately and guide them to the right room.',
  },
  {
    q: 'Will this work with my existing website?',
    a: 'Yes. The booking widget embeds with a single line of code and works on any website builder: WordPress, Squarespace, Wix, custom HTML, anything. It automatically matches your site\'s style.',
  },
  {
    q: 'What happens when a player calls and the voice agent picks up?',
    a: 'The voice agent greets them, answers questions about your rooms and availability, and can complete a booking over the phone. If it can\'t handle something, it takes a message and notifies you immediately.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Anytime. Upgrade or downgrade from your dashboard. Changes take effect on your next billing cycle. No cancellation fees.',
  },
  {
    q: 'How do the service fees work?',
    a: 'A small service fee (1.2-1.9% depending on your plan) is charged to the customer at checkout. You pay $0 in transaction fees. Your customers see the booking price plus the service fee, and you keep 100% of the booking amount.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <EBLayout>
      {/* Hero + Pricing Cards */}
      <section className="relative overflow-hidden pt-28 lg:pt-36 pb-24 lg:pb-32">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,79,0,0.06),transparent_70%)] opacity-80" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 justify-center mb-5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Pricing</span>
            </div>
            <h1 className="font-display text-[40px] md:text-[56px] lg:text-[72px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
              Simple pricing, no surprises
            </h1>
            <p className="mt-7 text-[17px] sm:text-[18px] leading-[1.7] text-[#574E4C]">
              Venue owners pay $0 in transaction fees. A small service fee (1.2-1.9%) is charged to customers at checkout.
            </p>
          </div>

          <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  'relative flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 ' +
                  (tier.highlighted
                    ? 'border-2 border-[#FF4F00] bg-white shadow-[0_16px_48px_rgba(255,79,0,0.12)] md:scale-[1.04] z-10'
                    : 'border border-[#E7E5E4]/60 bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#E7E5E4]')
                }
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-8 rounded-full bg-[#FF4F00] px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
                    {tier.badge}
                  </div>
                )}
                <p className="text-xs uppercase tracking-[0.12em] font-bold text-[#6F6765]">{tier.name}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-[48px] sm:text-[56px] font-bold text-[#201515] leading-none tracking-tight">{tier.price}</span>
                  <span className="text-[16px] sm:text-[18px] text-[#6F6765] font-semibold">{tier.period}</span>
                </div>
                <p className="mt-4 text-[15px] text-[#6F6765] leading-[1.6] font-medium">{tier.desc}</p>
                <ul className="mt-8 sm:mt-9 flex-1 space-y-3.5 sm:space-y-4">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
                      <HugeiconsIcon icon={Tick01Icon} size={20} className="flex-shrink-0 text-[#FF4F00] mt-0.5" strokeWidth={1.8} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 sm:mt-10">
                  <Link
                    href={tier.name === 'Business' ? '/escapeboost/contact' : '/signup'}
                    className={
                      'block w-full text-center text-[15px] font-bold py-4 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
                      (tier.highlighted
                        ? 'bg-[#FF4F00] text-white hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] focus:ring-[#FF4F00]'
                        : 'bg-transparent text-[#201515] border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] focus:ring-[#201515]')
                    }
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-[13px] sm:text-sm font-medium text-[#93908C]">
            Service fees are charged to customers, not you. All plans include Stripe payment processing.
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-[#F8F5F0] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-center gap-2.5 justify-center mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Compare plans</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515] text-center mb-12">
            Everything at a glance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#E7E5E4]">
                  <th className="text-left py-4 pr-4 text-[#6F6765] font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-[#6F6765] font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-[#FF4F00] font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 text-[#6F6765] font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-[#E7E5E4]/60">
                    <td className="py-4 pr-4 text-[#574E4C] font-medium">{row.feature}</td>
                    {(['free', 'pro', 'business'] as const).map((plan) => (
                      <td key={plan} className="text-center py-4 px-4">
                        {typeof row[plan] === 'boolean' ? (
                          row[plan] ? (
                            <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#FF4F00] mx-auto" strokeWidth={2.5} />
                          ) : (
                            <HugeiconsIcon icon={MinusSignIcon} size={16} className="text-[#93908C] mx-auto" strokeWidth={1.8} />
                          )
                        ) : (
                          <span className="text-[#574E4C] font-medium">{row[plan]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-center gap-2.5 justify-center mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">FAQ</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] font-medium leading-[0.95] tracking-[-0.02em] text-[#201515] text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#E7E5E4]/60 rounded-2xl overflow-hidden bg-white hover:border-[#E7E5E4] transition-colors duration-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between text-[#201515] font-semibold text-[15px] hover:bg-[#F9F7F3] transition-colors duration-200"
                >
                  {faq.q}
                  <span className={`ml-4 text-[#FF4F00] font-bold text-lg transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-[15px] text-[#574E4C] leading-[1.7]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Ready to fill your rooms?
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-md mx-auto">
            Start free. No credit card. Set up in 15 minutes.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </EBLayout>
  );
}

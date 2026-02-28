import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Message01Icon,
  SmartPhone01Icon,
  Calendar03Icon,
  CreditCardIcon,
  BarChartIcon,
  Mail01Icon,
  CodeIcon,
  Shield01Icon,
  FlashIcon,
  UserGroupIcon,
  Wallet03Icon,
  CheckmarkBadge01Icon,
  Globe02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Settings01Icon,
  Book02Icon,
} from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <FeatureSections />
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
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Features</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            Everything your venue needs to grow
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px]">
            From booking to analytics, BookingFlow replaces a stack of disconnected tools with one platform built for venues.
          </p>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    category: 'Online Booking Engine',
    icon: Calendar03Icon,
    color: 'bg-[#FF4F00]',
    items: [
      {
        title: 'Real-time availability calendar',
        desc: 'Your calendar updates instantly across all channels. When someone books a slot, it disappears from your website, phone system, and dashboard at the same time.'
      },
      {
        title: 'Mobile-optimized checkout',
        desc: 'Over 60% of bookings happen on phones. Your booking page loads in under a second and works perfectly on every screen size.'
      },
      {
        title: 'Public and private bookings',
        desc: 'Let customers join group events or book entire rooms privately. Set different pricing for each option.'
      },
      {
        title: 'Group booking support',
        desc: 'Handle parties of any size. Set minimum and maximum capacity per room. Accept deposits for large groups.'
      },
      {
        title: 'Automatic confirmation emails',
        desc: 'Customers get a confirmation email with booking details, directions, and what to expect. No manual work.'
      },
      {
        title: 'Multiple rooms per venue',
        desc: 'Manage all your rooms from one dashboard. Each room has its own schedule, pricing, and capacity settings.'
      },
    ],
  },
  {
    category: 'AI Features',
    icon: FlashIcon,
    color: 'bg-[#FF4F00]',
    badge: 'Our Differentiator',
    items: [
      {
        title: 'AI Chatbot',
        desc: '24/7 customer support on your website. Answers FAQs about your venue, checks availability, and helps customers complete bookings without waiting for your staff.'
      },
      {
        title: 'AI Voice Agent',
        desc: 'Answers every phone call. Books rooms, processes cancellations, and transfers to staff when needed. Never miss a call again.'
      },
      {
        title: 'AI-powered pricing suggestions',
        desc: 'Automatically adjust pricing based on demand, time of day, and booking patterns. Maximize revenue without constant manual updates.'
      },
    ],
  },
  {
    category: 'Payment Processing',
    icon: CreditCardIcon,
    color: 'bg-[#201515]',
    items: [
      {
        title: 'Stripe integration',
        desc: 'Accept credit cards, debit cards, and digital wallets through Stripe. Trusted by millions of businesses worldwide.'
      },
      {
        title: 'Transparent service fee model',
        desc: 'Small service fee charged to customers at checkout (1.2-1.9% depending on your plan). You keep 100% of the booking price.'
      },
      {
        title: 'Automatic payouts',
        desc: 'Money goes directly to your Stripe account. Get paid on Stripe\'s standard schedule (usually 2 business days).'
      },
      {
        title: 'Refund management',
        desc: 'Process full or partial refunds from your dashboard. Money returns to the customer\'s original payment method automatically.'
      },
      {
        title: 'Promo codes and gift vouchers',
        desc: 'Create discount codes for special events or partnerships. Sell gift vouchers that customers can redeem online.'
      },
    ],
  },
  {
    category: 'Dashboard & Management',
    icon: Settings01Icon,
    color: 'bg-[#201515]',
    items: [
      {
        title: 'Real-time booking dashboard',
        desc: 'See all your bookings in one place. Filter by room, date, or status. Export to CSV for accounting.'
      },
      {
        title: 'Room and experience management',
        desc: 'Add unlimited rooms and experiences. Set different pricing, capacity, and duration for each one.'
      },
      {
        title: 'Schedule management',
        desc: 'Set operating hours for each day of the week. Block out dates for maintenance or private events. Add buffer time between bookings.'
      },
      {
        title: 'Employee and staff management',
        desc: 'Give your team access to the dashboard. Set permissions so front desk sees bookings but can\'t change settings.'
      },
      {
        title: 'Customer database',
        desc: 'Every booking creates a customer profile. See booking history, contact info, and notes about preferences or special requests.'
      },
      {
        title: 'Booking analytics and reports',
        desc: 'Track revenue by room, time slot, and day of week. Identify your busiest hours and slowest days. Make decisions based on data.'
      },
    ],
  },
  {
    category: 'Marketing Tools',
    icon: Mail01Icon,
    color: 'bg-[#FF4F00]',
    items: [
      {
        title: 'Promotional codes',
        desc: 'Create discount codes for slow days, partnerships, or social media campaigns. Track redemption rates.'
      },
      {
        title: 'Cart abandonment recovery (Pro+)',
        desc: 'Automatically email customers who started booking but didn\'t finish. Recover 15-20% of abandoned bookings.'
      },
      {
        title: 'Email marketing (Business+)',
        desc: 'Send automated campaigns: post-booking follow-ups, review requests, birthday offers, and re-engagement emails for past customers.'
      },
      {
        title: 'SEO-optimized booking pages',
        desc: 'Your booking page is built for search engines. Meta tags, structured data, and fast loading help you rank higher.'
      },
    ],
  },
  {
    category: 'Integrations',
    icon: CodeIcon,
    color: 'bg-[#FF4F00]',
    items: [
      {
        title: 'Embeddable widget',
        desc: 'Add the booking widget to any website with one line of code. Works as a script embed or iframe. Fully responsive.'
      },
      {
        title: 'Works on any website',
        desc: 'WordPress, Squarespace, Wix, Shopify, or a custom site. If you can paste code, you can add the widget.'
      },
      {
        title: 'Google Analytics compatible',
        desc: 'Track booking conversion rates, traffic sources, and customer behavior. Works with GA4 out of the box.'
      },
      {
        title: 'Google Tag Manager support',
        desc: 'Set up event tracking, conversion pixels, and remarketing tags through GTM. No coding required.'
      },
      {
        title: 'Stripe Connect',
        desc: 'Built on Stripe\'s platform. Accept payments, process refunds, and manage subscriptions through your Stripe account.'
      },
      {
        title: 'API access (Business+)',
        desc: 'Build custom integrations, sync bookings with your POS system, or connect to third-party tools. RESTful API with webhooks.'
      },
    ],
  },
  {
    category: 'Waivers & Compliance',
    icon: Shield01Icon,
    color: 'bg-[#201515]',
    items: [
      {
        title: 'Digital waivers (Business+)',
        desc: 'Customers sign waivers online before arriving. Store signed documents securely. Send reminder emails if someone skips the waiver.'
      },
      {
        title: 'GDPR compliant',
        desc: 'We follow European data protection regulations. Customers can request their data or ask to be deleted anytime.'
      },
      {
        title: 'PCI DSS compliant via Stripe',
        desc: 'Credit card data never touches your server. Stripe handles payment security and compliance for you.'
      },
    ],
  },
];

function FeatureSections() {
  return (
    <section className="pb-20 lg:pb-[120px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 space-y-20 sm:space-y-24 lg:space-y-32">
        {features.map((section, sectionIdx) => {
          return (
            <div
              key={section.category}
              className={`border-l-4 border-[#FF4F00]/20 pl-6 sm:pl-10 ${
                sectionIdx > 0 ? 'pt-20 sm:pt-24 lg:pt-32' : ''
              }`}
            >
              {/* Category header */}
              <div className="flex items-start gap-4 mb-8 sm:mb-10">
                <div className={`h-12 w-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 hover:scale-110`}>
                  <HugeiconsIcon icon={section.icon} className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-[24px] sm:text-[32px] lg:text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[#201515]">
                    {section.category}
                  </h2>
                  {section.badge && (
                    <span className="inline-block mt-3 text-xs font-black uppercase tracking-wider bg-[#FF4F00] text-white px-3 py-1.5 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Feature items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 lg:gap-8">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="group bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-7 hover:border-[#FF4F00]/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#201515] leading-[1.3]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] text-[#6F6765] leading-[1.65]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DarkCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Ready to see it in action?
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Start free. No credit card. No sales calls.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515] animate-pulse-glow"
          >
            Get Started Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#F8F4F0] text-[16px] sm:text-[17px] font-medium border-2 border-[#F8F4F0]/30 px-8 py-4 min-h-[44px] rounded-full hover:bg-[#F8F4F0] hover:text-[#201515] hover:border-[#F8F4F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F8F4F0] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}

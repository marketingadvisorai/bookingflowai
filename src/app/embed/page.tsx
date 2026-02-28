import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Tick01Icon, CodeIcon, ColorPickerIcon, SmartPhone01Icon, FlashIcon, GlobeIcon, Settings01Icon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function EmbedPage() {
  const baseUrl = process.env.BF_PUBLIC_BASE_URL || 'https://bookingflowai.com';
  const scriptUrl = `${baseUrl.replace('://', '://script.')}/v1/widget.js`;

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <HowItWorks />
      <Features />
      <Platforms />
      <CodeExample scriptUrl={scriptUrl} baseUrl={baseUrl} />
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
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Embeddable Widget</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            One line of code. Instant bookings.
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px]">
            Drop the BookingFlow widget into any website with a single code snippet. Works on WordPress, Squarespace, Wix, or custom sites. Fully responsive.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Get Your Code <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" strokeWidth={1.8} />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#201515] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#201515] focus:ring-offset-2"
            >
              How It Works
            </Link>
          </div>
          <p className="mt-5 sm:mt-6 text-[14px] font-medium text-[#93908C]">No developer required. No monthly fees.</p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: '01',
    title: 'Sign up and set up your venue',
    description: 'Create your account, add rooms, set pricing and schedules. Takes about 10 minutes.',
  },
  {
    number: '02',
    title: 'Copy the embed code',
    description: 'Go to your dashboard and copy the widget code. One line of JavaScript or an iframe embed.',
  },
  {
    number: '03',
    title: 'Paste into your website',
    description: 'Add the code to your site (footer, custom HTML block, or page). The widget appears instantly.',
  },
  {
    number: '04',
    title: 'Customers book instantly',
    description: 'Your website now accepts bookings 24/7. Real-time availability syncs automatically.',
  },
];

function HowItWorks() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            How the widget works
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            Add bookings to your site without hiring a developer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-7 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-full bg-[#FF4F00] flex items-center justify-center mb-5 shadow-md">
                <span className="text-white font-bold text-[17px]">{step.number}</span>
              </div>
              <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#201515] leading-[1.3] mb-3">
                {step.title}
              </h3>
              <p className="text-[15px] text-[#6F6765] leading-[1.65]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FlashIcon,
    title: 'Real-time availability',
    description: 'Widget shows only available time slots. When someone books, the slot disappears from all channels instantly.',
  },
  {
    icon: SmartPhone01Icon,
    title: 'Mobile responsive',
    description: 'Works perfectly on phones, tablets, and desktops. Over 60% of bookings happen on mobile.',
  },
  {
    icon: ColorPickerIcon,
    title: 'Customizable colors',
    description: 'Match the widget to your brand. Change button colors, fonts, and spacing from your dashboard.',
  },
  {
    icon: Settings01Icon,
    title: 'Two embed options',
    description: 'Use a JavaScript snippet (recommended) or an iframe. Both work the same way.',
  },
  {
    icon: GlobeIcon,
    title: 'Works anywhere',
    description: 'WordPress, Squarespace, Wix, Shopify, or any HTML site. If you can paste code, it works.',
  },
  {
    icon: FlashIcon,
    title: 'Fast loading',
    description: "Widget loads in under 500ms. Doesn't slow down your website or affect SEO.",
  },
];

function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Widget features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {features.map((feature) => {
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-7 hover:border-[#FF4F00]/30 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-[#FF4F00] flex items-center justify-center mb-5 shadow-md">
                  <HugeiconsIcon icon={feature.icon} size={24} className="text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#201515] leading-[1.3] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[#6F6765] leading-[1.65]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const platforms = [
  { name: 'WordPress', instructions: 'Add to a Custom HTML block or footer.php template.' },
  { name: 'Squarespace', instructions: 'Use a Code Block or inject into site footer.' },
  { name: 'Wix', instructions: 'Add via Custom Element or Embed Code component.' },
  { name: 'Shopify', instructions: 'Paste into a page template or theme.liquid file.' },
  { name: 'Webflow', instructions: 'Use an Embed element on any page.' },
  { name: 'HTML Site', instructions: 'Paste before the closing </body> tag.' },
];

function Platforms() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Works on any platform
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            If your website builder supports custom code, the widget will work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-5xl mx-auto">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 hover:border-[#FF4F00]/30 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="text-[17px] font-semibold text-[#201515] mb-2">{platform.name}</h3>
              <p className="text-[14px] text-[#6F6765] leading-[1.6]">{platform.instructions}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample({ scriptUrl, baseUrl }: { scriptUrl: string; baseUrl: string }) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            The code you'll paste
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7]">
            Copy this snippet from your dashboard and paste it into your website.
          </p>
        </div>

        <div className="bg-[#201515] rounded-2xl p-6 sm:p-8 overflow-hidden shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <HugeiconsIcon icon={CodeIcon} size={20} className="text-[#FF4F00]" strokeWidth={1.8} />
            <span className="text-[14px] font-semibold text-[#F8F4F0]">JavaScript Embed (Recommended)</span>
          </div>
          <pre className="overflow-x-auto">
            <code className="text-[13px] sm:text-[14px] text-[#F8F4F0] font-mono leading-[1.8]">
{`<script
  src="${scriptUrl}"
  data-org-id="your-org-id"
  data-accent-color="#FF4F00"
></script>`}
            </code>
          </pre>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <HugeiconsIcon icon={CodeIcon} size={20} className="text-[#FF4F00]" strokeWidth={1.8} />
            <span className="text-[14px] font-semibold text-[#201515]">iFrame Embed (Alternative)</span>
          </div>
          <pre className="overflow-x-auto">
            <code className="text-[13px] sm:text-[14px] text-[#201515] font-mono leading-[1.8]">
{`<iframe
  src="${baseUrl}/widget?orgId=YOUR_ORG_ID"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`}
            </code>
          </pre>
        </div>

        <div className="mt-8 bg-[#FFF3E6] rounded-xl p-6 border border-[#FF4F00]/20">
          <p className="text-[15px] text-[#201515] font-medium mb-3">What the widget includes:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-[14px] text-[#574E4C] leading-[1.6]">
              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Real-time availability calendar for all your rooms</span>
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[#574E4C] leading-[1.6]">
              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Secure checkout flow with Stripe payment processing</span>
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[#574E4C] leading-[1.6]">
              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Automatic email confirmation sent to customers</span>
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[#574E4C] leading-[1.6]">
              <HugeiconsIcon icon={Tick01Icon} size={20} className="text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>Mobile-responsive design that works on all devices</span>
            </li>
          </ul>
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
          Ready to add bookings to your site?
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Create your account, set up your venue, and get your embed code in 10 minutes.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Get Started Free <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" strokeWidth={1.8} />
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

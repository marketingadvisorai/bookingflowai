import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, Location01Icon, Clock01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { ContactForm } from '@/components/contact-form';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata = { title: 'Contact | BookingFlow' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 sm:pb-20 lg:pb-[120px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-20">
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Get in touch</span>
              </div>
              <h1 className="font-display text-[36px] sm:text-[40px] md:text-[56px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
                Let&apos;s talk about your venue
              </h1>
              <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7] max-w-[500px]">
                Whether you run one room or twenty locations, we would love to hear from you. Drop us a message and we will get back to you within 24 hours.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: Mail01Icon, label: 'Email', value: 'support@bookingflowai.com' },
                  { icon: Clock01Icon, label: 'Response time', value: 'Within 24 hours' },
                  { icon: Location01Icon, label: 'Based in', value: 'North America' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF4F00]/10 flex-shrink-0">
                      <HugeiconsIcon icon={item.icon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#201515]">{item.label}</p>
                      <p className="text-[15px] text-[#6F6765] mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-l-2 border-[#FF4F00]/20 pl-6 space-y-3.5">
                {[
                  'Free setup help for every new venue',
                  'See a demo with your actual rooms and time slots',
                  'Zero pressure, just a conversation',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-[#FF4F00] flex-shrink-0 mt-0.5 stroke-[2.5]" strokeWidth={1.8} />
                    <span className="text-[15px] text-[#574E4C] leading-[1.6]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

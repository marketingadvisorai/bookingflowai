import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { LegalDocumentIcon, Shield01Icon, CookieIcon, AlertCircleIcon, DatabaseIcon, CreditCardIcon, LockIcon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Legal — BookingFlow',
  description: 'All legal documents and policies for BookingFlow. Terms, privacy, cookies, data processing, and compliance information.',
};

const legalDocs = [
  {
    title: 'Terms of Service',
    icon: LegalDocumentIcon,
    href: '/terms',
    description: 'The legal agreement between you and BookingFlow. Covers account usage, billing, and our mutual obligations.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Privacy Policy',
    icon: Shield01Icon,
    href: '/privacy',
    description: 'How we collect, use, and protect your data. GDPR and CCPA compliant.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Cookie Policy',
    icon: CookieIcon,
    href: '/cookies',
    description: 'What cookies we use and how to manage them. Transparent tracking practices.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Acceptable Use Policy',
    icon: AlertCircleIcon,
    href: '/acceptable-use',
    description: 'Guidelines for using BookingFlow responsibly. What\'s allowed and what\'s not.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Data Processing Agreement',
    icon: DatabaseIcon,
    href: '/dpa',
    description: 'GDPR-compliant agreement for how we process customer data on your behalf.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Payment Services',
    icon: CreditCardIcon,
    href: '/payment-services',
    description: 'How payments work, service fees, and our partnership with Stripe.',
    updated: 'February 24, 2026',
  },
  {
    title: 'Security',
    icon: LockIcon,
    href: '/security',
    description: 'Our security measures, infrastructure, and commitment to protecting your data.',
    updated: 'February 24, 2026',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      <section className="pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="mb-12 sm:mb-16 text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Legal</span>
            </div>
            <h1 className="font-display text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[0.95] tracking-[-0.03em] text-[#201515]">
              Legal Documents
            </h1>
            <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.7] text-[#574E4C] max-w-[640px] mx-auto">
              All our policies in one place. We believe in transparency and clear communication. No legalese soup.
            </p>
          </div>

          {/* Legal Docs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalDocs.map((doc) => {
              
              return (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="group block bg-white border border-[#E7E5E4]/60 rounded-2xl p-6 sm:p-7 hover:shadow-card hover:border-[#E7E5E4] hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F9F7F3] flex items-center justify-center group-hover:bg-[#FF4F00]/10 transition-colors duration-200">
                      <HugeiconsIcon icon={doc.icon} size={24} className="text-[#FF4F00]" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[18px] font-bold text-[#201515] mb-2 group-hover:text-[#FF4F00] transition-colors duration-200">
                        {doc.title}
                      </h3>
                      <p className="text-[14px] leading-[1.6] text-[#574E4C] mb-3">
                        {doc.description}
                      </p>
                      <p className="text-[12px] text-[#93908C]">
                        Updated: {doc.updated}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-16 sm:mt-20 bg-[#F9F7F3] border border-[#E7E5E4] rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#201515] mb-4">
              Have questions about our legal policies?
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#574E4C] mb-6 max-w-[560px] mx-auto">
              We're happy to clarify anything. Our legal documents are written to be understood, but if something's unclear, just ask.
            </p>
            <a
              href="mailto:support@bookingflowai.com"
              className="inline-flex items-center bg-[#FF4F00] text-white text-[16px] font-semibold px-7 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Contact Support
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-[#E7E5E4]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <h4 className="text-[14px] font-bold text-[#201515] mb-2">Company</h4>
                <p className="text-[14px] text-[#574E4C]">BookingFlow</p>
                <p className="text-[14px] text-[#574E4C]">(Advisor Media Group)</p>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#201515] mb-2">Contact</h4>
                <p className="text-[14px] text-[#574E4C]">
                  <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">
                    support@bookingflowai.com
                  </a>
                </p>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#201515] mb-2">Location</h4>
                <p className="text-[14px] text-[#574E4C]">United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

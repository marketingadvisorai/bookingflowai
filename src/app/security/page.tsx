import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Shield01Icon, LockIcon, Key01Icon, ServerStack01Icon, ViewIcon, CheckmarkBadge01Icon, AiCloud01Icon, AlertDiamondIcon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

const securityFeatures = [
  {
    icon: LockIcon,
    title: 'End-to-End Encryption',
    desc: 'All data is encrypted in transit with TLS 1.3 and at rest with AES-256. The same encryption used by banks and governments.',
  },
  {
    icon: Shield01Icon,
    title: 'PCI DSS Compliant Payments',
    desc: 'We never store credit card data. All payments are processed through Stripe, a Level 1 PCI DSS certified provider.',
  },
  {
    icon: Key01Icon,
    title: 'Secure Authentication',
    desc: 'Passwords are hashed with bcrypt. Session tokens are cryptographically secure. CSRF protection on every form.',
  },
  {
    icon: ServerStack01Icon,
    title: 'Infrastructure Security',
    desc: 'Hosted on AWS with automatic backups, DDoS protection, and 99.9% uptime SLA. Your data is replicated across multiple regions.',
  },
  {
    icon: ViewIcon,
    title: 'GDPR Ready',
    desc: 'Built with privacy by design. Customer data export, deletion, and consent management are built into the platform.',
  },
  {
    icon: CheckmarkBadge01Icon,
    title: 'SOC 2 Type II (In Progress)',
    desc: 'We are actively pursuing SOC 2 Type II certification to meet enterprise security requirements.',
  },
  {
    icon: AiCloud01Icon,
    title: 'Regular Security Audits',
    desc: 'We conduct quarterly security assessments and third-party penetration testing to identify and fix vulnerabilities.',
  },
  {
    icon: AlertDiamondIcon,
    title: 'Incident Response',
    desc: '24/7 security monitoring. Any suspected breach is investigated immediately and customers are notified within 72 hours.',
  },
];

const complianceItems = [
  { standard: 'PCI DSS Level 1', status: 'Via Stripe', desc: 'Payment card data never touches our servers' },
  { standard: 'GDPR', status: 'Compliant', desc: 'Full data portability and deletion rights' },
  { standard: 'SOC 2 Type II', status: 'In Progress', desc: 'Expected certification Q3 2026' },
  { standard: 'ISO 27001', status: 'Planned', desc: 'Information security management system' },
];

const dataProtectionPoints = [
  'All customer booking data is encrypted at rest using AES-256',
  'Data in transit uses TLS 1.3 with perfect forward secrecy',
  'Credit card data is tokenized by Stripe — we never see the full card number',
  'Payment processing happens directly between your customer and Stripe',
  'Access logs are retained for 90 days for audit purposes',
  'Database backups are encrypted and stored in geographically separate regions',
  'Multi-factor authentication available for all dashboard users',
  'Role-based access control — staff only see what they need to see',
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5 justify-center mb-5 sm:mb-7">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Security</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515] max-w-4xl mx-auto text-center">
            Your data. Your customers. Protected.
          </h1>
          <p className="mt-6 sm:mt-8 text-[17px] sm:text-[18px] leading-[1.7] text-[#574E4C] max-w-[640px] mx-auto text-center">
            We take security seriously. Bank-level encryption, PCI compliance through Stripe, and enterprise-grade infrastructure. 
            Because trust is not optional.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {securityFeatures.map((feature) => {
              
              return (
                <div
                  key={feature.title}
                  className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-7 hover:shadow-card hover:border-[#E7E5E4] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5 mb-5">
                    <HugeiconsIcon icon={feature.icon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={2} />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#201515] mb-3 leading-[1.3]">{feature.title}</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Protection Details */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">How We Protect Your Data</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            Security by design
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {dataProtectionPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2.5" />
                <p className="text-[15px] text-[#574E4C] leading-[1.7]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Security */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8 sm:p-10 lg:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#FF4F00]/5">
                <HugeiconsIcon icon={Shield01Icon} className="h-7 w-7 text-[#FF4F00]" strokeWidth={2} />
              </div>
              <h2 className="font-display text-[24px] sm:text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[#201515]">
                Payment Security
              </h2>
            </div>
            <p className="text-[16px] text-[#574E4C] leading-[1.7] mb-6">
              BookingFlow uses <strong className="font-semibold text-[#201515]">Stripe</strong> for all payment processing. 
              Stripe is a certified PCI Service Provider Level 1, the highest level of certification in the payments industry.
            </p>
            <p className="text-[16px] text-[#574E4C] leading-[1.7] mb-6">
              <strong className="font-semibold text-[#201515]">We never store credit card data.</strong> When your customer 
              enters payment information, it goes directly to Stripe. We only receive a secure token that represents the card.
            </p>
            <p className="text-[16px] text-[#574E4C] leading-[1.7] mb-6">
              Funds from bookings are transferred directly to your Stripe account. BookingFlow collects our service fee 
              automatically through Stripe Connect. We never hold your venue's money.
            </p>
            <div className="mt-8 pt-8 border-t border-[#E7E5E4]">
              <p className="text-[14px] text-[#6F6765] leading-[1.7]">
                <strong className="font-semibold text-[#201515]">Standard Stripe processing fees apply:</strong> 2.9% + $0.30 per transaction. 
                BookingFlow service fees are separate and transparent to customers. <Link href="/payment-services" className="text-[#FF4F00] underline hover:no-underline">Learn more about our fee structure</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Table */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Compliance</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            Meeting industry standards
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#E7E5E4]/60 bg-white">
            <table className="w-full">
              <thead className="bg-[#F9F7F3]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Standard</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#201515]">Details</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item, i) => (
                  <tr key={item.standard} className={i < complianceItems.length - 1 ? 'border-b border-[#E7E5E4]/50' : ''}>
                    <td className="px-6 py-5 text-[15px] font-semibold text-[#201515]">{item.standard}</td>
                    <td className="px-6 py-5">
                      <span
                        className={
                          'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ' +
                          (item.status === 'Compliant' || item.status === 'Via Stripe'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700')
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[14px] text-[#574E4C]">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Uptime & Monitoring */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5 mb-5">
                <HugeiconsIcon icon={AiCloud01Icon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-[#201515] mb-3">99.9% Uptime SLA</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7] mb-4">
                Your booking widget needs to work 24/7. We guarantee 99.9% uptime or you get service credits.
              </p>
              <p className="text-[14px] text-[#6F6765] leading-[1.7]">
                Hosted on AWS with automatic failover, load balancing, and multi-region redundancy.
              </p>
            </div>
            <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5 mb-5">
                <HugeiconsIcon icon={ViewIcon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={2} />
              </div>
              <h3 className="text-[20px] font-bold text-[#201515] mb-3">24/7 Monitoring</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7] mb-4">
                Our security team monitors the platform around the clock. Suspicious activity triggers immediate alerts.
              </p>
              <p className="text-[14px] text-[#6F6765] leading-[1.7]">
                Real-time intrusion detection, DDoS mitigation, and automated threat response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Questions about security?
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
            Our team is here to answer your questions. Enterprise customers can request a full security audit.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Contact Our Security Team
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

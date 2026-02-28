import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | BookingFlow',
  description: 'How BookingFlow collects, uses, and protects your data. Clear, honest privacy practices for venue owners and their customers.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      <article className="pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
              <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Legal</span>
            </div>
            <h1 className="font-display text-[36px] sm:text-[44px] lg:text-[52px] font-medium leading-[0.95] tracking-[-0.03em] text-[#201515]">
              Privacy Policy
            </h1>
            <p className="mt-4 text-[15px] text-[#6F6765]">
              <strong>Effective Date:</strong> February 24, 2026
            </p>
            <p className="mt-2 text-[15px] text-[#6F6765]">
              <strong>Company:</strong> BookingFlow (Advisor Media Group)
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-bookingflow max-w-none">
            <section className="mb-10">
              <p className="text-[16px] leading-[1.7] text-[#574E4C]">
                This Privacy Policy explains how BookingFlow ("we," "us," or "our") collects, uses, and protects information when you use our booking platform. We believe in transparency, so we've written this in plain English.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">1. Information We Collect</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">1.1 Account Information</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                When you create a BookingFlow account, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Name and email address</li>
                <li>Business/venue name and address</li>
                <li>Phone number (optional)</li>
                <li>Password (encrypted with bcrypt)</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">1.2 Booking Data</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                When customers book through your widget, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Customer name, email, and phone number</li>
                <li>Booking date, time, and participant count</li>
                <li>Special requests or notes</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">1.3 Payment Information</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We use <strong>Stripe</strong> to process payments. We never store credit card numbers. Stripe collects payment details securely. We receive transaction metadata (amount, date, last 4 digits) to reconcile bookings.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">1.4 Usage Analytics</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We collect anonymous usage data to improve the platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Pages viewed and features used</li>
                <li>Browser type and device information</li>
                <li>IP address (for security and regional optimization)</li>
                <li>Time spent on pages</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">2. How We Use Your Information</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We use your data to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Provide the service:</strong> Process bookings, send confirmations, manage your account</li>
                <li><strong>Improve the product:</strong> Analyze usage patterns to build better features</li>
                <li><strong>Communicate:</strong> Send important updates, security alerts, and (if you opt in) product announcements</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, and protect accounts</li>
                <li><strong>Legal compliance:</strong> Respond to legal requests and enforce our Terms of Service</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">3. Data Sharing</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.1 Third-Party Services</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We share data with trusted partners who help us run the platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Stripe:</strong> Payment processing (see <Link href="https://stripe.com/privacy" className="text-[#FF4F00] underline hover:no-underline">Stripe's Privacy Policy</Link>)</li>
                <li><strong>AWS:</strong> Infrastructure and hosting (PostgreSQL, SES, CloudFront)</li>
                <li><strong>Analytics providers:</strong> Anonymous usage analytics</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.2 What We Don't Do</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                <strong>We do not sell your data to third parties.</strong> Period. We do not rent, trade, or monetize your personal information.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.3 Legal Obligations</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may disclose information if required by law (subpoena, court order) or to protect our rights and users' safety.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">4. Cookies and Tracking</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We use cookies to keep you logged in and understand how you use BookingFlow. See our <Link href="/cookies" className="text-[#FF4F00] underline hover:no-underline">Cookie Policy</Link> for details.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li><strong>Essential:</strong> Authentication and session management (required)</li>
                <li><strong>Analytics:</strong> Anonymous usage tracking (can be disabled)</li>
                <li><strong>Preferences:</strong> Theme and language settings</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">5. Data Retention</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We keep your data as long as your account is active. When you delete your account:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Personal data is deleted within 30 days</li>
                <li>Booking records are retained for 7 years (tax and legal compliance)</li>
                <li>Anonymous analytics may be retained indefinitely</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">6. Your Rights</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-4">
                You have control over your data:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.1 Access and Export</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Request a copy of your data anytime. Email <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a> for a full export (delivered within 30 days).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.2 Correction</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Update your account information in Settings → Profile. For booking data corrections, contact support.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.3 Deletion</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Delete your account in Settings → Account. All personal data is removed within 30 days (booking records archived per legal requirements).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.4 Objection</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can opt out of marketing emails anytime (click "Unsubscribe"). You cannot opt out of transactional emails (booking confirmations, security alerts).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">7. GDPR Compliance (EU Users)</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                If you're in the European Union:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.1 Legal Basis</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We process your data based on:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li><strong>Contract:</strong> To provide the service you signed up for</li>
                <li><strong>Legitimate interest:</strong> Product improvement, fraud prevention</li>
                <li><strong>Consent:</strong> Marketing emails (opt-in)</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.2 Data Controller</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow (Advisor Media Group) is the data controller for venue owner accounts. For customer booking data, the venue owner is the controller and BookingFlow is the processor. See our <Link href="/dpa" className="text-[#FF4F00] underline hover:no-underline">Data Processing Agreement</Link>.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.3 Data Protection Officer</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Contact our DPO at <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a> with "GDPR Request" in the subject line.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.4 Right to Lodge a Complaint</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can file a complaint with your local data protection authority if you believe we've mishandled your data.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">8. CCPA Compliance (California Users)</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-4">
                If you're a California resident, you have these rights under the California Consumer Privacy Act:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">8.1 Right to Know</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Request details about the personal information we've collected about you in the past 12 months (categories, sources, purpose, third parties).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">8.2 Right to Delete</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Request deletion of your personal information (subject to legal retention requirements).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">8.3 Right to Opt-Out of Sale</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                <strong>We do not sell personal information.</strong> Never have, never will.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">8.4 Non-Discrimination</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We will not discriminate against you for exercising your CCPA rights.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">9. Children's Privacy</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is not intended for users under 16. We do not knowingly collect data from children. If you're a parent and believe your child has created an account, contact us immediately at <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">10. International Data Transfers</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is based in the United States. If you access our service from outside the US, your data may be transferred to and stored on servers in the US. By using BookingFlow, you consent to this transfer.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                For EU users, we use Standard Contractual Clauses (SCCs) approved by the European Commission to protect your data during international transfers.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">11. Security Measures</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We take security seriously:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Encryption:</strong> All data in transit uses TLS/SSL. Passwords are hashed with bcrypt.</li>
                <li><strong>Access controls:</strong> Only authorized personnel can access production data.</li>
                <li><strong>Monitoring:</strong> We log access and monitor for suspicious activity.</li>
                <li><strong>Regular audits:</strong> Security reviews and penetration testing.</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                No system is 100% secure. If we discover a breach, we'll notify affected users within 72 hours (as required by GDPR).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">12. Changes to This Policy</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may update this Privacy Policy occasionally. If we make significant changes, we'll email you 30 days before they take effect. Continued use after changes means you accept the updated policy.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                Last updated: <strong>February 24, 2026</strong>
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">13. Contact Us</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Questions about this Privacy Policy? Contact us:
              </p>
              <div className="bg-[#F9F7F3] border border-[#E7E5E4] rounded-xl p-6 text-[15px] text-[#574E4C]">
                <p><strong className="text-[#201515]">Email:</strong> <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a></p>
                <p className="mt-2"><strong className="text-[#201515]">Company:</strong> BookingFlow (Advisor Media Group)</p>
                <p className="mt-2"><strong className="text-[#201515]">Address:</strong> United States</p>
              </div>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-[#E7E5E4]">
            <p className="text-[14px] font-semibold text-[#6F6765] mb-4">Related policies:</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Cookie Policy
              </Link>
              <Link href="/acceptable-use" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Acceptable Use Policy
              </Link>
              <Link href="/dpa" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Data Processing Agreement
              </Link>
              <Link href="/legal" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                All Legal Documents
              </Link>
            </div>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Terms of Service | BookingFlow',
  description: 'Terms and conditions for using BookingFlow\'s online booking platform for entertainment venues.',
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 text-[15px] text-[#6F6765]">
              <strong>Effective Date:</strong> February 24, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-bookingflow max-w-none">
            <section className="mb-10">
              <p className="text-[16px] leading-[1.7] text-[#574E4C]">
                These Terms of Service ("Terms") govern your use of BookingFlow's online booking platform. By creating an account or using our service, you agree to these Terms. If you don't agree, don't use BookingFlow.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                By accessing or using BookingFlow ("Service"), you agree to be bound by these Terms, our <Link href="/privacy" className="text-[#FF4F00] underline hover:no-underline">Privacy Policy</Link>, and our <Link href="/acceptable-use" className="text-[#FF4F00] underline hover:no-underline">Acceptable Use Policy</Link>. These Terms apply to all users: venue owners, staff members, and customers who book through our platform.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                If you're using BookingFlow on behalf of a business, you represent that you have authority to bind that business to these Terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">2. Description of Service</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is an online booking platform designed for entertainment venues, including escape rooms, axe throwing, virtual reality experiences, and similar businesses. We provide:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>A booking widget you can embed on your website</li>
                <li>A dashboard to manage bookings, rooms, and schedules</li>
                <li>Payment processing via Stripe</li>
                <li>AI-powered chatbots and voice agents (on Pro and Business plans)</li>
                <li>Analytics and reporting tools</li>
                <li>Email confirmations and reminders</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">3. Account Registration and Responsibilities</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.1 Eligibility</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You must be at least 18 years old and capable of forming a binding contract to use BookingFlow. If you're under 18, you may not create an account.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.2 Account Security</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Keeping your password secure and confidential</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately if you suspect unauthorized access</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                We recommend using a strong, unique password. Enable two-factor authentication if available.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.3 Accurate Information</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You must provide accurate and complete information when creating your account. Keep your business name, address, and contact details up to date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">4. Subscription Plans and Billing</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.1 Plan Tiers</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow offers multiple subscription tiers: Free, Pro, Business, and Enterprise. See our <Link href="/pricing" className="text-[#FF4F00] underline hover:no-underline">Pricing page</Link> for current plans and features.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.2 Billing Cycle</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Paid plans are billed monthly or annually (your choice). Billing occurs automatically on your renewal date. Annual plans are billed once per year at a discounted rate.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.3 Payment Method</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You must provide a valid payment method (credit card or debit card) for paid plans. You authorize us to charge your payment method for your subscription fees.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.4 Price Changes</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may change our pricing at any time. If we increase your plan price, we'll notify you at least 30 days before the change takes effect. Continued use after the price increase means you accept the new pricing.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.5 Refunds</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Subscription fees are non-refundable. If you cancel your plan, you'll continue to have access until the end of your current billing period. No partial refunds for unused time.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.6 Free Trials</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may offer free trials for paid plans. If you don't cancel before the trial ends, your payment method will be charged for the subscription. You can cancel anytime during the trial without being charged.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">5. Payment Processing and Service Fees</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.1 Stripe Integration</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                All customer payments are processed through Stripe. You must connect a Stripe account to accept bookings. Funds from bookings go directly to your Stripe account (we never hold your money).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.2 Service Fees</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow charges a service fee on each booking, paid by the customer at checkout. Service fees vary by plan:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li><strong>Free:</strong> 1.9% of booking amount</li>
                <li><strong>Pro:</strong> 1.5% of booking amount</li>
                <li><strong>Business:</strong> 1.2% of booking amount</li>
                <li><strong>Enterprise:</strong> Custom (as low as 0.5%)</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                Service fees are automatically collected by Stripe and transferred to BookingFlow. Stripe's standard processing fee (2.9% + $0.30 per transaction) also applies and is separate from our service fee.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.3 Chargebacks and Disputes</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You are responsible for handling customer disputes and chargebacks. If a customer disputes a charge with their bank, Stripe will notify you. BookingFlow is not liable for chargebacks or refunds.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">6. Acceptable Use</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                See our <Link href="/acceptable-use" className="text-[#FF4F00] underline hover:no-underline">Acceptable Use Policy</Link> for full details. In short, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Use BookingFlow for illegal activities or to sell illegal products/services</li>
                <li>Violate any laws or regulations</li>
                <li>Spam, abuse, or harass anyone</li>
                <li>Upload malware, viruses, or malicious code</li>
                <li>Scrape, reverse engineer, or decompile our platform</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Impersonate others or misrepresent your business</li>
                <li>Resell or sublicense BookingFlow without permission</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.1 Our IP</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow owns all rights to the platform, including the code, design, logos, and trademarks. You may not copy, modify, or distribute our software. You receive a limited, non-exclusive, non-transferable license to use BookingFlow for your booking business.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.2 Your Content</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You own all content you upload to BookingFlow (business descriptions, game details, photos, customer data). By using our Service, you grant us a limited license to use, store, and display your content to provide the Service. We do not claim ownership of your content.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.3 Trademarks</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                "BookingFlow" and our logo are trademarks of Advisor Media Group. You may not use our trademarks without written permission, except for the "Powered by BookingFlow" badge on your booking widget (required on all plans except Enterprise).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">8. User Content and Data Ownership</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You retain full ownership of:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Your business data (venue details, games, rooms, schedules)</li>
                <li>Customer booking data (names, emails, phone numbers, booking history)</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                You can export your data anytime from your dashboard. If you delete your account, we'll provide a final data export within 30 days.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                <strong>Your responsibility:</strong> You are the data controller for customer personal data under GDPR. BookingFlow is the data processor. See our <Link href="/dpa" className="text-[#FF4F00] underline hover:no-underline">Data Processing Agreement</Link> for details.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">9. Limitation of Liability</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                <strong>To the fullest extent permitted by law:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>BookingFlow is not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>This includes lost profits, lost revenue, lost data, or business interruption</li>
                <li>Our total liability for any claim related to the Service is limited to the amount you paid us in the 12 months before the claim (or $100, whichever is greater)</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                Some jurisdictions don't allow these limitations, so they may not apply to you.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">10. Disclaimers</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The results you get from using the Service will be accurate or reliable</li>
                <li>The Service will meet your specific business requirements</li>
                <li>Defects will be corrected</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                We work hard to keep BookingFlow running smoothly, but we can't promise perfection. Use the Service at your own risk.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">11. Indemnification</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You agree to indemnify, defend, and hold harmless BookingFlow (and our employees, contractors, and affiliates) from any claims, damages, losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law or regulation</li>
                <li>Your violation of third-party rights (copyright, privacy, etc.)</li>
                <li>Content you upload to BookingFlow</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">12. Termination</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">12.1 By You</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can cancel your account anytime from Settings → Account. Your subscription will remain active until the end of the current billing period (no refunds for unused time). After cancellation, you can export your data for 30 days.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">12.2 By Us</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Violate these Terms or our Acceptable Use Policy</li>
                <li>Engage in fraudulent activity</li>
                <li>Fail to pay subscription fees</li>
                <li>Use the Service in a way that harms BookingFlow or other users</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                We'll give you 7 days' notice before termination (when possible) so you can export your data. In cases of serious violations (fraud, illegal activity), we may terminate immediately without notice.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">12.3 Data Export</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                After termination, you have 30 days to export your data. After 30 days, we'll delete all your account data (except what we're legally required to retain).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">13. Dispute Resolution</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">13.1 Informal Resolution</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If you have a dispute with BookingFlow, please contact us at <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a> first. We'll work in good faith to resolve the issue.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">13.2 Binding Arbitration</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If we can't resolve the dispute informally, you agree to binding arbitration under the rules of the American Arbitration Association (AAA). Arbitration will be conducted in the United States. The arbitrator's decision is final and binding.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">13.3 Class Action Waiver</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You agree to resolve disputes individually, not as part of a class action, collective action, or representative proceeding. You waive the right to participate in class actions against BookingFlow.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">13.4 Exceptions</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Either party may seek injunctive relief in court to protect intellectual property rights.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">14. Governing Law</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                These Terms are governed by the laws of the United States and the state in which Advisor Media Group is incorporated, without regard to conflict of law principles. Any disputes not subject to arbitration will be resolved in courts located in the United States.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">15. Modifications to Terms</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may update these Terms from time to time. If we make significant changes, we'll notify you by email at least 30 days before the changes take effect. Continued use of BookingFlow after the changes means you accept the updated Terms.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                We'll always post the current version of these Terms at <Link href="/terms" className="text-[#FF4F00] underline hover:no-underline">bookingflowai.com/terms</Link> with the effective date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">16. Severability</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If any provision of these Terms is found to be unenforceable or invalid by a court, that provision will be modified to the minimum extent necessary to make it enforceable, and the rest of the Terms will remain in full effect.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">17. Entire Agreement</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                These Terms, together with our Privacy Policy and Acceptable Use Policy, constitute the entire agreement between you and BookingFlow regarding the Service. They supersede any prior agreements or understandings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">18. Contact Information</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Questions about these Terms? Contact us:
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
              <Link href="/privacy" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Privacy Policy
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

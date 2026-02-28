import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | BookingFlow',
  description: 'Guidelines for acceptable use of the BookingFlow platform. Learn what\'s permitted and what\'s prohibited.',
};

export default function AcceptableUsePage() {
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
              Acceptable Use Policy
            </h1>
            <p className="mt-4 text-[15px] text-[#6F6765]">
              <strong>Effective Date:</strong> February 24, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-bookingflow max-w-none">
            <section className="mb-10">
              <p className="text-[16px] leading-[1.7] text-[#574E4C]">
                This Acceptable Use Policy ("AUP") outlines what you can and cannot do when using BookingFlow. These rules exist to keep the platform safe, legal, and fair for everyone. By using BookingFlow, you agree to follow this policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">1. Permitted Use</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                BookingFlow is designed for legitimate booking businesses. You may use BookingFlow to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Accept bookings for legal entertainment experiences (escape rooms, axe throwing, VR, etc.)</li>
                <li>Manage your venue's schedule, rooms, and bookings</li>
                <li>Process payments for services you provide</li>
                <li>Communicate with customers about their bookings</li>
                <li>Analyze your business data to improve operations</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                Use BookingFlow in good faith for its intended purpose: running a booking business.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">2. Prohibited Activities</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-4">
                The following activities are strictly prohibited:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.1 Illegal Content and Activities</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not use BookingFlow to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Sell illegal products or services</li>
                <li>Promote or facilitate illegal activities</li>
                <li>Violate any local, state, federal, or international laws</li>
                <li>Infringe on intellectual property rights (copyright, trademark, patents)</li>
                <li>Engage in money laundering or fraud</li>
                <li>Sell controlled substances without proper licenses</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.2 Spam and Abuse</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Send unsolicited emails, SMS, or messages to customers who didn't opt in</li>
                <li>Harvest email addresses or personal data without consent</li>
                <li>Use fake or misleading contact information</li>
                <li>Impersonate another person or business</li>
                <li>Create multiple accounts to abuse free trials or promotions</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.3 Harmful Content</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not upload, post, or transmit:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Malware, viruses, or malicious code</li>
                <li>Content that promotes violence, terrorism, or hate speech</li>
                <li>Defamatory, obscene, or harassing content</li>
                <li>Content that violates others' privacy or publicity rights</li>
                <li>Pornographic or sexually explicit material (unless legally permitted for your business)</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.4 Platform Abuse</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Attempt to reverse engineer, decompile, or disassemble BookingFlow</li>
                <li>Scrape, crawl, or use automated tools to extract data without permission</li>
                <li>Probe, scan, or test the security of our systems</li>
                <li>Bypass rate limits, authentication, or access controls</li>
                <li>Use BookingFlow to build a competing product</li>
                <li>Overload our servers or interfere with other users' access</li>
                <li>Remove, obscure, or alter any copyright, trademark, or proprietary notices</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.5 Fraudulent Activity</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Process fraudulent payments or chargebacks intentionally</li>
                <li>Use stolen credit cards or payment information</li>
                <li>Misrepresent your business, services, or pricing</li>
                <li>Create fake bookings or reviews</li>
                <li>Engage in deceptive billing practices</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.6 Privacy Violations</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Collect customer data for purposes unrelated to bookings</li>
                <li>Sell or share customer personal data without consent</li>
                <li>Violate GDPR, CCPA, or other data protection laws</li>
                <li>Access or attempt to access other users' accounts or data</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">3. Enforcement and Consequences</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.1 Monitoring</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We reserve the right to monitor usage of BookingFlow to ensure compliance with this AUP. We may review accounts, content, and transactions if we suspect violations.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.2 Investigation</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If we receive a report or detect suspicious activity, we'll investigate. We may contact you for clarification or request documentation.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.3 Actions We May Take</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                If you violate this AUP, we may:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Warning:</strong> We'll notify you of the violation and ask you to stop</li>
                <li><strong>Temporary suspension:</strong> We may suspend your account while we investigate</li>
                <li><strong>Content removal:</strong> We may delete prohibited content</li>
                <li><strong>Account termination:</strong> We may permanently delete your account</li>
                <li><strong>Legal action:</strong> We may report illegal activity to law enforcement</li>
                <li><strong>Liability:</strong> You may be held financially responsible for damages</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.4 Appeal Process</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If your account is suspended or terminated, you can appeal by emailing <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a> with "Appeal" in the subject line. Include your account details and explanation. We'll review appeals within 7 business days.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">4. Reporting Violations</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                If you see someone violating this Acceptable Use Policy, please report it to us:
              </p>
              <div className="bg-[#F9F7F3] border border-[#E7E5E4] rounded-xl p-6 text-[15px] text-[#574E4C]">
                <p><strong className="text-[#201515]">Email:</strong> <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a></p>
                <p className="mt-2"><strong className="text-[#201515]">Subject line:</strong> "AUP Violation Report"</p>
                <p className="mt-2"><strong className="text-[#201515]">Include:</strong> Account name or URL, description of violation, screenshots (if applicable)</p>
              </div>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                We take reports seriously and investigate all claims. We may not be able to share the outcome with you due to privacy, but we will take action if warranted.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">5. Cooperation with Law Enforcement</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We cooperate with law enforcement agencies. If we receive a valid legal request (subpoena, court order, warrant), we may disclose user information. We may also proactively report illegal activity to authorities.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">6. No Liability for User Actions</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is a platform. We are not responsible for how you use it. You are solely responsible for your content, business practices, and compliance with laws. We do not pre-screen content or vet all businesses.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                By using BookingFlow, you agree to indemnify us against any claims, damages, or legal fees arising from your violations of this AUP.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">7. Changes to This Policy</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may update this Acceptable Use Policy from time to time. If we make significant changes, we'll notify you by email or through the platform. Continued use after changes means you accept the updated policy.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                Last updated: <strong>February 24, 2026</strong>
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">8. Questions?</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                If you're unsure whether something is allowed, ask us before you do it:
              </p>
              <div className="bg-[#F9F7F3] border border-[#E7E5E4] rounded-xl p-6 text-[15px] text-[#574E4C]">
                <p><strong className="text-[#201515]">Email:</strong> <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a></p>
                <p className="mt-2"><strong className="text-[#201515]">Company:</strong> BookingFlow (Advisor Media Group)</p>
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
              <Link href="/privacy" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Cookie Policy
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

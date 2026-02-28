import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Data Processing Agreement | BookingFlow',
  description: 'GDPR-compliant Data Processing Agreement for BookingFlow customers. Understand how we process your customer data.',
};

export default function DPAPage() {
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
              Data Processing Agreement
            </h1>
            <p className="mt-4 text-[15px] text-[#6F6765]">
              <strong>Effective Date:</strong> February 24, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-bookingflow max-w-none">
            <section className="mb-10">
              <p className="text-[16px] leading-[1.7] text-[#574E4C]">
                This Data Processing Agreement ("DPA") is part of our <Link href="/terms" className="text-[#FF4F00] underline hover:no-underline">Terms of Service</Link> and governs how BookingFlow processes personal data on behalf of our customers. This DPA is designed to comply with the EU General Data Protection Regulation (GDPR), the UK GDPR, and the California Consumer Privacy Act (CCPA).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">1. Definitions</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                For purposes of this DPA:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person (your customers' names, emails, phone numbers, booking history)</li>
                <li><strong>"Data Controller"</strong> means you, the venue owner (the entity that determines the purposes and means of processing Personal Data)</li>
                <li><strong>"Data Processor"</strong> means BookingFlow (the entity that processes Personal Data on behalf of the Data Controller)</li>
                <li><strong>"Sub-processor"</strong> means a third party engaged by BookingFlow to process Personal Data (e.g., Stripe, AWS)</li>
                <li><strong>"Data Subject"</strong> means your customers (the individuals whose Personal Data is processed)</li>
                <li><strong>"Processing"</strong> means any operation performed on Personal Data (collection, storage, use, disclosure, deletion)</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">2. Scope and Purpose</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.1 Relationship</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You (the venue owner) are the <strong>Data Controller</strong>. BookingFlow is the <strong>Data Processor</strong>. We process Personal Data only on your behalf and according to your instructions.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.2 Processing Purpose</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                BookingFlow processes Personal Data to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Accept and manage bookings on your behalf</li>
                <li>Send booking confirmations and reminders to your customers</li>
                <li>Process payments through Stripe</li>
                <li>Provide AI chatbot and voice agent support (if enabled)</li>
                <li>Store and display booking data in your dashboard</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.3 Types of Personal Data</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                We process the following Personal Data categories:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>Contact information: Name, email address, phone number</li>
                <li>Booking details: Date, time, number of participants, special requests</li>
                <li>Payment metadata: Transaction amount, date, last 4 digits of card (full card details are processed and stored by Stripe, not BookingFlow)</li>
                <li>IP address and device information (for fraud prevention)</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.4 Duration of Processing</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We process Personal Data for the duration of your BookingFlow subscription and for a retention period after termination (see Section 9).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">3. Your Instructions</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow processes Personal Data only according to your documented instructions. Your instructions include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>The <Link href="/terms" className="text-[#FF4F00] underline hover:no-underline">Terms of Service</Link> you agreed to when signing up</li>
                <li>Settings you configure in your dashboard (email templates, booking rules, data retention)</li>
                <li>Your use of BookingFlow features (embedding the widget, enabling chatbots, exporting data)</li>
                <li>Any additional written instructions you provide to our support team</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                If we believe an instruction violates GDPR or other data protection laws, we'll notify you immediately.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">4. Sub-processors</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.1 Authorized Sub-processors</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                You authorize BookingFlow to engage the following sub-processors:
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full border border-[#E7E5E4] rounded-xl overflow-hidden">
                  <thead className="bg-[#F9F7F3]">
                    <tr>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Sub-processor</th>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Purpose</th>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Stripe, Inc.</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Payment processing</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">United States</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Amazon Web Services (AWS)</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Cloud hosting and database</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.2 Changes to Sub-processors</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If we add or replace a sub-processor, we'll notify you at least 30 days before the change. You can object by emailing <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a>. If we can't accommodate your objection, you may terminate your subscription without penalty.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">4.3 Sub-processor Obligations</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We impose the same data protection obligations on sub-processors as in this DPA. We remain liable for any sub-processor's failure to meet their obligations.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">5. Data Security Measures</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                BookingFlow implements technical and organizational measures to protect Personal Data:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.1 Technical Measures</h3>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Encryption:</strong> All data in transit uses TLS 1.3. Passwords are hashed with bcrypt.</li>
                <li><strong>Access controls:</strong> Role-based permissions. Multi-factor authentication available.</li>
                <li><strong>Infrastructure:</strong> Data stored in AWS with encryption at rest.</li>
                <li><strong>Network security:</strong> Firewalls, DDoS protection, intrusion detection.</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.2 Organizational Measures</h3>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li><strong>Staff training:</strong> Employees are trained on data protection principles.</li>
                <li><strong>Confidentiality:</strong> Employees sign confidentiality agreements.</li>
                <li><strong>Access limitation:</strong> Only authorized personnel can access production data.</li>
                <li><strong>Security audits:</strong> Regular penetration testing and code reviews.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">6. Data Breach Notification</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.1 Notification to Controller</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If we discover a data breach involving your customers' Personal Data, we'll notify you <strong>within 72 hours</strong> of becoming aware of the breach. Our notification will include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Nature of the breach (what data was affected)</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken or proposed to address the breach</li>
                <li>Contact information for further inquiries</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">6.2 Your Obligations</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                As the Data Controller, you are responsible for notifying your customers and relevant data protection authorities if required by law. We'll assist you with this process.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">7. Data Subject Rights</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Your customers (Data Subjects) have rights under GDPR and CCPA. BookingFlow provides tools to help you fulfill these rights:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.1 Right to Access</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can export customer data from your dashboard. We'll assist you in providing data to customers who request it.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.2 Right to Rectification</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can edit booking data through the dashboard. Customers can also update their information directly.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.3 Right to Erasure</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can delete customer data from your dashboard. Contact us if you need assistance with bulk deletions.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.4 Right to Restrict Processing</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If a customer requests restricted processing, contact us at <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a>. We'll mark their data as restricted.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.5 Right to Data Portability</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You can export customer data in CSV or JSON format from your dashboard.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">7.6 Response Time</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We'll respond to Data Subject requests within <strong>30 days</strong> (as required by GDPR). You are responsible for responding to your customers within the legally required timeframe.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">8. Data Protection Impact Assessments</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If you're required to conduct a Data Protection Impact Assessment (DPIA) under GDPR Article 35, we'll provide reasonable assistance by sharing information about our processing activities, security measures, and sub-processors.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">9. Data Deletion on Termination</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                When your BookingFlow subscription ends (either by cancellation or termination):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>You have <strong>30 days</strong> to export all your data</li>
                <li>After 30 days, we'll delete all Personal Data from our active systems</li>
                <li>Backups may retain data for up to 90 days (then automatically deleted)</li>
                <li>We may retain anonymized usage data for analytics</li>
                <li>Certain records (billing, legal) may be retained for up to 7 years for compliance</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-4">
                You can request early deletion by contacting <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">10. International Data Transfers</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">10.1 Transfer Mechanism</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                BookingFlow is based in the United States. If you're in the EU/EEA or UK, transferring Personal Data to us is an international transfer. We rely on <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission to protect your data.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">10.2 Safeguards</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We implement the security measures described in Section 5 to protect data transferred internationally. Our sub-processors (Stripe, AWS) also comply with EU data protection standards.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">11. Audit Rights</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                You have the right to audit our compliance with this DPA. To request an audit:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-3">
                <li>Contact us at <a href="mailto:support@bookingflowai.com" className="text-[#FF4F00] underline hover:no-underline">support@bookingflowai.com</a> with at least 30 days' notice</li>
                <li>We'll provide documentation of our security measures and compliance certifications</li>
                <li>For on-site audits, you must cover reasonable costs and sign a confidentiality agreement</li>
                <li>Audits are limited to once per year (unless required by a data protection authority)</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">12. Liability and Indemnification</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Each party's liability under this DPA is subject to the limitation of liability clause in our <Link href="/terms" className="text-[#FF4F00] underline hover:no-underline">Terms of Service</Link>. We're liable for damages caused by our breach of this DPA, except where the breach was caused by your instructions or failure to comply with data protection laws.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">13. Contact Information</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                For questions about this DPA or to exercise your rights:
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
              <Link href="/privacy" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Cookie Policy
              </Link>
              <Link href="/acceptable-use" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Acceptable Use Policy
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

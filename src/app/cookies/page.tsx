import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export const metadata: Metadata = {
  title: 'Cookie Policy — BookingFlow',
  description: 'How BookingFlow uses cookies and similar tracking technologies to provide and improve our service.',
};

export default function CookiesPage() {
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
              Cookie Policy
            </h1>
            <p className="mt-4 text-[15px] text-[#6F6765]">
              <strong>Last Updated:</strong> February 24, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-bookingflow max-w-none">
            <section className="mb-10">
              <p className="text-[16px] leading-[1.7] text-[#574E4C]">
                This Cookie Policy explains how BookingFlow uses cookies and similar tracking technologies on our website and platform. By using BookingFlow, you consent to the use of cookies as described in this policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">1. What Are Cookies?</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Cookies are small text files stored on your device (computer, phone, tablet) when you visit a website. They help websites remember information about your visit, like your login status, preferences, and usage patterns.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (remain on your device until they expire or you delete them).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">2. Types of Cookies We Use</h2>
              
              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.1 Essential Cookies</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                These cookies are required for BookingFlow to function. Without them, you wouldn't be able to log in, use the booking widget, or access your dashboard. You cannot disable these cookies.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                <strong>What they do:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-2">
                <li>Keep you logged in to your account</li>
                <li>Remember your cart during checkout</li>
                <li>Prevent CSRF attacks (security)</li>
                <li>Balance server load</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.2 Analytics Cookies</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We use analytics cookies to understand how people use BookingFlow. This helps us improve the product. These cookies collect anonymous data about pages visited, time on site, and clicks.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                <strong>What they do:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-2">
                <li>Track page views and navigation patterns</li>
                <li>Measure feature usage</li>
                <li>Identify bugs and performance issues</li>
                <li>Understand which marketing campaigns work</li>
              </ul>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                You can disable analytics cookies in your browser settings (see below).
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">2.3 Preference Cookies</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                These cookies remember your choices and settings to personalize your experience.
              </p>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mt-3">
                <strong>What they do:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C] mt-2">
                <li>Remember your language preference</li>
                <li>Save your theme choice (light/dark mode)</li>
                <li>Recall your dashboard layout preferences</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">3. Third-Party Cookies</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Some cookies are set by third-party services we use:
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.1 Stripe</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Our payment processor, Stripe, sets cookies to detect fraud and process payments securely. See <Link href="https://stripe.com/cookies-policy/legal" className="text-[#FF4F00] underline hover:no-underline">Stripe's Cookie Policy</Link> for details.
              </p>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">3.2 Analytics Providers</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may use analytics services (e.g., Google Analytics) to understand site usage. These services may set their own cookies. Data collected is anonymized and aggregated.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">4. Cookie List</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-4">
                Here's a detailed list of cookies BookingFlow sets:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border border-[#E7E5E4] rounded-xl overflow-hidden">
                  <thead className="bg-[#F9F7F3]">
                    <tr>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Cookie Name</th>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Type</th>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Purpose</th>
                      <th className="text-left px-4 py-3 text-[14px] font-bold text-[#201515]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_session</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Essential</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Keeps you logged in to your account</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">7 days</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_csrf</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Essential</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Prevents cross-site request forgery attacks</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Session</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_cart</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Essential</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Remembers items during booking checkout</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">30 minutes</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_analytics</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Analytics</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Tracks anonymous usage data</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">1 year</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_theme</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Preference</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Remembers your theme choice (light/dark)</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">1 year</td>
                    </tr>
                    <tr className="border-t border-[#E7E5E4]">
                      <td className="px-4 py-3 text-[14px] text-[#574E4C] font-mono">bf_lang</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Preference</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">Remembers your language preference</td>
                      <td className="px-4 py-3 text-[14px] text-[#574E4C]">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">5. How to Manage Cookies</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-4">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li>View what cookies are stored</li>
                <li>Delete all or specific cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies (not recommended for BookingFlow)</li>
                <li>Set cookies to expire when you close the browser</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.1 Browser Instructions</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Here's how to manage cookies in popular browsers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] text-[#574E4C]">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
              </ul>

              <h3 className="text-[18px] font-semibold text-[#201515] mt-6 mb-3">5.2 Impact of Disabling Cookies</h3>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                If you disable essential cookies, BookingFlow will not work properly. You won't be able to log in or use the booking widget. Analytics and preference cookies can be disabled without breaking the platform, but you may lose some personalization.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">6. Do Not Track</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                Some browsers have a "Do Not Track" (DNT) setting. Currently, there is no industry standard for how to respond to DNT signals. BookingFlow does not currently respond to DNT signals, but we minimize tracking and do not sell your data.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">7. Changes to This Policy</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C]">
                We may update this Cookie Policy occasionally to reflect changes in our practices or legal requirements. We'll post the updated policy on this page with a new "Last Updated" date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#201515] mb-4">8. Contact Us</h2>
              <p className="text-[15px] leading-[1.7] text-[#574E4C] mb-3">
                Questions about cookies? Contact us:
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
              <Link href="/privacy" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[14px] text-[#FF4F00] underline hover:no-underline">
                Terms of Service
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

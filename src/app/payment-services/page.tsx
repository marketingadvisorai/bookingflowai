import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { DollarCircleIcon, CreditCardIcon, BarChartIcon, Shield01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function PaymentServicesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-16 sm:pt-20 lg:pt-36 pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5 justify-center mb-5 sm:mb-7">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Payment Services</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515] max-w-4xl mx-auto text-center">
            Transparent pricing. No surprises.
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] leading-[1.7] text-[#574E4C] max-w-[640px] mx-auto text-center">
            Here's exactly how payment processing works with BookingFlow, what you pay, what your customers pay, and how money flows.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">How Payments Work</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            The basics
          </h2>

          <div className="space-y-6">
            <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5">
                  <HugeiconsIcon icon={CreditCardIcon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#201515] mb-3">Payment Processing via Stripe</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7] mb-4">
                    BookingFlow uses <strong className="font-semibold text-[#201515]">Stripe Connected Accounts</strong> to process payments. 
                    When you sign up, you connect your own Stripe account. All bookings are charged directly to your Stripe account, 
                    and funds settle into your bank account within 2 business days (standard Stripe timing).
                  </p>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    <strong className="font-semibold text-[#201515]">BookingFlow never holds your money.</strong> We collect our service 
                    fee automatically via Stripe Connect, and the rest goes straight to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5">
                  <HugeiconsIcon icon={DollarCircleIcon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#201515] mb-3">BookingFlow Service Fee</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7] mb-4">
                    Our service fee is charged <strong className="font-semibold text-[#201515]">to the booking customer</strong>, 
                    not to you. It's transparently displayed at checkout. The fee structure depends on your plan:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-3 text-[15px] text-[#574E4C]">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2.5" />
                      <span><strong className="font-semibold text-[#201515]">Free:</strong> 1.9% service fee</span>
                    </li>
                    <li className="flex items-start gap-3 text-[15px] text-[#574E4C]">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2.5" />
                      <span><strong className="font-semibold text-[#201515]">Pro ($49/mo):</strong> 1.5% service fee</span>
                    </li>
                    <li className="flex items-start gap-3 text-[15px] text-[#574E4C]">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2.5" />
                      <span><strong className="font-semibold text-[#201515]">Business ($99/mo):</strong> 1.2% service fee</span>
                    </li>
                    <li className="flex items-start gap-3 text-[15px] text-[#574E4C]">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2.5" />
                      <span><strong className="font-semibold text-[#201515]">Enterprise:</strong> Negotiable (as low as 0.5%)</span>
                    </li>
                  </ul>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    This fee covers the cost of operating the booking platform, AI chatbot and voice agents, 24/7 support, 
                    and continuous product improvements.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-[#E7E5E4]/60 bg-white rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4F00]/5">
                  <HugeiconsIcon icon={Shield01Icon} className="h-6 w-6 text-[#FF4F00]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#201515] mb-3">Stripe Processing Fees</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7] mb-4">
                    Stripe charges standard payment processing fees for every transaction:
                  </p>
                  <div className="bg-[#F9F7F3] rounded-xl p-5 mb-4">
                    <p className="text-[20px] font-bold text-[#201515] mb-2">2.9% + $0.30</p>
                    <p className="text-[14px] text-[#574E4C] leading-[1.6]">per successful card charge</p>
                  </div>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    This is Stripe's fee, not ours. It covers fraud protection, PCI compliance, and secure payment infrastructure. 
                    Stripe has the same pricing for every business, from startups to Fortune 500 companies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Breakdown */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Example</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            Here's the math
          </h2>

          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E7E5E4]/60">
            <p className="text-[15px] text-[#6F6765] font-semibold uppercase tracking-wider mb-6">Booking Total: $180</p>
            
            <div className="space-y-5 mb-8 pb-8 border-b border-[#E7E5E4]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-[#201515]">Venue receives (Business plan)</p>
                  <p className="text-[14px] text-[#574E4C] mt-1">Booking amount minus Stripe processing fee</p>
                </div>
                <p className="text-[24px] font-bold text-[#201515]">$174.78</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-[#201515]">BookingFlow service fee</p>
                  <p className="text-[14px] text-[#574E4C] mt-1">1.2% of $180 (Business plan)</p>
                </div>
                <p className="text-[20px] font-bold text-[#FF4F00]">$2.16</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold text-[#201515]">Stripe processing fee</p>
                  <p className="text-[14px] text-[#574E4C] mt-1">2.9% + $0.30</p>
                </div>
                <p className="text-[18px] font-semibold text-[#6F6765]">$5.52</p>
              </div>
            </div>

            <div className="bg-[#F9F7F3] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[16px] font-bold text-[#201515]">Customer pays (total)</p>
                <p className="text-[28px] font-bold text-[#201515]">$187.68</p>
              </div>
              <p className="text-[14px] text-[#574E4C] leading-[1.7]">
                The customer sees: <strong className="font-semibold text-[#201515]">Booking: $180.00 + Service Fee: $2.16 + Processing: $5.52 = Total: $187.68</strong>
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#E7E5E4]">
              <p className="text-[14px] text-[#6F6765] leading-[1.7] mb-4">
                <strong className="font-semibold text-[#201515]">Why this is better than competitors:</strong>
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-[14px] text-[#574E4C]">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2" />
                  <span><strong className="font-semibold text-[#201515]">Xola charges 2.39% + $0.30</strong> to the customer. On this $180 booking, that's $4.60. You save customers $2.44.</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#574E4C]">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2" />
                  <span><strong className="font-semibold text-[#201515]">FareHarbor charges ~6%</strong> to the customer. On this $180 booking, that's $10.80. You save customers $8.64.</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#574E4C]">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-2" />
                  <span><strong className="font-semibold text-[#201515]">Resova charges you $40-108/mo</strong> with booking caps. BookingFlow charges less per month and has unlimited bookings.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Money Flow */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Money Flow</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            Where the money goes
          </h2>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#E7E5E4]" />
            
            <div className="relative space-y-10">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4F00] text-white font-bold text-lg z-10">
                  1
                </div>
                <div className="pt-4">
                  <h3 className="text-[18px] font-bold text-[#201515] mb-2">Customer books and pays</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    Customer completes booking on your widget. Payment info goes directly to Stripe. BookingFlow never sees the full card number.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4F00] text-white font-bold text-lg z-10">
                  2
                </div>
                <div className="pt-4">
                  <h3 className="text-[18px] font-bold text-[#201515] mb-2">Stripe processes the charge</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    Stripe charges the customer's card for the booking amount + BookingFlow service fee + Stripe's processing fee.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4F00] text-white font-bold text-lg z-10">
                  3
                </div>
                <div className="pt-4">
                  <h3 className="text-[18px] font-bold text-[#201515] mb-2">BookingFlow fee is automatically deducted</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    Stripe Connect automatically splits the payment. BookingFlow receives our service fee. The rest goes to your Stripe balance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white font-bold text-lg z-10">
                  4
                </div>
                <div className="pt-4">
                  <h3 className="text-[18px] font-bold text-[#201515] mb-2">You get paid (minus Stripe's fee)</h3>
                  <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                    Within 2 business days, funds from the booking (minus Stripe's 2.9% + $0.30 processing fee) hit your bank account. 
                    You see every transaction in your Stripe dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-semibold">Key Points</span>
          </div>
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10">
            What you need to know
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-[#E7E5E4]/60">
              <h3 className="text-[17px] font-bold text-[#201515] mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={BarChartIcon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
                You keep the booking amount
              </h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                The customer pays the service fee, not you. If your booking is $180, you receive $180 minus Stripe's processing fee ($5.52).
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-[#E7E5E4]/60">
              <h3 className="text-[17px] font-bold text-[#201515] mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
                We never hold your funds
              </h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                Money goes directly from your customer to your Stripe account to your bank. BookingFlow only touches our service fee.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-[#E7E5E4]/60">
              <h3 className="text-[17px] font-bold text-[#201515] mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
                Transparent at checkout
              </h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                Customers see the booking amount, service fee, and processing fee clearly displayed before they pay. No hidden charges.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-[#E7E5E4]/60">
              <h3 className="text-[17px] font-bold text-[#201515] mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={DollarCircleIcon} className="h-5 w-5 text-[#FF4F00]" strokeWidth={1.8} />
                Lower fees than competitors
              </h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                Our 1.2-1.9% service fee is significantly lower than Xola (2.39%), FareHarbor (~6%), and most booking platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Mini */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <h2 className="font-display text-[30px] sm:text-[36px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515] mb-10 text-center">
            Common questions
          </h2>

          <div className="space-y-6">
            <div className="border border-[#E7E5E4]/60 bg-white rounded-xl p-7">
              <h3 className="text-[16px] font-bold text-[#201515] mb-3">Can I pass the service fee to my customers?</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                Yes. The service fee is already charged to the customer at checkout, not to you. Most customers expect service fees on online bookings.
              </p>
            </div>

            <div className="border border-[#E7E5E4]/60 bg-white rounded-xl p-7">
              <h3 className="text-[16px] font-bold text-[#201515] mb-3">What if a customer requests a refund?</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                You control refunds from your dashboard. When you issue a refund, Stripe refunds the full amount to the customer (including fees). 
                Stripe's processing fee is not returned, but BookingFlow refunds our service fee.
              </p>
            </div>

            <div className="border border-[#E7E5E4]/60 bg-white rounded-xl p-7">
              <h3 className="text-[16px] font-bold text-[#201515] mb-3">Do I need my own Stripe account?</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                Yes. You'll connect your Stripe account (or create one) during setup. This ensures you receive payouts directly and maintain full control 
                over your funds. BookingFlow never holds your money.
              </p>
            </div>

            <div className="border border-[#E7E5E4]/60 bg-white rounded-xl p-7">
              <h3 className="text-[16px] font-bold text-[#201515] mb-3">Are there any other fees?</h3>
              <p className="text-[15px] text-[#574E4C] leading-[1.7]">
                No. You pay your monthly plan fee (or $0 for Free), and that's it. No setup fees, no cancellation fees, no transaction minimums, 
                no monthly fees from BookingFlow beyond your plan. The only other fee is Stripe's standard 2.9% + $0.30 processing fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
            Ready to get started?
          </h2>
          <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
            Start on our free plan. No credit card required. Upgrade when you're ready.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Start Free <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, CodeIcon, LockIcon, FlashIcon, WebhookIcon, BookOpenIcon, ComputerTerminalIcon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <Overview />
      <Endpoints />
      <Authentication />
      <Webhooks />
      <CTA />
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
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">API Documentation</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            Build on BookingFlow
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px]">
            Connect your POS system, build custom integrations, or sync bookings with third-party tools using our RESTful API.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Request API Access <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" strokeWidth={1.8} />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#201515] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#201515] focus:ring-offset-2"
            >
              Start Free
            </Link>
          </div>
          <p className="mt-5 sm:mt-6 text-[14px] font-medium text-[#93908C]">API access available on Business+ plans.</p>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: CodeIcon,
    title: 'RESTful API',
    description: 'Standard HTTP methods (GET, POST, PUT, DELETE). JSON request and response bodies. Predictable resource-oriented URLs.',
  },
  {
    icon: LockIcon,
    title: 'Secure authentication',
    description: 'API keys for server-to-server communication. Scoped permissions per key. Rotate keys without downtime.',
  },
  {
    icon: FlashIcon,
    title: 'Real-time updates',
    description: 'Changes to bookings, schedules, and rooms sync instantly. No polling required. Webhooks notify your system when events happen.',
  },
  {
    icon: WebhookIcon,
    title: 'Webhook support',
    description: 'Get notified when bookings are created, updated, or canceled. Build automated workflows without constant API calls.',
  },
];

function Overview() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            What you can build
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            Full access to your bookings, rooms, schedules, and customer data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 lg:gap-8 mb-16">
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

        <div className="bg-[#201515] rounded-2xl p-8 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3 mb-6">
            <HugeiconsIcon icon={ComputerTerminalIcon} size={24} className="text-[#FF4F00]" strokeWidth={1.8} />
            <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#F8F4F0]">Example Request</h3>
          </div>
          <pre className="bg-black/30 rounded-xl p-5 overflow-x-auto">
            <code className="text-[13px] sm:text-[14px] text-[#F8F4F0] font-mono leading-[1.8]">
{`curl https://bookingflowai.com/api/v1/catalog?orgId=YOUR_ORG_ID \\
  -H "Content-Type: application/json"`}
            </code>
          </pre>
          <p className="mt-4 text-[14px] text-[#F8F4F0]/60 leading-[1.6]">
            Full API documentation will be available to Business+ customers. Contact us for early access.
          </p>
        </div>
      </div>
    </section>
  );
}

const endpoints = [
  {
    category: 'Bookings',
    methods: [
      { method: 'GET', path: '/v1/bookings', description: 'List all bookings with filters (date, room, status)' },
      { method: 'GET', path: '/v1/bookings/:id', description: 'Get a single booking by ID' },
      { method: 'POST', path: '/v1/bookings', description: 'Create a new booking' },
      { method: 'PUT', path: '/v1/bookings/:id', description: 'Update a booking (reschedule, modify guests)' },
      { method: 'DELETE', path: '/v1/bookings/:id', description: 'Cancel a booking and process refund' },
    ],
  },
  {
    category: 'Rooms',
    methods: [
      { method: 'GET', path: '/v1/rooms', description: 'List all rooms/experiences' },
      { method: 'GET', path: '/v1/rooms/:id', description: 'Get room details, pricing, and availability' },
      { method: 'POST', path: '/v1/rooms', description: 'Create a new room or experience' },
      { method: 'PUT', path: '/v1/rooms/:id', description: 'Update room details or pricing' },
    ],
  },
  {
    category: 'Schedules',
    methods: [
      { method: 'GET', path: '/v1/schedules', description: 'Get availability for a date range' },
      { method: 'POST', path: '/v1/schedules/block', description: 'Block out dates for maintenance or events' },
    ],
  },
  {
    category: 'Customers',
    methods: [
      { method: 'GET', path: '/v1/customers', description: 'List all customers' },
      { method: 'GET', path: '/v1/customers/:id', description: 'Get customer profile and booking history' },
    ],
  },
];

function Endpoints() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Key API Endpoints
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            Full CRUD operations on all core resources.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12 max-w-5xl mx-auto">
          {endpoints.map((section) => (
            <div key={section.category} className="bg-white rounded-2xl border border-[#E7E5E4]/60 overflow-hidden shadow-card">
              <div className="bg-[#F8F5F0] px-6 sm:px-8 py-4 border-b border-[#E7E5E4]">
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#201515]">{section.category}</h3>
              </div>
              <div className="divide-y divide-[#E7E5E4]/50">
                {section.methods.map((method) => (
                  <div key={method.path} className="px-6 sm:px-8 py-5 hover:bg-[#F8F5F0]/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[12px] font-bold uppercase tracking-wider ${
                        method.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        method.method === 'POST' ? 'bg-green-100 text-green-700' :
                        method.method === 'PUT' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {method.method}
                      </span>
                      <div className="flex-1">
                        <code className="text-[14px] sm:text-[15px] font-mono text-[#201515] font-semibold">{method.path}</code>
                        <p className="mt-1.5 text-[14px] text-[#6F6765] leading-[1.6]">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Authentication() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-8 sm:p-10 lg:p-12 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-[#FF4F00] flex items-center justify-center shadow-md">
              <HugeiconsIcon icon={LockIcon} size={24} className="text-white" strokeWidth={1.8} />
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#201515]">Authentication</h2>
          </div>
          <p className="text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7] mb-6">
            All API requests require authentication via API keys. Generate keys from your dashboard (Business+ plan required).
          </p>

          <div className="bg-[#F8F5F0] rounded-xl p-6 mb-6">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-[#6F6765] mb-3">Include your API key in the header</p>
            <pre className="bg-[#201515] rounded-lg p-4 overflow-x-auto">
              <code className="text-[13px] sm:text-[14px] text-[#F8F4F0] font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </pre>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00] mt-2 flex-shrink-0" />
              <span>API keys are scoped to your organization. They cannot access other customers' data.</span>
            </li>
            <li className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00] mt-2 flex-shrink-0" />
              <span>You can create multiple keys with different permissions (read-only, read-write).</span>
            </li>
            <li className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00] mt-2 flex-shrink-0" />
              <span>Rotate keys anytime without downtime. Old keys continue working until revoked.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Webhooks() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-8 sm:p-10 lg:p-12 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-[#FF4F00] flex items-center justify-center shadow-md">
              <HugeiconsIcon icon={WebhookIcon} size={24} className="text-white" strokeWidth={1.8} />
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#201515]">Webhooks</h2>
          </div>
          <p className="text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7] mb-6">
            Get real-time notifications when events happen in your account. No polling required.
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-[#F8F5F0] rounded-xl p-5">
              <h4 className="text-[15px] font-semibold text-[#201515] mb-2">booking.created</h4>
              <p className="text-[14px] text-[#6F6765] leading-[1.6]">Fired when a customer completes a new booking.</p>
            </div>
            <div className="bg-[#F8F5F0] rounded-xl p-5">
              <h4 className="text-[15px] font-semibold text-[#201515] mb-2">booking.updated</h4>
              <p className="text-[14px] text-[#6F6765] leading-[1.6]">Fired when a booking is rescheduled or modified.</p>
            </div>
            <div className="bg-[#F8F5F0] rounded-xl p-5">
              <h4 className="text-[15px] font-semibold text-[#201515] mb-2">booking.canceled</h4>
              <p className="text-[14px] text-[#6F6765] leading-[1.6]">Fired when a booking is canceled and refunded.</p>
            </div>
            <div className="bg-[#F8F5F0] rounded-xl p-5">
              <h4 className="text-[15px] font-semibold text-[#201515] mb-2">payment.succeeded</h4>
              <p className="text-[14px] text-[#6F6765] leading-[1.6]">Fired when payment is successfully processed via Stripe.</p>
            </div>
          </div>

          <p className="text-[14px] text-[#6F6765] leading-[1.6]">
            Webhooks deliver a JSON payload to your endpoint via HTTP POST. We retry failed deliveries with exponential backoff.
          </p>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <HugeiconsIcon icon={BookOpenIcon} size={24} className="text-[#FF4F00]" strokeWidth={1.8} />
          <h2 className="text-[24px] sm:text-[28px] lg:text-[36px] font-semibold text-[#201515]">
            API Documentation
          </h2>
        </div>
        <p className="text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] mb-8 max-w-[520px] mx-auto">
          We're finalizing comprehensive API docs with code examples, SDKs, and interactive testing tools.
        </p>
        <p className="text-[15px] text-[#6F6765] leading-[1.6] mb-8">
          Need API access now? Contact us and we'll give you early access with personalized onboarding.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200"
        >
          Request API Access <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}

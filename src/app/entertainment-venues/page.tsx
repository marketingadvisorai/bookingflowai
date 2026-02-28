import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Tick01Icon, CalendarIcon, CreditCardIcon, UserMultipleIcon, FlashIcon, BarChartIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import { MarketingNav } from '@/app/_components/marketing-nav';
import { MarketingFooter } from '@/app/_components/marketing-footer';

export default function EntertainmentVenuesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <MarketingNav />
      <Hero />
      <VenueTypes />
      <Features />
      <UseCases />
      <DarkCTA />
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
            <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">For Entertainment Venues</span>
          </div>
          <h1 className="font-display text-[36px] sm:text-[52px] md:text-[68px] lg:text-[76px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
            Flexible booking for any activity-based business
          </h1>
          <p className="mt-6 sm:mt-8 text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px]">
            Whether you run axe throwing, VR arcades, laser tag, or something else entirely, BookingFlow handles your reservations, payments, and customer support.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
            >
              Start Free <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" strokeWidth={1.8} />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#201515] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full border-2 border-[#E7E5E4] hover:border-[#201515] hover:bg-[#F9F7F3] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#201515] focus:ring-offset-2"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-5 sm:mt-6 text-[14px] font-medium text-[#93908C]">Free plan available. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}

const venueTypes = [
  'Axe Throwing',
  'VR Arcades',
  'Laser Tag',
  'Haunted Houses',
  'Trampoline Parks',
  'Mini Golf',
  'Rage Rooms',
  'Paintball',
  'Bowling',
  'Go-Karts',
  'Rock Climbing',
  'Archery',
  'Indoor Skydiving',
  'Escape Rooms',
  'Arcade Bars',
  'Batting Cages',
];

function VenueTypes() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            Built for activity-based venues
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            If customers book a time slot and pay upfront, BookingFlow works for you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {venueTypes.map((type) => (
            <div
              key={type}
              className="bg-white rounded-xl border border-[#E7E5E4]/60 px-4 py-3.5 text-center text-[15px] font-medium text-[#201515] hover:border-[#FF4F00]/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              {type}
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[15px] text-[#6F6765] leading-[1.6] max-w-[600px] mx-auto">
          We're flexible enough to handle almost any business that takes reservations. If we can't support your use case, we'll tell you upfront.
        </p>
      </div>
    </section>
  );
}

const features = [
  {
    icon: CalendarIcon,
    title: 'Flexible scheduling',
    description: 'Set different time slots for different activities. Run multiple sessions at once. Block out specific dates for maintenance or events.',
  },
  {
    icon: UserMultipleIcon,
    title: 'Group and individual bookings',
    description: 'Handle parties of any size. Let customers book individual spots in group sessions or reserve entire lanes, rooms, or courts.',
  },
  {
    icon: CreditCardIcon,
    title: 'Deposits or full payment',
    description: 'Require full payment upfront or collect deposits for large groups. Process refunds from your dashboard if plans change.',
  },
  {
    icon: FlashIcon,
    title: 'AI customer support',
    description: 'Chatbot answers FAQs on your website. Voice agent picks up phone calls and books appointments. No staff needed for routine questions.',
  },
  {
    icon: BarChartIcon,
    title: 'Revenue analytics',
    description: 'See which time slots bring in the most money. Track peak hours, slow days, and booking trends. Make data-driven decisions.',
  },
  {
    icon: Mail01Icon,
    title: 'Automated marketing',
    description: 'Send confirmation emails, review requests, and re-engagement campaigns automatically. Bring customers back without manual work.',
  },
];

function Features() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            The features you actually need
          </h2>
          <p className="mt-4 text-[16px] sm:text-[17px] text-[#6F6765] leading-[1.7] max-w-[520px] mx-auto">
            No bloat. Just the tools that help you fill more time slots and get paid faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
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
      </div>
    </section>
  );
}

const useCases = [
  {
    venue: 'Axe Throwing Bar',
    challenge: 'Managing walk-ins and online bookings at the same time. Phone constantly ringing during busy nights.',
    solution: 'AI voice agent handles all phone bookings. Widget on website syncs with dashboard in real time. Staff focuses on customers in the venue instead of answering phones.',
    result: '40% more bookings in the first month.',
  },
  {
    venue: 'VR Arcade',
    challenge: 'Complicated pricing (per person, per station, different durations). Customers confused about what to book.',
    solution: 'Widget shows all options clearly. AI chatbot explains differences between packages. Customers pick the right option without calling.',
    result: '25% fewer abandoned bookings.',
  },
  {
    venue: 'Trampoline Park',
    challenge: 'Birthday parties need deposits. Regular jump sessions are pay-as-you-go. Hard to track in one system.',
    solution: 'Set deposit rules for party bookings. Regular sessions require full payment. Dashboard shows both types of bookings side by side.',
    result: 'Staff saves 5+ hours per week on admin work.',
  },
];

function UseCases() {
  return (
    <section className="bg-[#F8F5F0] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[48px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
            How other venues use BookingFlow
          </h2>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {useCases.map((useCase, idx) => (
            <div
              key={useCase.venue}
              className="bg-white rounded-2xl border border-[#E7E5E4]/60 p-6 sm:p-8 lg:p-10 shadow-card"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-[#FF4F00] flex items-center justify-center text-white font-bold text-[17px]">
                  {idx + 1}
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#201515]">{useCase.venue}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Challenge</p>
                  <p className="text-[15px] text-[#574E4C] leading-[1.65]">{useCase.challenge}</p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Solution</p>
                  <p className="text-[15px] text-[#574E4C] leading-[1.65]">{useCase.solution}</p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#93908C] mb-2">Result</p>
                  <p className="text-[15px] font-semibold text-[#FF4F00] leading-[1.65]">{useCase.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DarkCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[28px] sm:text-[36px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Ready to streamline your bookings?
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[#F8F4F0]/70 max-w-[540px] mx-auto">
          Start with the free plan. Add your venue details. Embed the widget. You're live in 10 minutes.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 min-h-[44px] rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Start Free <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" strokeWidth={1.8} />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-[#F8F4F0] text-[16px] sm:text-[17px] font-medium border-2 border-[#F8F4F0]/30 px-8 py-4 min-h-[44px] rounded-full hover:bg-[#F8F4F0] hover:text-[#201515] hover:border-[#F8F4F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F8F4F0] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

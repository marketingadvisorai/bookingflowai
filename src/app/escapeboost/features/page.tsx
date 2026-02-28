import Link from 'next/link';
import type { Metadata } from 'next';
import { HugeiconsIcon } from '@hugeicons/react';
import { CalendarIcon, BubbleChatIcon, SmartPhone01Icon, UserMultipleIcon, Notification01Icon, BarChartIcon, Tick01Icon, ArrowRight01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { EBLayout } from '../_components/eb-layout';

export const metadata: Metadata = {
  title: 'Features — EscapeBoost',
  description: 'Online booking widget, AI chatbot, voice agent, group manager, automated reminders, and real-time analytics. Everything you need to keep rooms booked.',
};

export default function FeaturesPage() {
  return (
    <EBLayout>
      <Hero />
      <FeatureShowcase />
      <CTABanner />
    </EBLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 lg:pt-36 pb-24 lg:pb-32">
      <div className="pointer-events-none absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,79,0,0.06),transparent_70%)] opacity-80" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center">
        <div className="flex items-center gap-2.5 justify-center mb-5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
          <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Features</span>
        </div>
        <h1 className="font-display text-[40px] md:text-[56px] lg:text-[72px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515] max-w-4xl mx-auto">
          Everything you need to stay fully booked
        </h1>
        <p className="mt-7 text-[17px] sm:text-[18px] md:text-[19px] leading-[1.7] text-[#574E4C] max-w-[560px] mx-auto">
          One platform handles booking, customer support, phone calls, and email follow-ups. You focus on running great games.
        </p>
      </div>
    </section>
  );
}

const showcases = [
  {
    icon: CalendarIcon,
    label: 'Online Booking Widget',
    title: 'Real-time availability embedded on your website',
    desc: 'Players see which rooms are open, pick a time slot, and complete their booking. The calendar updates in real-time. No double bookings. No phone calls. No manual spreadsheets.',
    points: [
      'Embeds on your website with a single line of code',
      'Matches your brand colors automatically',
      'Real-time availability across all rooms',
      'Mobile-responsive design',
      'Instant confirmation emails',
    ],
    visual: 'calendar',
  },
  {
    icon: BubbleChatIcon,
    label: 'AI Booking Chatbot',
    title: 'Answer questions and take bookings while you sleep',
    desc: 'Your AI chatbot knows your rooms, difficulty levels, pricing, and policies. It answers customer questions instantly and guides them through booking. Available 24/7, even when you are running a game.',
    points: [
      'Trained on your specific rooms and policies',
      'Checks availability and books appointments',
      'Handles multiple conversations at once',
      'Escalates complex questions to staff',
      'Works in English, Spanish, French',
    ],
    visual: 'chat',
  },
  {
    icon: SmartPhone01Icon,
    label: 'Voice Agent',
    title: 'Never miss another phone call',
    desc: 'Your AI voice agent picks up every call, answers questions about your venue, and books appointments over the phone. It sounds natural, handles the conversation, and lets your staff focus on in-person guests.',
    points: [
      'Answers calls 24/7',
      'Books appointments over the phone',
      'Provides directions, hours, parking info',
      'Transfers to staff when needed',
      'Logs every call in your dashboard',
    ],
    visual: 'phone',
  },
  {
    icon: UserMultipleIcon,
    label: 'Group Booking Manager',
    title: 'Handle corporate events and large parties with ease',
    desc: 'Corporate team building, birthday parties, bachelor parties. Large groups need custom quotes, contracts, and coordination. The group manager streamlines the process.',
    points: [
      'Custom quote generator',
      'Contract templates',
      'Multi-room coordination',
      'Deposit and payment tracking',
      'Dedicated group inbox',
    ],
    visual: 'group',
  },
  {
    icon: Notification01Icon,
    label: 'Automated Reminders',
    title: 'Reduce no-shows and collect more reviews',
    desc: 'Every booking triggers automated emails and texts. Confirmation immediately, reminder 24 hours before, review request after the game. Set it once, forget it forever.',
    points: [
      'Booking confirmation emails',
      'Reminder texts 24h before',
      'Post-game review requests',
      'Re-engagement campaigns',
      'Birthday offers',
    ],
    visual: 'reminder',
  },
  {
    icon: BarChartIcon,
    label: 'Real-time Analytics',
    title: 'Know what is working and what is not',
    desc: 'One dashboard shows bookings, revenue, peak times, and room performance. See which marketing channels drive the most bookings. Make decisions based on real data.',
    points: [
      'Revenue tracking by room and time',
      'Peak hour identification',
      'Booking source tracking',
      'No-show rate monitoring',
      'Customer lifetime value',
    ],
    visual: 'chart',
  },
];

function CSSVisual({ type }: { type: string }) {
  if (type === 'calendar') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-[#201515]">Saturday, Feb 28</p>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#E7E5E4] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors text-[#6F6765] cursor-pointer text-sm">&larr;</div>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#E7E5E4] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors text-[#6F6765] cursor-pointer text-sm">&rarr;</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((time, i) => (
            <div
              key={time}
              className={`p-3 rounded-lg text-center text-sm transition-colors ${
                i % 3 === 0 ? 'bg-[#FF4F00]/10 text-[#FF4F00] font-medium' : 'bg-[#F9F7F3] text-[#574E4C]'
              } ${i === 6 ? 'col-span-2' : ''}`}
            >
              {time}
              {i % 3 === 0 && <p className="text-xs mt-1">Available</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === 'chat') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E7E5E4]">
          <div className="h-9 w-9 rounded-full bg-[#FF4F00] flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={BubbleChatIcon} size={16} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#201515]">EscapeBoost Assistant</p>
            <p className="text-xs font-medium text-emerald-500">● Online</p>
          </div>
        </div>
        <div className="space-y-3.5">
          <div className="flex justify-end"><div className="rounded-2xl rounded-tr-md bg-[#FF4F00] px-4 py-3 text-sm text-white max-w-[220px] shadow-sm">What rooms are good for beginners?</div></div>
          <div className="flex justify-start"><div className="rounded-2xl rounded-tl-md bg-[#F8F5F0] px-4 py-3 text-sm text-[#201515] max-w-[260px]">I recommend The Library or Mystery Manor. Both are medium difficulty and great for first-timers. Want to book one?</div></div>
          <div className="flex justify-end"><div className="rounded-2xl rounded-tr-md bg-[#FF4F00] px-4 py-3 text-sm text-white max-w-[180px] shadow-sm">Yes, The Library for 4 people.</div></div>
        </div>
        <div className="mt-5 flex gap-2">
          <div className="flex-1 h-11 rounded-full bg-[#F8F5F0] px-5 flex items-center text-sm text-[#93908C]">Type a message...</div>
          <button className="h-11 w-11 rounded-full bg-[#FF4F00] flex items-center justify-center hover:bg-[#E64700] hover:scale-105 transition-all duration-200">
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="text-white" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    );
  }
  if (type === 'phone') {
    return (
      <div className="rounded-2xl bg-[#201515] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-3 mb-7">
          <div className="h-11 w-11 rounded-full bg-[#FF4F00]/20 flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={SmartPhone01Icon} size={20} className="text-[#FF4F00]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[#F8F4F0] font-semibold text-sm">Active Call</p>
            <p className="text-[#F8F4F0]/50 text-xs font-medium">+1 (555) 234-5678</p>
          </div>
          <div className="ml-auto text-xs font-mono font-bold text-[#FF4F00]">02:14</div>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { who: 'caller', text: 'Hi, do you have rooms open Friday night?' },
            { who: 'agent', text: 'We have The Vault at 7 PM and 9 PM. Would either work?' },
            { who: 'caller', text: 'The 7 PM slot. Six people.' },
            { who: 'agent', text: 'Booked. Confirmation texted to this number.' },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.who === 'caller' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-3 py-2 text-xs max-w-[200px] ${
                m.who === 'caller' ? 'bg-[#F8F4F0]/10 text-[#F8F4F0]/80' : 'bg-[#FF4F00]/15 text-[#FF4F00]'
              }`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 h-8 justify-center">
          {[3, 5, 8, 4, 7, 10, 6, 9, 5, 7, 4, 8, 6, 3, 7, 5, 9, 4, 6, 8].map((h, i) => (
            <div key={i} className="w-1 rounded-full bg-[#FF4F00]/40" style={{ height: `${h * 3}px` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === 'group') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-[#201515]">Corporate Event - Tech Co</p>
            <p className="text-xs text-[#6F6765]">24 participants, 4 rooms</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Confirmed</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#6F6765]">Date:</span><span className="text-[#201515] font-medium">March 15, 2:00 PM</span></div>
          <div className="flex justify-between"><span className="text-[#6F6765]">Deposit:</span><span className="text-emerald-600 font-medium">$400 paid</span></div>
          <div className="flex justify-between"><span className="text-[#6F6765]">Total:</span><span className="text-[#201515] font-semibold">$960</span></div>
        </div>
      </div>
    );
  }
  if (type === 'reminder') {
    return (
      <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9F7F3]">
          <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-500" strokeWidth={1.8} />
          <div className="flex-1"><p className="text-xs text-[#6F6765]">Confirmation sent</p><p className="text-sm font-medium text-[#201515]">2 min ago</p></div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E7E5E4]">
          <HugeiconsIcon icon={Clock01Icon} size={16} className="text-[#FF4F00]" strokeWidth={1.8} />
          <div className="flex-1"><p className="text-xs text-[#6F6765]">Reminder scheduled</p><p className="text-sm font-medium text-[#201515]">In 23 hours</p></div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E7E5E4]">
          <HugeiconsIcon icon={Notification01Icon} size={16} className="text-[#93908C]" strokeWidth={1.8} />
          <div className="flex-1"><p className="text-xs text-[#6F6765]">Review request</p><p className="text-sm font-medium text-[#201515]">After game ends</p></div>
        </div>
      </div>
    );
  }
  // chart
  return (
    <div className="rounded-2xl bg-white border border-[#E7E5E4]/60 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#E7E5E4] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-[#6F6765]">This Month</p>
          <p className="text-2xl font-bold text-[#201515]">87 bookings</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">+23%</div>
      </div>
      <div className="flex items-end gap-2 h-32">
        {[45, 60, 50, 70, 65, 80, 75, 90, 85, 95, 88, 92].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-[#FF4F00]/20 hover:bg-[#FF4F00]/40 transition-colors" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#93908C]">
        <span>Jan</span><span>Jun</span><span>Dec</span>
      </div>
    </div>
  );
}

function FeatureShowcase() {
  return (
    <section className="py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-24 lg:space-y-36">
        {showcases.map((s, i) => (
          <div key={s.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
            <div className={`border-l-2 border-[#FF4F00]/20 pl-6 sm:pl-8 ${i % 2 === 1 ? 'lg:[direction:ltr]' : ''}`}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">{s.label}</span>
              </div>
              <h2 className="font-display text-[26px] sm:text-[32px] lg:text-[44px] font-medium leading-[1] tracking-[-0.02em] text-[#201515]">
                {s.title}
              </h2>
              <p className="mt-5 text-[16px] sm:text-[17px] text-[#574E4C] leading-[1.7]">{s.desc}</p>
              <ul className="mt-6 sm:mt-7 space-y-3 sm:space-y-3.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] text-[#574E4C] leading-[1.6]">
                    <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#FF4F00] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
              <CSSVisual type={s.visual} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="px-6 lg:px-10 py-16">
      <div className="mx-auto max-w-7xl bg-[#201515] rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-20 py-16 sm:py-20 lg:py-24 text-center">
        <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[56px] font-medium leading-[0.95] tracking-[-0.02em] text-[#F8F4F0]">
          Ready to automate your bookings?
        </h2>
        <p className="mt-5 text-[17px] sm:text-[18px] leading-[1.7] text-[#F8F4F0]/70 max-w-[500px] mx-auto">
          Setup takes 15 minutes. Start with the free plan. Upgrade when you need more.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-[#FF4F00] text-[#FFFDFB] text-[16px] sm:text-[17px] font-semibold px-8 py-4 rounded-full hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            Get Started Free <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" strokeWidth={1.8} />
          </Link>
          <Link
            href="/escapeboost/pricing"
            className="inline-flex items-center justify-center bg-transparent text-[#F8F4F0] text-[16px] sm:text-[17px] font-medium border-2 border-[#F8F4F0]/30 px-8 py-4 rounded-full hover:bg-[#F8F4F0] hover:text-[#201515] hover:border-[#F8F4F0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F8F4F0] focus:ring-offset-2 focus:ring-offset-[#201515]"
          >
            See Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fireGoogleAdsConversion } from '@/components/google-ads-script';

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: 'Business Info' },
  { num: 2, label: 'Choose Plan' },
  { num: 3, label: 'Payment' },
];

type BusinessInfo = {
  businessName: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  locationCount: string;
  roomCount: string;
  businessType: string;
};

type PlanId = 'free' | 'pro' | 'business';

const PLANS: { id: PlanId; name: string; price: string; priceNote: string; popular?: boolean; features: string[] }[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'forever',
    features: ['150 bookings/mo', '1.9% customer fee', 'Online booking widget', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    priceNote: '/month',
    popular: true,
    features: ['Unlimited bookings', '1.5% customer fee', 'AI chatbot (24/7)', 'Priority support', 'Analytics dashboard'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$99',
    priceNote: '/month',
    features: ['Unlimited bookings', '1.2% customer fee', 'AI voice agent', 'Email marketing', 'API access', 'Custom branding'],
  },
];

function ProgressBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ' +
                (step.num === current
                  ? 'bg-[#FF4F00] text-white'
                  : step.num < current
                    ? 'bg-[#FF4F00]/10 text-[#FF4F00]'
                    : 'bg-[#F0EEEC] text-[#93908C]')
              }
            >
              {step.num < current ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span
              className={
                'hidden text-sm font-medium sm:block ' +
                (step.num === current ? 'text-[#201515]' : 'text-[#93908C]')
              }
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={
                'mx-1 h-px w-8 sm:w-12 transition-colors duration-300 ' +
                (step.num < current ? 'bg-[#FF4F00]/30' : 'bg-[#E7E5E4]')
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StepBusinessInfo({
  data,
  onChange,
  onContinue,
  saving,
}: {
  data: BusinessInfo;
  onChange: (d: BusinessInfo) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const set = (key: keyof BusinessInfo, val: string) => onChange({ ...data, [key]: val });

  const phoneValid = /^\+?[\d\s\-()]{7,20}$/.test(data.phone.trim());
  const addressValid = data.address.trim().length >= 5;
  const cityValid = data.city.trim().length >= 2;
  const stateValid = data.state.trim().length >= 2;
  const countryValid = data.country.trim().length >= 2;
  const businessNameValid = data.businessName.trim().length >= 2;
  const canContinue = businessNameValid && phoneValid && addressValid && cityValid && stateValid && countryValid && data.locationCount && data.roomCount && data.businessType;

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold text-[#201515] sm:text-3xl">Tell us about your business</h1>
      <p className="mt-2 text-sm text-[#6F6765]">
        This helps us set up your workspace. You can change these later.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#413735]">
            Business name <span className="text-[#FF4F00]">*</span>
          </label>
          <input
            type="text"
            value={data.businessName}
            onChange={(e) => set('businessName', e.target.value)}
            placeholder="Acme Escape Rooms"
            className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#413735]">Website URL</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://yoursite.com"
            className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#413735]">
            Phone number <span className="text-[#FF4F00]">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#FF4F00]/20 ${data.phone && !phoneValid ? 'border-red-400 focus:border-red-400' : 'border-[#E7E5E4] focus:border-[#FF4F00]'}`}
          />
          {data.phone && !phoneValid && (
            <p className="mt-1 text-xs text-red-500">Enter a valid phone number (7-20 digits)</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#413735]">
            Business address <span className="text-[#FF4F00]">*</span>
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="123 Main Street, Suite 100"
            className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#413735]">
              City <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="New York"
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#413735]">
              State / Province <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => set('state', e.target.value)}
              placeholder="NY"
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#413735]">
              Country <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              type="text"
              value={data.country}
              onChange={(e) => set('country', e.target.value)}
              placeholder="United States"
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#413735]">
              Number of locations <span className="text-[#FF4F00]">*</span>
            </label>
            <select
              value={data.locationCount}
              onChange={(e) => set('locationCount', e.target.value)}
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            >
              <option value="">Select...</option>
              <option value="1">1</option>
              <option value="2-5">2 - 5</option>
              <option value="6-10">6 - 10</option>
              <option value="11+">11+</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#413735]">
              Rooms per location <span className="text-[#FF4F00]">*</span>
            </label>
            <select
              value={data.roomCount}
              onChange={(e) => set('roomCount', e.target.value)}
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            >
              <option value="">Select...</option>
              <option value="1-3">1 - 3</option>
              <option value="4-6">4 - 6</option>
              <option value="7-10">7 - 10</option>
              <option value="11+">11+</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#413735]">Business type</label>
          <select
            value={data.businessType}
            onChange={(e) => set('businessType', e.target.value)}
            className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
          >
            <option value="">Select...</option>
            <option value="escape_room">Escape Room</option>
            <option value="rage_room">Rage Room / Smash Room</option>
            <option value="axe_throwing">Axe Throwing</option>
            <option value="laser_tag">Laser Tag</option>
            <option value="trampoline_park">Trampoline Park</option>
            <option value="go_kart">Go-Kart / Racing</option>
            <option value="mini_golf">Mini Golf</option>
            <option value="bowling">Bowling</option>
            <option value="vr_arcade">VR / Arcade</option>
            <option value="haunted_attraction">Haunted Attraction</option>
            <option value="paintball">Paintball / Airsoft</option>
            <option value="entertainment_venue">Other Entertainment Venue</option>
          </select>
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={!canContinue || saving}
        className="mt-8 h-12 w-full rounded-full bg-[#FF4F00] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}

function StepChoosePlan({
  selectedPlan,
  onSelect,
  onContinue,
  saving,
}: {
  selectedPlan: PlanId;
  onSelect: (p: PlanId) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold text-[#201515] sm:text-3xl">Choose your plan</h1>
      <p className="mt-2 text-sm text-[#6F6765]">
        Start free, upgrade anytime. All plans include the core booking engine.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan.id)}
            className={
              'relative flex flex-col rounded-xl border-2 p-5 text-left transition-all duration-200 ' +
              (selectedPlan === plan.id
                ? 'border-[#FF4F00] bg-[#FF4F00]/[0.03] shadow-md'
                : 'border-[#E7E5E4] bg-white hover:border-[#CFCBC8]')
            }
          >
            {plan.popular && (
              <span className="absolute -top-3 left-4 rounded-full bg-[#FF4F00] px-3 py-0.5 text-xs font-semibold text-white">
                Popular
              </span>
            )}
            <div className="text-lg font-bold text-[#201515]">{plan.name}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#201515]">{plan.price}</span>
              <span className="text-sm text-[#6F6765]">{plan.priceNote}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#574E4C]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-[#FF4F00]">
                    <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={saving}
        className="mt-8 h-12 w-full rounded-full bg-[#FF4F00] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : `Continue with ${PLANS.find((p) => p.id === selectedPlan)?.name}`}
      </button>
    </div>
  );
}

function StepPayment({
  selectedPlan,
  onFinish,
  onSkip,
  hasError,
}: {
  selectedPlan: PlanId;
  onFinish: () => void;
  onSkip?: () => void;
  hasError?: boolean;
}) {
  if (selectedPlan === 'free') {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4F00]/10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#FF4F00]">
            <path d="M8 16l6 6 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#201515] sm:text-3xl">You&apos;re all set!</h1>
        <p className="mt-2 text-sm text-[#6F6765]">
          Your free workspace is ready. Start adding rooms and accepting bookings.
        </p>
        <button
          onClick={onFinish}
          className="mt-8 h-12 w-full rounded-full bg-[#FF4F00] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary"
        >
          Go to Dashboard
        </button>
        {hasError && onSkip && (
          <button
            onClick={onSkip}
            className="mt-3 w-full text-center text-sm font-medium text-[#FF4F00] hover:text-[#E64700] transition-colors"
          >
            Skip to dashboard anyway
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold text-[#201515] sm:text-3xl">Set up payment</h1>
      <p className="mt-2 text-sm text-[#6F6765]">
        Your {selectedPlan === 'pro' ? 'Pro' : 'Business'} plan includes a 14-day free trial. We&apos;ll add Stripe billing soon.
      </p>

      <div className="mt-8 rounded-xl border border-[#E7E5E4] bg-[#F9F7F3] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E7E5E4]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#93908C]">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-[#574E4C]">Payment integration available after setup</p>
        <p className="mt-1 text-xs text-[#93908C]">Stripe checkout will be available here</p>
      </div>

      <button
        onClick={onFinish}
        className="mt-6 h-12 w-full rounded-full bg-[#FF4F00] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary"
      >
        Go to Dashboard
      </button>

      <button
        onClick={onFinish}
        className="mt-3 w-full text-center text-sm text-[#6F6765] hover:text-[#413735] transition-colors"
      >
        Skip for now and start with free
      </button>
      {hasError && onSkip && (
        <button
          onClick={onSkip}
          className="mt-3 w-full text-center text-sm font-medium text-[#FF4F00] hover:text-[#E64700] transition-colors"
        >
          Skip to dashboard anyway
        </button>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    locationCount: '',
    roomCount: '',
    businessType: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('free');

  async function saveToApi(data: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setError('Failed to save. Please try again.');
        return false;
      }
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function handleStep1Continue() {
    const ok = await saveToApi(businessInfo);
    if (ok) setStep(2);
  }

  async function handleStep2Continue() {
    const ok = await saveToApi({ plan: selectedPlan, planCycle: 'monthly' });
    if (ok) setStep(3);
  }

  async function handleFinish() {
    // First attempt
    let ok = await saveToApi({ onboardingComplete: true });
    
    if (!ok) {
      // Retry once — this flag is critical to avoid onboarding loops
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      ok = await saveToApi({ onboardingComplete: true });
    }
    
    if (!ok) {
      // Second retry with longer delay
      await new Promise(r => setTimeout(r, 2000));
      ok = await saveToApi({ onboardingComplete: true });
    }
    
    // If still failed after 3 attempts, use localStorage as fallback
    if (!ok) {
      console.error('[Onboarding] Failed to save onboardingComplete after 3 attempts, using localStorage fallback');
      try {
        localStorage.setItem('bf-onboarding-force-complete', 'true');
      } catch {
        // Ignore localStorage errors
      }
      // Show error but still allow skip
      setError('Could not save onboarding status. Please check your connection and try again.');
      return; // Don't auto-redirect, let user click "Skip to dashboard anyway"
    }
    
    // Success - redirect to dashboard
    fireGoogleAdsConversion(50);
    router.replace('/dashboard');
    router.refresh();
  }

  async function handleSkipToBoard() {
    // Emergency fallback: try to set flag via local storage as a signal, then redirect
    // The dashboard will detect this and back-fill the flag
    try {
      localStorage.setItem('bf-onboarding-force-complete', 'true');
    } catch {
      // Ignore localStorage errors
    }
    fireGoogleAdsConversion(50);
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 hover:opacity-90 transition-opacity duration-200">
            <span className="font-extrabold text-xl text-[#201515] tracking-tight">booking</span>
            <span className="relative font-normal text-xl text-[#201515] tracking-tight">
              flow
              <span className="absolute -top-1 left-[5px] w-1.5 h-1.5 rounded-full bg-[#FF4A00]"></span>
            </span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <ProgressBar current={step} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <StepBusinessInfo
            data={businessInfo}
            onChange={setBusinessInfo}
            onContinue={handleStep1Continue}
            saving={saving}
          />
        )}
        {step === 2 && (
          <StepChoosePlan
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            onContinue={handleStep2Continue}
            saving={saving}
          />
        )}
        {step === 3 && (
          <StepPayment
            selectedPlan={selectedPlan}
            onFinish={handleFinish}
            onSkip={handleSkipToBoard}
            hasError={!!error}
          />
        )}
      </div>
    </div>
  );
}

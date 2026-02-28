'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function SignupForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      const body = (await res.json().catch(() => null)) as unknown;
      const apiError =
        typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
      if (!res.ok) {
        setError(apiError === 'email_in_use' ? 'An account with this email already exists.' : apiError || 'Signup failed. Please try again.');
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <div className="mx-auto flex min-h-screen max-w-md mx-auto flex-col items-center justify-center px-6 py-8 sm:py-12">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-0 hover:opacity-90 transition-opacity duration-200">
          <span className="font-extrabold text-xl text-[#201515] tracking-tight">booking</span>
          <span className="relative font-normal text-xl text-[#201515] tracking-tight">
            flow
            <span className="absolute -top-1 left-[5px] w-1.5 h-1.5 rounded-full bg-[#FF4A00]"></span>
          </span>
        </Link>

        {/* Google sign up */}
        <a
          href={`/api/auth/google/start?next=${encodeURIComponent(nextPath)}`}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E7E5E4] bg-white px-6 py-3.5 text-sm font-semibold text-[#201515] shadow-sm transition-all duration-200 hover:bg-[#F9F7F3] hover:shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </a>

        {/* Divider */}
        <div className="my-6 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-[#E7E5E4]" />
          <span className="text-xs font-medium text-[#93908C]">OR</span>
          <div className="h-px flex-1 bg-[#E7E5E4]" />
        </div>

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#413735]">
              Email <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-[#413735]">
                First name <span className="text-[#FF4F00]">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Jane"
                className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-[#413735]">
                Last name <span className="text-[#FF4F00]">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Smith"
                className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#413735]">
              Password <span className="text-[#FF4F00]">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="h-12 w-full rounded-lg border border-[#E7E5E4] bg-white px-4 text-sm text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-[#FF4F00] text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? 'Creating your account...' : 'Get started for free'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#6F6765]">
          Already have an account?{' '}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-medium text-[#FF4F00] hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

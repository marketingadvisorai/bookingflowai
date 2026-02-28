'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const body = (await res.json().catch(() => null)) as unknown;
      const err =
        typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
      if (!res.ok) {
        setError(err || 'Request failed');
        return;
      }
      setDone(true);
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

        <h1 className="mb-2 text-2xl font-bold text-[#201515]">Forgot password</h1>
        <p className="mb-8 text-sm text-[#6F6765]">We&apos;ll email you a reset link.</p>

        {done ? (
          <div className="w-full rounded-lg bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
            If an account exists for that email, a reset link has been sent.
          </div>
        ) : (
          <form className="w-full space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#413735]">
                Email
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
              {pending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-[#6F6765]">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-[#FF4F00] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

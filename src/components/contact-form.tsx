'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { MailSend01Icon, CheckmarkCircle02Icon, AlertCircleIcon, Loading03Icon } from '@hugeicons/core-free-icons';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      businessName: fd.get('business'),
      message: fd.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} className="text-emerald-500" strokeWidth={1.8} />
        <h3 className="mt-4 text-xl font-semibold text-[#111827]">Thanks! We&apos;ll be in touch within 24 hours.</h3>
        <p className="mt-2 text-[#6B7280]">Check your inbox for a confirmation.</p>
        <Button
          onClick={() => setStatus('idle')}
          variant="outline"
          className="mt-6 rounded-full"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-[#111827]">
            Name <span className="text-red-400">*</span>
          </label>
          <Input
            id="cf-name"
            name="name"
            required
            placeholder="Your name"
            className="rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-[#111827]">
            Email <span className="text-red-400">*</span>
          </label>
          <Input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"
          />
        </div>
        <div>
          <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium text-[#111827]">
            Phone <span className="text-[#6B7280] text-xs font-normal">(optional)</span>
          </label>
          <Input
            id="cf-phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"
          />
        </div>
        <div>
          <label htmlFor="cf-business" className="mb-1.5 block text-sm font-medium text-[#111827]">
            Business Name <span className="text-[#6B7280] text-xs font-normal">(optional)</span>
          </label>
          <Input
            id="cf-business"
            name="business"
            placeholder="Your escape room business"
            className="rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"
          />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-[#111827]">
          Message <span className="text-[#6B7280] text-xs font-normal">(optional)</span>
        </label>
        <Textarea
          id="cf-message"
          name="message"
          rows={4}
          placeholder="Tell us about your business and what you're looking for..."
          className="rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"
        />
      </div>

      {status === 'error' && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <HugeiconsIcon icon={AlertCircleIcon} size={16} className="flex-shrink-0" strokeWidth={1.8} />
          {errorMsg}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="h-12 w-full rounded-full bg-[#FF6B35] text-base font-medium text-white shadow-lg shadow-orange-200 hover:bg-[#e55a2b] disabled:opacity-70"
        >
          {status === 'loading' ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={16} className="mr-2 animate-spin" strokeWidth={1.8} />
              Sending...
            </>
          ) : (
            <>
              <HugeiconsIcon icon={MailSend01Icon} size={16} className="mr-2" strokeWidth={1.8} />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

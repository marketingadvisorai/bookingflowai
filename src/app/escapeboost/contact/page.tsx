'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, BubbleChatIcon } from '@hugeicons/core-free-icons';
import { EBLayout } from '../_components/eb-layout';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <EBLayout>
      <section className="relative overflow-hidden pt-28 lg:pt-36 pb-24 lg:pb-32">
        <div className="pointer-events-none absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,79,0,0.06),transparent_70%)] opacity-80" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left - Info */}
            <div>
              <div className="flex items-center gap-2.5 mb-7">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs uppercase tracking-[0.15em] text-[#FF4F00] font-bold">Contact</span>
              </div>
              <h1 className="font-display text-[40px] sm:text-[52px] md:text-[60px] lg:text-[64px] font-medium leading-[0.92] tracking-[-0.03em] text-[#201515]">
                Let&apos;s talk about your rooms
              </h1>
              <p className="mt-7 text-[17px] sm:text-[18px] text-[#574E4C] leading-[1.7] max-w-[500px]">
                Whether you have 2 rooms or 20 locations, we&apos;d love to hear about your business and
                show you how EscapeBoost can help.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#FF4F00]/10 flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon icon={Mail01Icon} size={18} className="text-[#FF4F00]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#201515]">Email us</p>
                    <a href="mailto:support@escapeboost.com" className="text-[15px] text-[#6F6765] hover:text-[#FF4F00] transition-colors">
                      support@escapeboost.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#FF4F00]/10 flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon icon={BubbleChatIcon} size={18} className="text-[#FF4F00]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#201515]">Response time</p>
                    <p className="text-[15px] text-[#6F6765]">We typically respond within a few hours during business days.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-white border border-[#E7E5E4]/60 rounded-2xl p-7 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                    <span className="text-emerald-500 text-2xl">✓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#201515]">Message sent</h3>
                  <p className="mt-2 text-[15px] text-[#6F6765]">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-[#201515] mb-2">Name</label>
                    <input
                      type="text"
                      required
                      className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-white px-4 text-[15px] text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#201515] mb-2">Email</label>
                    <input
                      type="email"
                      required
                      className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-white px-4 text-[15px] text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#201515] mb-2">Escape room name</label>
                    <input
                      type="text"
                      className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-white px-4 text-[15px] text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20"
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#201515] mb-2">How many rooms?</label>
                    <select className="h-12 w-full rounded-xl border border-[#E7E5E4] bg-white px-4 text-[15px] text-[#201515] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20">
                      <option value="">Select</option>
                      <option value="1-3">1-3 rooms</option>
                      <option value="4-8">4-8 rooms</option>
                      <option value="9+">9+ rooms</option>
                      <option value="multi">Multiple locations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#201515] mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-[#E7E5E4] bg-white px-4 py-3 text-[15px] text-[#201515] placeholder:text-[#B5B2AF] outline-none transition-all duration-200 focus:border-[#FF4F00] focus:ring-2 focus:ring-[#FF4F00]/20 resize-none"
                      placeholder="Tell us about your business and what you're looking for..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-14 w-full rounded-full bg-[#FF4F00] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#E64700] hover:shadow-primary hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:ring-offset-2"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </EBLayout>
  );
}

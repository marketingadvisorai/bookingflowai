'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

const STORAGE_KEY = 'bf_sandbox_banner_dismissed';

export function SandboxBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm bg-[#FFF4ED] border-[#FF4F00]/20 text-[#201515] dark:bg-[#FF4F00]/10 dark:border-[#FF4F00]/20 dark:text-white">
      <p>
        <span className="font-medium">Sandbox mode.</span>{' '}
        Explore everything, set up your venue, and go live when you&apos;re ready.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}

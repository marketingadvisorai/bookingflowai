'use client';

import { useState } from 'react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-[#201515] font-semibold underline decoration-[#E7E5E4] underline-offset-2 hover:decoration-[#FF4F00] hover:text-[#FF4F00] transition-colors cursor-pointer"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}

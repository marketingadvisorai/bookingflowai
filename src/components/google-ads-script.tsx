'use client';

import { useEffect } from 'react';

const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Loads the Google Ads gtag.js snippet client-side.
 * Only activates when NEXT_PUBLIC_GOOGLE_ADS_ID is set.
 */
export function GoogleAdsScript() {
  useEffect(() => {
    if (!adsId) return;

    // Inject gtag.js
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
    document.head.appendChild(s);

    // Init dataLayer + config
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', adsId);
  }, []);

  return null;
}

/**
 * Fire a Google Ads conversion event.
 * Safe to call even if gtag isn't loaded.
 */
export function fireGoogleAdsConversion(value?: number) {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!id || !label) return;

  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'conversion', {
      send_to: `${id}/${label}`,
      ...(value != null ? { value, currency: 'USD' } : {}),
    });
  }
}
// Google Ads: AW-17834197278

'use client';

import { useEffect, useState } from 'react';

export function useThemeToggle(themeParam: string | null) {
  const initialOverride: 'light' | 'dark' | null =
    themeParam === 'dark' ? 'dark' : themeParam === 'light' ? 'light' : null;

  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(initialOverride);

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme: 'light' | 'dark' = themeOverride ?? systemTheme;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setSystemTheme(mq.matches ? 'dark' : 'light');
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (themeOverride) url.searchParams.set('theme', themeOverride);
      else url.searchParams.delete('theme');
      window.history.replaceState({}, '', url.toString());
    } catch { /* ignore */ }
  }, [themeOverride]);

  const toggleTheme = () => {
    setThemeOverride((m) =>
      m == null ? (systemTheme === 'dark' ? 'light' : 'dark') : m === 'dark' ? 'light' : 'dark'
    );
  };

  return { theme, toggleTheme, systemTheme };
}

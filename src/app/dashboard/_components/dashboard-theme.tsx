'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'bf-dashboard-theme';
const RADIUS_MAP: Record<string, string> = { default: '0.5rem', pill: '9999px', square: '0px' };
const DENSITY_MAP: Record<string, string> = { comfortable: '1', compact: '0.85' };

function applyTheme() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    const root = document.querySelector('.dashboard-root') as HTMLElement | null;
    if (!root) return;
    root.style.setProperty('--dash-accent', prefs.accent || '#FF4F00');
    root.style.setProperty('--dash-radius', RADIUS_MAP[prefs.buttonStyle] || '0.5rem');
    root.style.setProperty('--dash-density', DENSITY_MAP[prefs.density] || '1');
  } catch {}
}

export function DashboardThemeProvider() {
  useEffect(() => {
    applyTheme();
    const handler = () => applyTheme();
    window.addEventListener('bf-theme-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('bf-theme-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return null;
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STORAGE_KEY = 'bf-dashboard-theme';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentOption = { label: string; value: string };
type ButtonStyle = 'default' | 'pill' | 'square';
type Density = 'comfortable' | 'compact';

const ACCENTS: AccentOption[] = [
  { label: 'Orange', value: '#FF4F00' },
  { label: 'Red', value: '#DC2626' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Amber', value: '#D97706' },
];

type Prefs = { mode: ThemeMode; accent: string; buttonStyle: ButtonStyle; density: Density };

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return { mode: 'system', accent: '#FF4F00', buttonStyle: 'default', density: 'comfortable' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...{ mode: 'system', accent: '#FF4F00', buttonStyle: 'default', density: 'comfortable' }, ...JSON.parse(raw) };
  } catch {}
  return { mode: 'system', accent: '#FF4F00', buttonStyle: 'default', density: 'comfortable' };
}

function savePrefs(p: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  document.cookie = `bf-dash-theme=${p.mode};path=/;max-age=31536000;samesite=lax`;
  window.dispatchEvent(new CustomEvent('bf-theme-change', { detail: p }));
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
        active ? 'bg-[var(--dash-accent,#FF4F00)]/10 text-[var(--dash-accent,#FF4F00)]' : 'bg-foreground/[0.04] text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

export function AppearanceUI() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setPrefs(loadPrefs()); }, []);

  function update(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Theme Mode</CardTitle>
          <CardDescription>Choose how the dashboard looks</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <Pill key={m} active={prefs.mode === m} onClick={() => update({ mode: m })}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Pill>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Accent Color</CardTitle>
          <CardDescription>Applied to buttons, links, and active states in the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => update({ accent: a.value })}
                className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                  prefs.accent === a.value ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                }`}
                style={prefs.accent === a.value ? { '--tw-ring-color': a.value } as React.CSSProperties : undefined}
              >
                <div className="h-8 w-8 rounded-full border-2 border-border" style={{ backgroundColor: a.value }} />
                <span className="text-xs text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Button Style</CardTitle>
          <CardDescription>Controls corner rounding across dashboard buttons</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="flex gap-2">
            {([['default', 'Default'], ['pill', 'Pill'], ['square', 'Square']] as [ButtonStyle, string][]).map(([v, l]) => (
              <Pill key={v} active={prefs.buttonStyle === v} onClick={() => update({ buttonStyle: v })}>{l}</Pill>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-base font-semibold">Density</CardTitle>
          <CardDescription>Adjust spacing and sizing of UI elements</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <div className="flex gap-2">
            <Pill active={prefs.density === 'comfortable'} onClick={() => update({ density: 'comfortable' })}>Comfortable</Pill>
            <Pill active={prefs.density === 'compact'} onClick={() => update({ density: 'compact' })}>Compact</Pill>
          </div>
        </CardContent>
      </Card>

      {saved && <div className="text-sm text-emerald-600 dark:text-emerald-300">Preferences saved</div>}
    </div>
  );
}

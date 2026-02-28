'use client';

import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun01Icon, MoonIcon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = (theme === 'system' ? resolvedTheme : theme) ?? 'dark';
  const isDark = current === 'dark';

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <span className="flex items-center gap-2">
        {isDark ? <HugeiconsIcon icon={MoonIcon} size={16} strokeWidth={1.8} /> : <HugeiconsIcon icon={Sun01Icon} size={16} strokeWidth={1.8} />}
        <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
      </span>
    </Button>
  );
}

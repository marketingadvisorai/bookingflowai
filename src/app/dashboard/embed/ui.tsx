'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type GameOpt = { gameId: string; name: string };
type Props = { baseUrl: string; orgId: string; games: GameOpt[] };

function copy(text: string) {
  return navigator.clipboard.writeText(text);
}

export function EmbedCodeBuilder({ baseUrl, orgId, games }: Props) {
  const [gameId, setGameId] = useState<string>(games[0]?.gameId ?? '');
  const [variant, setVariant] = useState<'script' | 'iframe'>('script');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [widgetTheme, setWidgetTheme] = useState<'original' | 'wizard' | 'classic'>('original');
  const [primaryColor, setPrimaryColor] = useState<string>('');
  const [radius, setRadius] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const widgetUrl = useMemo(() => {
    const u = new URL(gameId ? '/widget' : '/book', baseUrl);
    u.searchParams.set('orgId', orgId);
    if (gameId) u.searchParams.set('gameId', gameId);
    if (theme !== 'dark') u.searchParams.set('theme', theme);
    if (widgetTheme !== 'original') u.searchParams.set('layout', widgetTheme);
    if (primaryColor) u.searchParams.set('primaryColor', primaryColor);
    if (radius) u.searchParams.set('radius', radius);
    return u.toString();
  }, [orgId, gameId, theme, widgetTheme, primaryColor, radius]);

  const scriptUrl = new URL(baseUrl);
  scriptUrl.hostname = `script.${scriptUrl.hostname}`;
  const scriptSrc = `${scriptUrl.origin}/v1/widget.js`;

  const code = useMemo(() => {
    if (variant === 'iframe') {
      return `<iframe src="${widgetUrl}" style="width:100%;max-width:520px;height:740px;border:0;border-radius:16px;" loading="lazy"></iframe>`;
    }
    const attrs = [
      `data-org-id="${orgId}"`,
      `data-api-base="${new URL(baseUrl).origin.replace('://', '://console.')}"`,
      gameId && `data-game-id="${gameId}"`,
      theme !== 'dark' && `data-theme="${theme}"`,
      primaryColor && `data-primary-color="${primaryColor}"`,
      radius && `data-radius="${radius}"`,
    ].filter(Boolean).join(' ');
    return `<!-- BookingFlow Widget -->\n<div id="bookingflow-widget" ${attrs}></div>\n<script async src="${scriptSrc}"></script>`;
  }, [variant, widgetUrl, orgId, gameId, theme, primaryColor, radius, scriptSrc]);

  async function onCopy() {
    await copy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  /* Shared sub-components for reuse across mobile tabs and desktop layout */
  const configPanel = (
    <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/80 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="grid gap-4">
        <FieldGroup label="Game">
          <select
            className="h-11 w-full rounded-md border border-input bg-white dark:bg-background/50 dark:backdrop-blur px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">All games (Book Now page)</option>
            {games.map((g) => (
              <option key={g.gameId} value={g.gameId}>{g.name}</option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label="Color Mode">
          <ToggleGroup
            options={[
              { value: 'dark', label: 'Dark (default)' },
              { value: 'light', label: 'Light' },
            ]}
            value={theme}
            onChange={(v) => setTheme(v as 'dark' | 'light')}
          />
        </FieldGroup>

        <FieldGroup label="Layout">
          <ToggleGroup
            options={[
              { value: 'original', label: 'Original' },
              { value: 'wizard', label: 'Wizard' },
              { value: 'classic', label: 'Classic' },
            ]}
            value={widgetTheme}
            onChange={(v) => setWidgetTheme(v as 'original' | 'wizard' | 'classic')}
          />
        </FieldGroup>

        <FieldGroup label="Brand (optional)">
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="min-w-16 text-xs text-muted-foreground">Primary</div>
              <input
                type="color"
                value={primaryColor || '#FF4F00'}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-md border border-input bg-transparent md:h-8 md:w-12"
                aria-label="Primary color"
              />
              <button type="button" onClick={() => setPrimaryColor('')} className="ml-auto text-xs text-muted-foreground underline min-h-[44px]">Reset</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="min-w-16 text-xs text-muted-foreground">Radius</div>
              <input type="number" inputMode="numeric" min={8} max={40} step={1} placeholder="28" value={radius} onChange={(e) => setRadius(e.target.value)} className="h-11 w-20 rounded-md border border-input bg-white dark:bg-background/50 dark:backdrop-blur px-3 text-sm text-foreground outline-none md:h-9" aria-label="Radius" />
              <span className="text-xs text-muted-foreground">px</span>
              <button type="button" onClick={() => setRadius('')} className="ml-auto text-xs text-muted-foreground underline min-h-[44px]">Reset</button>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup label="Embed Method">
          <ToggleGroup
            options={[
              { value: 'script', label: 'Script (recommended)' },
              { value: 'iframe', label: 'Iframe' },
            ]}
            value={variant}
            onChange={(v) => setVariant(v as 'script' | 'iframe')}
          />
        </FieldGroup>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/80 backdrop-blur-xl p-3 sm:p-4 flex flex-col">
      <div className="flex items-center justify-end">
        <a
          href={widgetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#FF4F00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E64600] transition-colors min-h-[44px] inline-flex items-center"
        >
          Open in new tab ↗
        </a>
      </div>
      <div className="mt-3 rounded-xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
        <iframe
          src={widgetUrl}
          className="h-full w-full border-0"
          title="Widget preview"
          loading="lazy"
        />
      </div>
    </div>
  );

  const codePanel = (
    <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/80 backdrop-blur-xl p-3 sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Paste into your website editor (WordPress, Webflow, etc.).</div>
        </div>
        <Button type="button" onClick={onCopy} className="h-11 w-full md:h-10 md:w-auto min-h-[44px]">
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-black/5 dark:bg-black/30 dark:backdrop-blur p-3 text-xs text-foreground md:p-4 whitespace-pre-wrap break-all" style={{ WebkitOverflowScrolling: 'touch' }}>
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="grid gap-4 md:gap-6 w-full max-w-full overflow-hidden">
      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="configure">
          {configPanel}
        </TabsContent>
        <TabsContent value="preview">
          {previewPanel}
        </TabsContent>
        <TabsContent value="code">
          {codePanel}
        </TabsContent>
      </Tabs>

      <div className="rounded-2xl border border-border bg-card/80 dark:bg-card/80 backdrop-blur-xl p-3 sm:p-4 text-xs text-muted-foreground">
        Tip: If your website builder blocks scripts, use the iframe embed.
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ToggleGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className={`grid gap-1.5 sm:gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            'min-h-[44px] rounded-full border px-2 sm:px-3 text-[11px] sm:text-xs font-medium leading-tight ' +
            (value === opt.value
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-white/80 dark:bg-transparent text-muted-foreground')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

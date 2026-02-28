'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Props = { orgId: string; baseUrl: string };

export function GiftCardEmbed({ orgId, baseUrl }: Props) {
  const [variant, setVariant] = useState<'iframe' | 'link'>('iframe');
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    return `${baseUrl}/gift-cards?orgId=${orgId}`;
  }, [orgId]);

  const code = useMemo(() => {
    if (variant === 'link') {
      return `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;background:#FF4F00;color:#fff;border-radius:12px;font-weight:600;text-decoration:none;font-family:sans-serif;">Buy Gift Card</a>`;
    }
    return `<iframe src="${url}" style="width:100%;max-width:480px;height:640px;border:0;border-radius:16px;" loading="lazy"></iframe>`;
  }, [variant, url]);

  async function onCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Gift Card Widget</CardTitle>
        <CardDescription>
          Let customers purchase gift cards from your website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(['iframe', 'link'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`min-h-[44px] rounded-full border px-4 text-xs font-medium ${
                variant === v
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {v === 'iframe' ? 'Embed (iframe)' : 'Button link'}
            </button>
          ))}
        </div>

        <pre className="overflow-x-auto rounded-xl border border-border bg-black/5 dark:bg-black/30 p-3 text-xs whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>

        <Button type="button" onClick={onCopy} className="min-h-[44px]">
          {copied ? 'Copied!' : 'Copy code'}
        </Button>
      </CardContent>
    </Card>
  );
}

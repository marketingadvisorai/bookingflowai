'use client';

type Props = {
  amountCents: number;
  recipientName?: string;
  purchaserName?: string;
  venueName?: string;
  code: string;
  personalMessage?: string;
};

export function GiftCardPreviewCard({
  amountCents,
  recipientName,
  purchaserName,
  venueName = 'Gift Card',
  code,
  personalMessage,
}: Props) {
  const amount = `$${(amountCents / 100).toFixed(0)}`;

  return (
    <div className="space-y-4">
      {/* Card visual */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FF4F00 0%, #E64600 50%, #CC3D00 100%)',
          minHeight: '260px',
        }}
      >
        {/* Decorative */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-8 h-32 w-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-12 left-12 h-40 w-40 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl">🎁</div>
              <div className="mt-1 text-sm font-medium opacity-95">{venueName}</div>
            </div>
            <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Gift Card
            </div>
          </div>

          <div className="my-6 text-center">
            <div
              className="inline-block text-6xl font-bold tracking-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
            >
              {amount}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-white/40" />
              <div className="text-xs font-medium uppercase tracking-wider opacity-90">Gift Card</div>
              <div className="h-px w-12 bg-white/40" />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            {recipientName && (
              <div className="flex items-center gap-2 opacity-95">
                <span className="font-light">To:</span>
                <span className="font-medium">{recipientName}</span>
              </div>
            )}
            {purchaserName && (
              <div className="flex items-center gap-2 opacity-95">
                <span className="font-light">From:</span>
                <span className="font-medium">{purchaserName}</span>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
            <div className="font-mono text-lg font-bold tracking-widest">{code}</div>
          </div>
        </div>
      </div>

      {/* Personal message */}
      {personalMessage && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="text-xs font-medium text-muted-foreground mb-1">Personal Message</div>
          <p className="text-sm italic text-foreground">&ldquo;{personalMessage}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

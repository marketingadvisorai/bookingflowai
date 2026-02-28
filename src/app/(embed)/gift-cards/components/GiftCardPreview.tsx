'use client';

type Props = {
  amountCents: number;
  recipientName?: string;
  senderName?: string;
  venueName: string;
  code?: string;
  className?: string;
};

export function GiftCardPreview({
  amountCents,
  recipientName,
  senderName,
  venueName,
  code,
  className = '',
}: Props) {
  const amount = `$${(amountCents / 100).toFixed(0)}`;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF4F00 0%, #E64600 50%, #CC3D00 100%)',
        minHeight: '280px',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 right-8 h-32 w-32 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-12 left-12 h-40 w-40 rounded-full bg-white blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl">🎁</div>
            <div className="mt-1 text-sm font-medium opacity-95">{venueName}</div>
          </div>
          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            Gift Card
          </div>
        </div>

        {/* Amount */}
        <div className="my-6 text-center">
          <div
            className="inline-block text-6xl font-bold tracking-tight transition-all duration-300"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
          >
            {amount}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-white/40" />
            <div className="text-xs font-medium uppercase tracking-wider opacity-90">
              Gift Card
            </div>
            <div className="h-px w-12 bg-white/40" />
          </div>
        </div>

        {/* Names */}
        <div className="space-y-1 text-sm">
          {recipientName && (
            <div className="flex items-center gap-2 opacity-95">
              <span className="font-light">To:</span>
              <span className="font-medium">{recipientName}</span>
            </div>
          )}
          {senderName && (
            <div className="flex items-center gap-2 opacity-95">
              <span className="font-light">From:</span>
              <span className="font-medium">{senderName}</span>
            </div>
          )}
        </div>

        {/* Code */}
        {code && (
          <div className="mt-4 rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
            <div className="font-mono text-lg font-bold tracking-widest">{code}</div>
          </div>
        )}
      </div>

      {/* Shimmer effect */}
      <div
        className="shimmer-effect absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .shimmer-effect {
            animation: shimmer 3s infinite;
          }
        `
      }} />
    </div>
  );
}

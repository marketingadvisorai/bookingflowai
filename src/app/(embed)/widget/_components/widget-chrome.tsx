'use client';

export function WidgetBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden dark:block dark:opacity-70 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#E54D27]/35 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#FFA88D]/25 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(229,77,39,0.25),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
    </div>
  );
}

export function WidgetHeader() {
  return (
    <div className="flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Booking</div>
        <div className="mt-1.5 text-xl font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text">
          Choose your time
        </div>
      </div>
    </div>
  );
}

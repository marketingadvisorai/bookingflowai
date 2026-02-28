'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type DayStatus = 'available' | 'past' | 'unavailable';

interface BookingCalendarProps {
  date: string; // YYYY-MM-DD
  setDate: (d: string) => void;
  today: string; // YYYY-MM-DD
  orgId?: string;
  gameId?: string;
  players?: number;
  bookingType?: string;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function pad2(n: number) { return String(n).padStart(2, '0'); }
function toYmd(y: number, m: number, d: number) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }

export function BookingCalendar({ date, setDate, today, orgId, gameId, players = 2, bookingType = 'public' }: BookingCalendarProps) {
  // Parse selected date to determine initial month view
  const selectedParts = date.split('-').map(Number);
  const [viewYear, setViewYear] = useState(selectedParts[0]);
  const [viewMonth, setViewMonth] = useState(selectedParts[1] - 1); // 0-indexed
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);

  // Fetch availability for current month
  const monthKey = `${viewYear}-${pad2(viewMonth + 1)}`;
  
  useEffect(() => {
    if (!orgId || !gameId) return;
    setLoading(true);
    const params = new URLSearchParams({
      orgId,
      gameId,
      month: monthKey,
      type: bookingType,
      players: String(players),
    });
    fetch(`/api/v1/calendar?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.availableDates) {
          setAvailableDates(new Set(data.availableDates as string[]));
        } else {
          setAvailableDates(new Set());
        }
      })
      .catch(() => setAvailableDates(new Set()))
      .finally(() => setLoading(false));
  }, [orgId, gameId, monthKey, bookingType, players]);

  // When selected date changes, ensure view shows that month
  useEffect(() => {
    const p = date.split('-').map(Number);
    if (p[0] !== viewYear || p[1] - 1 !== viewMonth) {
      setViewYear(p[0]);
      setViewMonth(p[1] - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const navigate = useCallback((dir: -1 | 1) => {
    setSlideDir(dir === 1 ? 'left' : 'right');
    setTimeout(() => setSlideDir(null), 250);
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }, [viewMonth, viewYear]);

  // Build calendar grid
  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (null | { day: number; ymd: string; status: DayStatus })[] = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = toYmd(viewYear, viewMonth, d);
      let status: DayStatus = 'unavailable';
      if (ymd < today) {
        status = 'past';
      } else if (availableDates.has(ymd)) {
        status = 'available';
      }
      cells.push({ day: d, ymd, status });
    }
    return cells;
  }, [viewYear, viewMonth, today, availableDates]);

  // Can't go to past months
  const todayParts = today.split('-').map(Number);
  const canGoPrev = viewYear > todayParts[0] || (viewYear === todayParts[0] && viewMonth > todayParts[1] - 1);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-[#FFFDF9] dark:bg-[#1a1a1d] backdrop-blur-xl p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => canGoPrev && navigate(-1)}
          disabled={!canGoPrev}
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-[rgba(255,255,255,0.6)] hover:bg-gray-200 dark:hover:bg-white/[0.1] disabled:opacity-30 transition-all duration-200 text-sm"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-semibold text-gray-900 dark:text-[#fafaf9]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={() => navigate(1)}
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-[rgba(255,255,255,0.6)] hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all duration-200 text-sm"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-[rgba(255,255,255,0.3)] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-[2px]"
        style={{
          animation: slideDir ? `bf-cal-slide-${slideDir} 0.2s ease-out` : undefined,
        }}
      >
        {grid.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} className="aspect-square" />;
          
          const { day, ymd, status } = cell;
          const isSelected = ymd === date;
          const isToday = ymd === today;
          const isPast = status === 'past';
          const isAvailable = status === 'available';

          return (
            <button
              key={ymd}
              type="button"
              disabled={isPast}
              onClick={() => {
                if (!isPast) setDate(ymd);
              }}
              className={[
                'aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 relative text-sm',
                isPast && 'opacity-30 cursor-not-allowed',
                !isPast && !isSelected && 'hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer',
                isSelected && 'text-white font-semibold',
                !isSelected && !isPast && 'text-gray-800 dark:text-[#fafaf9]',
                isToday && !isSelected && 'ring-1 ring-[var(--widget-primary,#FF4F00)] ring-inset',
              ].filter(Boolean).join(' ')}
              style={isSelected ? { backgroundColor: 'var(--widget-primary, #FF4F00)' } : undefined}
            >
              <span className="leading-none">{day}</span>
              {/* Availability dot */}
              {!isPast && (
                <span
                  className={[
                    'w-1 h-1 rounded-full mt-0.5',
                    isAvailable ? (isSelected ? 'bg-white/70' : 'bg-emerald-400') : (isSelected ? 'bg-white/40' : 'bg-gray-300 dark:bg-white/[0.15]'),
                  ].filter(Boolean).join(' ')}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-[rgba(255,255,255,0.35)] animate-pulse">
          Checking availability…
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/[0.15] inline-block" /> Unavailable</span>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes bf-cal-slide-left {
          from { opacity: 0.5; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bf-cal-slide-right {
          from { opacity: 0.5; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

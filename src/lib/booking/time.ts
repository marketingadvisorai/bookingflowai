/**
 * Convert Date to ISO 8601 string (UTC timezone).
 * Used for consistent storage in DynamoDB.
 */
export function toIso(date: Date) {
  return date.toISOString();
}

/**
 * Add minutes to a date, returns new Date object (immutable).
 */
export function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60_000);
}

/**
 * Parse YYYY-MM-DD date string as LOCAL midnight.
 * 
 * IMPORTANT: This creates a Date in the server's local timezone.
 * For production, venue timezones should be handled at a higher level:
 * - Store org.timezone (IANA, e.g., "America/New_York")
 * - When computing slots, convert dates using the org's timezone
 * - Currently assumes server timezone = venue timezone (OK for single-tz MVP)
 * 
 * Edge case handling:
 * - Invalid dates (e.g., "2024-02-30") → JavaScript Date will auto-correct
 * - Missing parts → defaults to first of month (e.g., "2024-02" → "2024-02-01")
 * - DST transitions → handled by Date constructor (local time is preserved)
 */
export function parseLocalDate(dateStr: string): Date {
  // dateStr: YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(Number);
  // Creates Date in local timezone at midnight (00:00:00.000)
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

/**
 * Parse HH:MM time string into hours and minutes.
 * Used for schedule opening hours.
 */
export function parseHHMM(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  return { hh: hh ?? 0, mm: mm ?? 0 };
}

/**
 * Check if two time intervals overlap.
 * Uses exclusive end times (e.g., 10:00-11:00 and 11:00-12:00 do NOT overlap).
 * 
 * Logic: A overlaps B if A starts before B ends AND B starts before A ends.
 */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

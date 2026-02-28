export function fmtMoney(cents: number, currency: string) {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtMonthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map((n) => Number(n));
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export function addMonths(yyyyMm: string, delta: number) {
  const [y, m] = yyyyMm.split('-').map((n) => Number(n));
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + delta);
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

export function daysInMonth(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map((n) => Number(n));
  return new Date(Date.UTC(y, (m ?? 1), 0)).getUTCDate();
}

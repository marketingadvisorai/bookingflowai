export function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export function calcDepositCents(totalCents: number, percent: number) {
  const p = clampInt(percent, 0, 100);
  const v = Math.round((totalCents * p) / 100);
  return v;
}

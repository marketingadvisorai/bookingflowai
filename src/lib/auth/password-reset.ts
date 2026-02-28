import crypto from 'crypto';

export type PasswordResetRecord = {
  tokenHash: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  ttl: number;
};

export function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function nowIso() {
  return new Date().toISOString();
}

export function oneHourFromNow() {
  return new Date(Date.now() + 60 * 60_000);
}

export function ttlFromDate(d: Date) {
  return Math.floor(d.getTime() / 1000);
}

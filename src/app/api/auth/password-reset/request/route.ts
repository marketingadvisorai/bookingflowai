import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { checkCsrf } from '@/lib/http/csrf';
import { sendEmail } from '@/lib/email/ses';
import { nowIso, oneHourFromNow, sha256Hex } from '@/lib/auth/password-reset';
import { getPostgresClient } from '@/lib/db/postgres/client';
import { passwordResets } from '@/lib/db/postgres/schema';

const schema = z.object({
  email: z.string().email(),
});

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getBaseUrl() {
  return env('BF_PUBLIC_BASE_URL').replace(/\/$/, '');
}

export async function POST(req: Request) {
  const csrf = checkCsrf(req);
  if (csrf) return csrf;

  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `auth:pwreset:${ip}`, limit: 10, windowMs: 60 * 60_000 });
  if (!rl.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Avoid user enumeration: always return ok.
  const db = getDb();
  const user = await db.getUserByEmail(email);
  if (!user) return NextResponse.json({ ok: true });

  const token = `pw_${createId()}_${createId()}`;
  const tokenHash = sha256Hex(token);
  const expires = oneHourFromNow();

  try {
    const pg = getPostgresClient();
    await pg.insert(passwordResets).values({
      tokenHash,
      userId: user.userId,
      email,
      expiresAt: expires.toISOString(),
      createdAt: nowIso(),
    }).onConflictDoUpdate({
      target: passwordResets.tokenHash,
      set: { userId: user.userId, email, expiresAt: expires.toISOString(), createdAt: nowIso() },
    });
  } catch (err) {
    console.error('[password-reset] Store failed:', err);
    return NextResponse.json({ ok: true }); // Don't leak errors
  }

  const from = env('BF_SES_FROM');
  const link = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = 'Reset your BookingFlow password';
  const text = `We received a request to reset your BookingFlow password.\n\nReset link (valid for 1 hour):\n${link}\n\nIf you did not request this, you can ignore this email.`;

  try {
    await sendEmail({ from, to: email, subject, text });
  } catch (err) {
    console.error('[password-reset] Email send failed:', err);
    return NextResponse.json({ ok: true }); // Don't leak errors
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { sha256Hex } from '@/lib/auth/password-reset';
import { getPostgresClient } from '@/lib/db/postgres/client';
import { passwordResets } from '@/lib/db/postgres/schema';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const token = parsed.data.token;
  const password = parsed.data.password.trim();
  const tokenHash = sha256Hex(token);

  const pg = getPostgresClient();
  const rows = await pg.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHash)).limit(1);
  const rec = rows[0] ?? null;

  if (!rec) return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 });

  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    await pg.delete(passwordResets).where(eq(passwordResets.tokenHash, tokenHash)).catch(() => null);
    return NextResponse.json({ ok: false, error: 'expired_token' }, { status: 400 });
  }

  const db = getDb();
  const user = await db.getUserById(rec.userId);
  if (!user) return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  await db.putUser({ ...user, passwordHash });

  // Log out everywhere.
  await db.deleteSessionsForUser(user.userId).catch(() => null);

  // Consume token.
  await pg.delete(passwordResets).where(eq(passwordResets.tokenHash, tokenHash)).catch(() => null);

  return NextResponse.json({ ok: true });
}

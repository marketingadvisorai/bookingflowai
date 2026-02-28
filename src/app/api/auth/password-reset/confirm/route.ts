import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { getDb } from '@/lib/db';
import { sha256Hex } from '@/lib/auth/password-reset';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getDdb() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
  const client = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(client);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const token = parsed.data.token;
  const password = parsed.data.password.trim();

  const tokenHash = sha256Hex(token);

  const table = env('BF_DDB_PASSWORD_RESETS_TABLE');
  const ddb = getDdb();

  const res = await ddb.send(
    new GetCommand({
      TableName: table,
      Key: { pk: 'PWRESET', sk: tokenHash },
    })
  );

  const rec = (res.Item?.data as { userId: string; expiresAt: string; email: string } | undefined) ?? null;
  if (!rec) return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 400 });

  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    await ddb.send(new DeleteCommand({ TableName: table, Key: { pk: 'PWRESET', sk: tokenHash } })).catch(() => null);
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
  await ddb.send(new DeleteCommand({ TableName: table, Key: { pk: 'PWRESET', sk: tokenHash } })).catch(() => null);

  return NextResponse.json({ ok: true });
}

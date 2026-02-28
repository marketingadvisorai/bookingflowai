import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';
import { getDb } from '@/lib/db';
import {
  getObservationSummary,
  listObservations,
  resolveObservation,
} from '@/lib/chatbot/observer';
import type { ObservationType, Severity } from '@/lib/chatbot/observer';

function isAdmin(email: string): boolean {
  const adminEmail = process.env.BF_ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') as ObservationType | null;
  const severity = url.searchParams.get('severity') as Severity | null;
  const provider = url.searchParams.get('provider') as 'anthropic' | 'together' | null;
  const resolved = url.searchParams.get('resolved');

  const [summary, observations] = await Promise.all([
    getObservationSummary(),
    listObservations({
      limit: 50,
      ...(type ? { type } : {}),
      ...(severity ? { severity } : {}),
      ...(provider ? { provider } : {}),
      ...(resolved !== null ? { resolved: resolved === 'true' } : {}),
    }),
  ]);

  return NextResponse.json({ ok: true, summary, observations });
}

export async function PATCH(req: Request) {
  const sess = await requireSession();
  if (sess instanceof NextResponse) return sess;

  const db = getDb();
  const user = await db.getUserById(sess.userId);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { id, action } = body as { id: string; action: string };

  if (!id || action !== 'resolve') {
    return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 });
  }

  await resolveObservation(id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { getDb } from '@/lib/db';

async function getSessionOrgId(): Promise<string | null> {
  const h = await headers();
  const headerToken = h.get('x-bf-session');
  const cookieToken = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const token = headerToken ?? cookieToken;
  if (!token) return null;

  const db = getDb();
  const session = await db.getSession(token);
  if (!session) return null;
  return session.orgId;
}

export async function POST(req: Request) {
  const orgId = await getSessionOrgId();
  if (!orgId) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
  }

  const db = getDb();
  const org = await db.getOrg(orgId);
  if (!org) {
    return NextResponse.json({ ok: false, error: 'org_not_found' }, { status: 404 });
  }

  // Pick only allowed fields
  const allowedFields = [
    'businessName', 'website', 'phone', 'address', 'city', 'state', 'country',
    'locationCount', 'roomCount', 'businessType', 'plan', 'planCycle', 'onboardingComplete',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // If businessName is provided, also update the org name
  if (updates.businessName && typeof updates.businessName === 'string') {
    updates.name = updates.businessName;
  }

  const updatedOrg = { ...org, ...updates };
  
  try {
    await db.putOrg(updatedOrg);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'unknown_error';
    console.error('[onboarding] Failed to save org:', errorMsg, { orgId, updates });
    
    // Return specific error based on error type
    if (errorMsg.includes('ConditionalCheckFailedException')) {
      return NextResponse.json(
        { ok: false, error: 'conflict', message: 'Organization was modified by another request. Please try again.' },
        { status: 409 }
      );
    }
    
    if (errorMsg.includes('ProvisionedThroughputExceededException') || errorMsg.includes('RequestLimitExceeded')) {
      return NextResponse.json(
        { ok: false, error: 'rate_limited', message: 'Database is busy. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    
    if (errorMsg.includes('NetworkingError') || errorMsg.includes('TimeoutError')) {
      return NextResponse.json(
        { ok: false, error: 'network_error', message: 'Network error. Please check your connection and try again.' },
        { status: 503 }
      );
    }
    
    // Generic server error
    return NextResponse.json(
      { ok: false, error: 'database_error', message: 'Could not save changes. Please try again.' },
      { status: 500 }
    );
  }
}

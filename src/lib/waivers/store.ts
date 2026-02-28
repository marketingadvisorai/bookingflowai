/**
 * Waiver store — stubbed (DynamoDB removed).
 * Digital waivers are a Business+ feature not yet in active use.
 * Will be migrated to PostgreSQL when the feature is built out.
 */
import type { SignedWaiver, WaiverTemplate } from './types';

export async function putWaiverTemplate(_t: WaiverTemplate): Promise<void> {
  console.log('[waivers] putWaiverTemplate no-op');
}

export async function getWaiverTemplate(_orgId: string, _waiverId: string): Promise<WaiverTemplate | null> {
  return null;
}

export async function listWaiverTemplates(_orgId: string): Promise<WaiverTemplate[]> {
  return [];
}

export async function putSignedWaiver(_w: SignedWaiver): Promise<void> {
  console.log('[waivers] putSignedWaiver no-op');
}

export async function getSignedWaiver(_orgId: string, _signatureId: string): Promise<SignedWaiver | null> {
  return null;
}

export async function listSignedWaiversForBooking(_orgId: string, _bookingId: string): Promise<SignedWaiver[]> {
  return [];
}

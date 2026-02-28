/** Extract and store leads from chatbot conversations */

export interface Lead {
  venue?: string;
  name?: string;
  email?: string;
  website?: string;
  phone?: string;
  notes?: string;
}

const LEAD_PATTERN = /<!-- LEAD: ({.*?}) -->/;

/** Extract lead data from assistant response (if present) */
export function extractLead(content: string): Lead | null {
  const match = content.match(LEAD_PATTERN);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as Lead;
  } catch {
    return null;
  }
}

/** Strip lead comment from visible response */
export function stripLeadComment(content: string): string {
  return content.replace(LEAD_PATTERN, '').trim();
}

/** Store lead (logs for now, DynamoDB later) */
export async function storeLead(lead: Lead, sessionId: string): Promise<void> {
  // For now, structured log — easy to grep and pipe to DynamoDB later
  console.error('[lead]', JSON.stringify({
    ...lead,
    sessionId,
    timestamp: new Date().toISOString(),
  }));

  // TODO: Write to bf_leads DynamoDB table when ready
  // const db = getDb();
  // await db.putLead({ id: `lead_${Date.now()}`, ...lead, sessionId, createdAt: Date.now() });
}

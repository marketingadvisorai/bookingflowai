/**
 * AI Observation Logger — PostgreSQL stub (database removed)
 * Currently no-ops all persistence. Detection helpers still work.
 */

/* ── Types ──────────────────────────────────────────────────────────── */

export type ObservationType =
  | 'error' | 'tool_failure' | 'user_confusion' | 'booking_dropout'
  | 'unanswered' | 'feature_request' | 'bug_report' | 'conversion'
  | 'insight' | 'prompt_gap';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface AIObservation {
  id: string;
  timestamp: string;
  provider: 'anthropic' | 'together';
  type: ObservationType;
  severity: Severity;
  orgId: string;
  summary: string;
  details: string;
  userMessage?: string;
  metadata?: Record<string, unknown>;
  resolved: boolean;
  expiresAt?: number;
}

export type NewObservation = Omit<AIObservation, 'id' | 'timestamp' | 'resolved' | 'expiresAt'>;

export interface ObservationSummary {
  total: number;
  unresolved: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recent: AIObservation[];
}

/* ── Stubbed persistence (logs only) ────────────────────────────────── */

export async function logObservation(obs: NewObservation): Promise<void> {
  console.log('[observer]', obs.severity, obs.type, obs.summary);
}

export async function getUnresolvedObservations(_limit = 50): Promise<AIObservation[]> {
  return [];
}

export async function listObservations(_opts?: {
  limit?: number;
  type?: ObservationType;
  severity?: Severity;
  resolved?: boolean;
  provider?: 'anthropic' | 'together';
}): Promise<AIObservation[]> {
  return [];
}

export async function resolveObservation(_id: string): Promise<void> {}

export async function getObservationSummary(): Promise<ObservationSummary> {
  return { total: 0, unresolved: 0, bySeverity: {}, byType: {}, recent: [] };
}

export async function getAgentBriefing(_provider: 'anthropic' | 'together'): Promise<string> {
  return '';
}

/* ── Detection helpers (still functional, no DB needed) ─────────────── */

const CONFUSION_SIGNALS = [
  "I'm not sure", "I don't have", "I can't", "I couldn't find",
  "I'm unable", "I don't know", "not available", "I'm having trouble",
];

export function detectUnanswered(responseText: string): boolean {
  const lower = responseText.toLowerCase();
  return CONFUSION_SIGNALS.some((s) => lower.includes(s.toLowerCase()));
}

const FEATURE_REQUEST_SIGNALS = [
  'can you add', 'do you support', 'is there a way to',
  'would be nice if', 'wish you had', 'feature request',
];

export function detectFeatureRequest(userMessage: string): boolean {
  const lower = userMessage.toLowerCase();
  return FEATURE_REQUEST_SIGNALS.some((s) => lower.includes(s));
}

const CONFUSION_USER_SIGNALS = [
  "i don't understand", "confused", "what do you mean",
  "that doesn't make sense", "huh?", "i'm lost", "help me",
];

export function detectUserConfusion(userMessage: string): boolean {
  const lower = userMessage.toLowerCase();
  return CONFUSION_USER_SIGNALS.some((s) => lower.includes(s));
}

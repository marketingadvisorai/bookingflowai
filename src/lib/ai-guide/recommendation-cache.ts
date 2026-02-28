import type { Recommendation } from './recommendations';

const cache = new Map<string, { data: Recommendation[]; ts: number }>();
const TTL = 60 * 60 * 1000; // 1 hour

export function getCachedRecommendations(orgId: string): Recommendation[] | null {
  const entry = cache.get(orgId);
  if (!entry || Date.now() - entry.ts > TTL) return null;
  return entry.data;
}

export function setCachedRecommendations(orgId: string, data: Recommendation[]): void {
  cache.set(orgId, { data, ts: Date.now() });
}

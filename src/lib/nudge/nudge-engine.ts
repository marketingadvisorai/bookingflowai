/**
 * AI-powered nudge engine with Llama always-on watcher + Sonnet escalation.
 * Falls back to rule-based analysis if TOGETHER_AI_API_KEY is not set.
 */

import Together from 'together-ai';
import Anthropic from '@anthropic-ai/sdk';
import type { BehaviorEvent, NudgeResponse } from './tracker';

export interface NudgeContext {
  orgId: string;
  hasGames: boolean;
  gameCount: number;
  popularGame?: string;
  pageType?: string;
  hasStripe?: boolean;
}

export interface AdminNudgeContext {
  orgId: string;
  gameCount: number;
  roomCount: number;
  bookingsThisWeek: number;
  stripeConnected: boolean;
}

/* ── AI Clients (lazy singletons) ── */

const WATCHER_MODEL = 'meta-llama/Llama-3.2-3B-Instruct-Turbo';
const SMART_MODEL_THRESHOLD = 30_000; // 30s hesitation → Sonnet

let _together: Together | null = null;
function getTogetherClient(): Together {
  if (!_together) _together = new Together({ apiKey: process.env.TOGETHER_AI_API_KEY });
  return _together;
}

let _anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

/* ── Response cache (15s per session) ── */

const responseCache = new Map<string, { response: NudgeResponse; expiresAt: number }>();

function getCachedResponse(sessionKey: string): NudgeResponse | null {
  const cached = responseCache.get(sessionKey);
  if (cached && Date.now() < cached.expiresAt) return cached.response;
  if (cached) responseCache.delete(sessionKey);
  return null;
}

function setCachedResponse(sessionKey: string, response: NudgeResponse): void {
  responseCache.set(sessionKey, { response, expiresAt: Date.now() + 15_000 });
}

// Cleanup stale cache entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of responseCache) {
    if (now >= val.expiresAt) responseCache.delete(key);
  }
}, 120_000);

/* ── Server-side nudge cooldown (30s per org) ── */

const lastNudgeMap = new Map<string, number>();

function isNudgeCooldown(orgId: string): boolean {
  const last = lastNudgeMap.get(orgId);
  if (last && Date.now() - last < 30_000) return true;
  return false;
}

function recordNudgeShown(orgId: string): void {
  lastNudgeMap.set(orgId, Date.now());
}

/* ── Main entry point ── */

export async function analyzeAndNudge(
  events: BehaviorEvent[],
  context: NudgeContext,
): Promise<NudgeResponse> {
  // Skip if fewer than 3 events
  if (!events || events.length < 3) return { show: false };

  // Server-side cooldown
  if (isNudgeCooldown(context.orgId)) return { show: false };

  // Check cache
  const cacheKey = `${context.orgId}:${context.pageType || 'unknown'}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  // Try AI-powered analysis first
  if (process.env.TOGETHER_AI_API_KEY) {
    try {
      const result = await analyzeWithAI(events, {
        orgId: context.orgId,
        gameCount: context.gameCount,
        popularGame: context.popularGame,
        pageType: context.pageType || 'widget',
        hasStripe: context.hasStripe ?? false,
      });
      setCachedResponse(cacheKey, result);
      if (result.show) recordNudgeShown(context.orgId);
      return result;
    } catch (err) {
      console.error('[nudge-engine] AI analysis failed, falling back to rules:', err);
    }
  }

  const result = analyzeWithRules(events, context);
  setCachedResponse(cacheKey, result);
  if (result.show) recordNudgeShown(context.orgId);
  return result;
}

/* ── AI-powered analysis (Llama watcher) ── */

async function analyzeWithAI(
  events: BehaviorEvent[],
  context: { orgId: string; gameCount: number; popularGame?: string; pageType: string; hasStripe: boolean },
): Promise<NudgeResponse> {
  if (events.length < 3) return { show: false };

  const client = getTogetherClient();

  const systemPrompt = `You are an invisible AI assistant watching how a user interacts with a booking website. Your job is to detect when they need help and suggest ONE short, helpful nudge message.

RULES:
- Analyze the user's behavior events (clicks, scrolls, hesitations, form interactions)
- If the user seems fine and progressing normally, respond with: {"show": false}
- If the user seems confused, stuck, or hesitating, respond with a nudge
- Nudge messages must be SHORT (max 15 words), warm, and helpful
- Never be pushy or salesy
- Never mention AI, algorithms, or that you're watching them
- Use emoji sparingly (max 1)

RESPONSE FORMAT (JSON only, no markdown):
{"show": false}
OR
{"show": true, "message": "Your helpful nudge", "type": "toast", "position": "bottom-right"}

Types: "toast" (floating card), "banner" (top strip), "tooltip" (inline hint)
Positions: "bottom-right", "top-center", "inline"

CONTEXT about this venue:
- Page type: ${context.pageType}
- Games available: ${context.gameCount}
- Most popular game: ${context.popularGame || 'unknown'}
- Online payments: ${context.hasStripe ? 'enabled' : 'not set up'}`;

  const userMessage = `Here are the user's recent actions:\n${events.map((e) =>
    `[${new Date(e.timestamp).toISOString()}] ${e.type}${e.target ? ` on "${e.target}"` : ''}${e.duration ? ` (${e.duration}ms)` : ''}${e.value ? `: ${e.value}` : ''}`,
  ).join('\n')}`;

  const response = await client.chat.completions.create({
    model: WATCHER_MODEL,
    max_tokens: 100,
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { show: false };

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.show) return { show: false };

  // Check if we should escalate to Sonnet
  const hasLongHesitation = events.some((e) => e.type === 'hesitation' && (e.duration ?? 0) > SMART_MODEL_THRESHOLD);
  const hasCheckoutAbandonment = events.some((e) => e.type === 'checkout_abandon');
  const hasFormAbandonment = events.some((e) => e.type === 'form_abandon');

  if (hasLongHesitation || hasCheckoutAbandonment || hasFormAbandonment) {
    return await escalateToSonnet(events, context, parsed.message);
  }

  return {
    show: true,
    message: parsed.message || 'Need help? We\'re here for you!',
    type: parsed.type || 'toast',
    position: parsed.position || 'bottom-right',
  };
}

/* ── Sonnet escalation for complex moments ── */

async function escalateToSonnet(
  events: BehaviorEvent[],
  context: { orgId: string; gameCount: number; popularGame?: string; pageType: string; hasStripe: boolean },
  llamaSuggestion: string,
): Promise<NudgeResponse> {
  try {
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 150,
      system: `You are a conversion optimization expert. A user on a booking website is struggling. The basic AI suggested: "${llamaSuggestion}".

Analyze their behavior and provide a BETTER, more specific and empathetic nudge.
- Max 20 words
- Be specific to what they're struggling with
- Warm and helpful, never pushy
- If they abandoned checkout, address their concern (price? trust? confusion?)
- If they're hesitating on a form, make it feel easy
- Return JSON only: {"show": true, "message": "your message", "type": "toast"|"banner", "position": "bottom-right"|"top-center"}`,
      messages: [{
        role: 'user',
        content: `Page: ${context.pageType}\nGames: ${context.gameCount}\nPopular: ${context.popularGame}\nEvents:\n${events.slice(-10).map((e) => `${e.type} ${e.target || ''} ${e.duration ? e.duration + 'ms' : ''}`).join('\n')}`,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { show: true, message: llamaSuggestion, type: 'toast', position: 'bottom-right' };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      show: true,
      message: parsed.message || llamaSuggestion,
      type: parsed.type || 'toast',
      position: parsed.position || 'bottom-right',
    };
  } catch (error) {
    console.error('[nudge-engine] Sonnet escalation failed:', error);
    return { show: true, message: llamaSuggestion, type: 'toast', position: 'bottom-right' };
  }
}

/* ── Rule-based fallback (original engine) ── */

function analyzeWithRules(
  events: BehaviorEvent[],
  context: NudgeContext,
): NudgeResponse {
  if (!events || events.length === 0) return { show: false };

  const totalTime = Date.now() - events[0].timestamp;
  const hesitations = events.filter((e) => e.type === 'hesitation');
  const gameViews = events.filter((e) => e.type === 'game_view');
  const formEvents = events.filter(
    (e) => e.type === 'form_start' || e.type === 'form_abandon',
  );

  // Rule 1: Viewed 3+ games but hasn't selected a date
  if (gameViews.length >= 3 && !events.some((e) => e.type === 'date_select')) {
    return {
      show: true,
      message: context.popularGame
        ? `Can't decide? "${context.popularGame}" is our most popular — guests love it! ⭐`
        : `We have ${context.gameCount} amazing experiences! Need help choosing?`,
      type: 'toast',
      position: 'bottom-right',
    };
  }

  // Rule 2: Hesitation on calendar (15+ seconds)
  if (
    hesitations.some(
      (e) => e.target?.includes('calendar') && (e.duration ?? 0) > 15000,
    )
  ) {
    return {
      show: true,
      message: 'Weekends fill up fast! 🔥 Book now to secure your preferred time.',
      type: 'tooltip',
      position: 'inline',
    };
  }

  // Rule 3: Started form but stopped for 20+ seconds
  if (
    formEvents.some((e) => e.type === 'form_start') &&
    hesitations.some(
      (e) => e.target?.includes('form') && (e.duration ?? 0) > 20000,
    )
  ) {
    return {
      show: true,
      message: 'Almost there! Just a few more details and your spot is secured 🎉',
      type: 'toast',
      position: 'bottom-right',
    };
  }

  // Rule 4: On page for 60+ seconds, minimal interaction
  if (totalTime > 60000 && events.length < 5) {
    return {
      show: true,
      message: 'Looking for something? I can help you find the perfect experience! 💬',
      type: 'toast',
      position: 'bottom-right',
    };
  }

  // Rule 5: Checkout started but lingering
  if (
    events.some((e) => e.type === 'checkout_start') &&
    hesitations.length > 0
  ) {
    return {
      show: true,
      message: 'Your spot is held — you can complete your booking securely with any card 🔒',
      type: 'banner',
      position: 'top-center',
    };
  }

  return { show: false };
}

/** Admin-facing nudges based on dashboard state */
export function analyzeAdminNudge(context: AdminNudgeContext): NudgeResponse {
  if (context.gameCount === 0) {
    return {
      show: true,
      message: "Creating a game takes under a minute. Click 'Create Game' to get started!",
      type: 'toast',
      position: 'bottom-right',
    };
  }

  if (context.roomCount === 0) {
    return {
      show: true,
      message: 'Add a room so customers can start booking your games.',
      type: 'toast',
      position: 'bottom-right',
    };
  }

  if (context.bookingsThisWeek > 0 && !context.stripeConnected) {
    return {
      show: true,
      message: `${context.bookingsThisWeek} booking${context.bookingsThisWeek > 1 ? 's' : ''} this week but Stripe isn't connected. Connect it to accept payments.`,
      type: 'banner',
      position: 'top-center',
    };
  }

  return { show: false };
}

/** Dashboard chat API — streaming AI assistant with tool use (Anthropic Claude) */
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildDashboardPrompt } from '@/lib/chatbot/dashboard-prompt';
import { dashboardTools } from '@/lib/chatbot/dashboard-tools';
import { executeDashboardTool } from '@/lib/chatbot/dashboard-tool-handlers';
import type { ChatMessage } from '@/lib/chatbot/types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_MESSAGE_LENGTH = 3000;
const MAX_CONVERSATION_LENGTH = 100;
const RATE_LIMIT_PER_MIN = 20;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (limit.count >= RATE_LIMIT_PER_MIN) return false;
  limit.count++;
  return true;
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, orgId } = session;

    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const messages = body.messages as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const msg of messages) {
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (messages.length > MAX_CONVERSATION_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Conversation too long. Max ${MAX_CONVERSATION_LENGTH} messages.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with context
    const db = getDb();
    const [org, games, rooms] = await Promise.all([
      db.getOrg(orgId),
      db.listGames(orgId),
      db.listRooms(orgId),
    ]);

    const totalBookings = await db.countBookingsForOrg(orgId);

    const systemPrompt = buildDashboardPrompt({
      orgName: org?.name || 'your venue',
      timezone: org?.timezone || 'America/New_York',
      plan: org?.plan || 'Free',
      gameCount: games.length,
      roomCount: rooms.length,
      totalBookings,
    });

    const model = process.env.BF_CHAT_MODEL_DASHBOARD || DEFAULT_MODEL;
    const client = getClient();

    // Build Anthropic messages
    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: dashboardTools,
      });

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

      if (toolUseBlocks.length === 0) {
        // No tool calls — stream the final text response
        const content = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as Anthropic.TextBlock).text)
          .join('') || 'I had trouble with that. Could you try again?';

        const stream = new ReadableStream({
          async start(controller) {
            try {
              for (const char of content) {
                const chunk = JSON.stringify({
                  choices: [{ delta: { content: char } }],
                });
                controller.enqueue(new TextEncoder().encode(chunk + '\n'));
                await new Promise((resolve) => setTimeout(resolve, 10));
              }
              controller.close();
            } catch (err) {
              console.error('[dashboard-chat] Streaming error:', err);
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'application/x-ndjson',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      // Execute tool calls
      anthropicMessages.push({ role: 'assistant', content: response.content });

      const toolResultContents: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        const tc = block as Anthropic.ToolUseBlock;
        const result = await executeDashboardTool(tc.name, orgId, tc.input as Record<string, unknown>);
        toolResultContents.push({
          type: 'tool_result',
          tool_use_id: tc.id,
          content: JSON.stringify(result.output),
        });
      }

      anthropicMessages.push({ role: 'user', content: toolResultContents });
    }

    return new Response(
      JSON.stringify({ error: 'Could not complete the request. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[dashboard-chat] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Multi-provider chatbot
 * - Marketing chat (bookingflow-website): Together.ai Llama 3.2 3B — cheap FAQ bot
 * - Booking agent (widget with orgId): Anthropic Claude Sonnet 4 — intelligent tool use
 * - Dashboard agent: Anthropic Claude Sonnet 4 (handled in its own route)
 */
import Together from 'together-ai';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';
import { buildSystemPrompt, buildMarketingPrompt } from './system-prompt';
import { chatbotTools } from './tools';
import { executeTool } from './tool-handlers';
import type { ChatConfig, ChatMessage, ToolResult } from './types';
import {
  logObservation,
  detectUnanswered,
  detectFeatureRequest,
  detectUserConfusion,
  getAgentBriefing,
} from './observer';

/* ── Models ─────────────────────────────────────────────────────────── */
const MARKETING_MODEL = 'meta-llama/Llama-3.2-3B-Instruct-Turbo'; // $0.06/1M tokens
const BOOKING_MODEL = 'claude-sonnet-4-5-20250929';

/* ── Singletons ─────────────────────────────────────────────────────── */
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

/* ── Config ─────────────────────────────────────────────────────────── */
function getConfig(isMarketing: boolean): ChatConfig {
  return {
    model: isMarketing
      ? (process.env.BF_CHAT_MODEL_MARKETING ?? MARKETING_MODEL)
      : (process.env.BF_CHAT_MODEL ?? BOOKING_MODEL),
    maxTokens: 1024,
    maxTurns: 20,
  };
}

/* ── Marketing chat (Together.ai, no tools) ─────────────────────────── */
async function chatMarketing(
  messages: ChatMessage[],
  config: ChatConfig
): Promise<{ role: 'assistant'; content: string }> {
  const systemPrompt = buildMarketingPrompt();
  const client = getTogetherClient();
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content;

  try {
    // Check for user confusion/feature requests before calling API
    if (lastUserMessage) {
      if (detectUserConfusion(lastUserMessage)) {
        logObservation({
          provider: 'together',
          type: 'user_confusion',
          severity: 'medium',
          orgId: 'bookingflow-website',
          summary: `User seems confused: "${lastUserMessage.substring(0, 100)}"`,
          details: lastUserMessage,
          userMessage: lastUserMessage,
        }).catch(() => {});
      }
      if (detectFeatureRequest(lastUserMessage)) {
        logObservation({
          provider: 'together',
          type: 'feature_request',
          severity: 'low',
          orgId: 'bookingflow-website',
          summary: `Feature request: "${lastUserMessage.substring(0, 100)}"`,
          details: lastUserMessage,
          userMessage: lastUserMessage,
        }).catch(() => {});
      }
    }

    const response = await client.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const content = response.choices[0]?.message?.content ?? 'I had trouble with that. Could you try again?';

    // Check if response indicates inability to answer
    if (detectUnanswered(content)) {
      logObservation({
        provider: 'together',
        type: 'unanswered',
        severity: 'medium',
        orgId: 'bookingflow-website',
        summary: `Could not fully answer: "${lastUserMessage?.substring(0, 100)}"`,
        details: content,
        userMessage: lastUserMessage,
      }).catch(() => {});
    }

    return { role: 'assistant', content };
  } catch (error) {
    const err = error as Error;
    logObservation({
      provider: 'together',
      type: 'error',
      severity: 'critical',
      orgId: 'bookingflow-website',
      summary: `Marketing chat error: ${err.message}`,
      details: JSON.stringify({ stack: err.stack, messages: messages.slice(-2) }),
    }).catch(() => {});
    throw error;
  }
}

async function chatMarketingStream(
  messages: ChatMessage[],
  config: ChatConfig
): Promise<ReadableStream> {
  try {
    const systemPrompt = buildMarketingPrompt();
    const client = getTogetherClient();

    const stream = await client.chat.completions.create({
      model: config.model,
      max_tokens: config.maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return stream.toReadableStream();
  } catch (error) {
    const err = error as Error;
    logObservation({
      provider: 'together',
      type: 'error',
      severity: 'critical',
      orgId: 'bookingflow-website',
      summary: `Marketing stream error: ${err.message}`,
      details: JSON.stringify({ stack: err.stack }),
    }).catch(() => {});
    throw error;
  }
}

/* ── Booking chat (Anthropic Claude, with tools) ────────────────────── */
async function chatBooking(
  orgId: string,
  messages: ChatMessage[],
  config: ChatConfig
): Promise<{ role: 'assistant'; content: string; toolResults?: ToolResult[] }> {
  const db = getDb();
  const org = await db.getOrg(orgId);
  let systemPrompt = buildSystemPrompt(org?.name ?? 'our venue', org?.timezone ?? 'America/New_York');

  // Append inter-agent briefing
  const briefing = await getAgentBriefing('anthropic');
  if (briefing) systemPrompt += briefing;

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content;

  try {
    // Check for user confusion/feature requests
    if (lastUserMessage) {
      if (detectUserConfusion(lastUserMessage)) {
        logObservation({
          provider: 'anthropic',
          type: 'user_confusion',
          severity: 'medium',
          orgId,
          summary: `User seems confused: "${lastUserMessage.substring(0, 100)}"`,
          details: lastUserMessage,
          userMessage: lastUserMessage,
        }).catch(() => {});
      }
      if (detectFeatureRequest(lastUserMessage)) {
        logObservation({
          provider: 'anthropic',
          type: 'feature_request',
          severity: 'low',
          orgId,
          summary: `Feature request: "${lastUserMessage.substring(0, 100)}"`,
          details: lastUserMessage,
          userMessage: lastUserMessage,
        }).catch(() => {});
      }
    }

    const toolResults: ToolResult[] = [];
    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const client = getAnthropicClient();
    let iterations = 0;

    while (iterations < 5) {
      iterations++;

      const response = await client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: chatbotTools,
      });

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

      if (toolUseBlocks.length === 0) {
        const textContent = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as Anthropic.TextBlock).text)
          .join('');

        const finalContent = textContent || 'I had trouble with that. Could you try again?';

        // Check if response indicates inability to answer
        if (detectUnanswered(finalContent)) {
          logObservation({
            provider: 'anthropic',
            type: 'unanswered',
            severity: 'medium',
            orgId,
            summary: `Could not fully answer: "${lastUserMessage?.substring(0, 100)}"`,
            details: finalContent,
            userMessage: lastUserMessage,
          }).catch(() => {});
        }

        return {
          role: 'assistant',
          content: finalContent,
          toolResults: toolResults.length > 0 ? toolResults : undefined,
        };
      }

      anthropicMessages.push({ role: 'assistant', content: response.content });

      const toolResultContents: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        const tc = block as Anthropic.ToolUseBlock;
        try {
          const result = await executeTool(tc.name, tc.input as Record<string, unknown>);
          toolResults.push(result);
          toolResultContents.push({
            type: 'tool_result',
            tool_use_id: tc.id,
            content: JSON.stringify(result.output),
          });
        } catch (toolErr) {
          const te = toolErr as Error;
          logObservation({
            provider: 'anthropic',
            type: 'tool_failure',
            severity: 'high',
            orgId,
            summary: `Tool ${tc.name} failed: ${te.message}`,
            details: JSON.stringify({ toolName: tc.name, input: tc.input, error: te.message }),
            userMessage: lastUserMessage,
          }).catch(() => {});
          toolResultContents.push({
            type: 'tool_result',
            tool_use_id: tc.id,
            content: JSON.stringify({ error: te.message }),
            is_error: true,
          });
        }
      }

      anthropicMessages.push({ role: 'user', content: toolResultContents });
    }

    return { role: 'assistant', content: 'Could not complete the request. Please try again.' };
  } catch (error) {
    const err = error as Error;
    logObservation({
      provider: 'anthropic',
      type: 'error',
      severity: 'critical',
      orgId,
      summary: `Booking chat error: ${err.message}`,
      details: JSON.stringify({ stack: err.stack, messages: messages.slice(-2) }),
    }).catch(() => {});
    throw error;
  }
}

async function chatBookingStream(
  orgId: string,
  messages: ChatMessage[],
  config: ChatConfig
): Promise<ReadableStream> {
  const db = getDb();
  const org = await db.getOrg(orgId);
  let systemPrompt = buildSystemPrompt(org?.name ?? 'our venue', org?.timezone ?? 'America/New_York');

  const briefing = await getAgentBriefing('anthropic');
  if (briefing) systemPrompt += briefing;

  const client = getAnthropicClient();

  return new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: config.model,
          max_tokens: config.maxTokens,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          tools: chatbotTools,
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = JSON.stringify({
              choices: [{ delta: { content: event.delta.text } }],
            });
            controller.enqueue(new TextEncoder().encode(chunk + '\n'));
          }
        }

        controller.close();
      } catch (err) {
        const error = err as Error;
        console.error('[chatbot] Stream error:', err);
        logObservation({
          provider: 'anthropic',
          type: 'error',
          severity: 'critical',
          orgId,
          summary: `Booking stream error: ${error.message}`,
          details: JSON.stringify({ stack: error.stack }),
        }).catch(() => {});
        controller.error(err);
      }
    },
  });
}

/* ── Public API ──────────────────────────────────────────────────────── */

/** Non-streaming chat with tool loop */
export async function chat(
  orgId: string,
  messages: ChatMessage[]
): Promise<{ role: 'assistant'; content: string; toolResults?: ToolResult[] }> {
  const isMarketing = orgId === 'bookingflow-website';
  const config = getConfig(isMarketing);

  if (messages.length > config.maxTurns * 2) {
    return {
      role: 'assistant',
      content: `You're approaching the conversation limit. Please start a new chat if needed.`,
    };
  }

  if (isMarketing) {
    return chatMarketing(messages, config);
  }

  return chatBooking(orgId, messages, config);
}

/** Streaming chat */
export async function chatStream(
  orgId: string,
  messages: ChatMessage[]
): Promise<ReadableStream> {
  const isMarketing = orgId === 'bookingflow-website';
  const config = getConfig(isMarketing);

  if (isMarketing) {
    return chatMarketingStream(messages, config);
  }

  return chatBookingStream(orgId, messages, config);
}

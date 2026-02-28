import { NextResponse } from 'next/server';
import { chat, chatStream } from '@/lib/chatbot';
import { extractLead, stripLeadComment, storeLead } from '@/lib/chatbot/leads';
import { corsOptions, enforceCors } from '@/lib/http/cors-enforce';
import { getClientIp, rateLimit } from '@/lib/http/rate-limit';
import { addRateLimitHeaders } from '@/lib/http/errors';

export async function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function POST(req: Request) {
  const cors = enforceCors(req);
  if (cors instanceof NextResponse) return cors;

  const corsHeaders: Record<string, string> = {};
  Object.entries(cors.headers).forEach(([key, value]) => {
    corsHeaders[key] = value;
  });

  // Rate limiting: 10 requests per minute per IP
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `chat:${ip}`, limit: 10, windowMs: 60_000 });
  
  const rateLimitHeaders = new Headers();
  addRateLimitHeaders(rateLimitHeaders, { limit: 10, remaining: rl.remaining, resetAt: rl.resetAt });
  Object.entries(corsHeaders).forEach(([k, v]) => rateLimitHeaders.set(k, v));
  
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers: rateLimitHeaders });
  }

  const { orgId, messages, stream } = body as {
    orgId?: string;
    messages?: unknown[];
    stream?: boolean;
  };

  if (!orgId || typeof orgId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(orgId)) {
    return NextResponse.json({ ok: false, error: 'invalid_org_id' }, { status: 400, headers: rateLimitHeaders });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ ok: false, error: 'messages_required' }, { status: 400, headers: rateLimitHeaders });
  }

  const MAX_MESSAGE_LENGTH = 2000; // Prevent prompt injection with huge inputs
  const MAX_MESSAGES = 50; // Hard limit on conversation length

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ 
      ok: false, 
      error: 'too_many_messages',
      message: 'Conversation is too long. Please start a new chat.' 
    }, { status: 400, headers: rateLimitHeaders });
  }

  for (const msg of messages) {
    const m = msg as Record<string, unknown>;
    if (!m.role || !m.content || typeof m.content !== 'string') {
      return NextResponse.json({ ok: false, error: 'invalid_message_format' }, { status: 400, headers: rateLimitHeaders });
    }
    if (m.role !== 'user' && m.role !== 'assistant') {
      return NextResponse.json({ ok: false, error: 'invalid_message_role' }, { status: 400, headers: rateLimitHeaders });
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ 
        ok: false, 
        error: 'message_too_long',
        message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters). Please shorten your message.`
      }, { status: 400, headers: rateLimitHeaders });
    }
  }

  const typedMessages = messages as { role: 'user' | 'assistant'; content: string }[];

  try {
    // Streaming mode — returns SSE stream
    if (stream) {
      const readableStream = await chatStream(orgId, typedMessages);
      const responseHeaders = new Headers({
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));
      addRateLimitHeaders(responseHeaders, { limit: 10, remaining: rl.remaining, resetAt: rl.resetAt });
      return new Response(readableStream, { headers: responseHeaders });
    }

    // Non-streaming — returns JSON (supports tool use)
    const result = await chat(orgId, typedMessages);

    // Extract and store lead data if present, strip comment from response
    if (result.content) {
      const lead = extractLead(result.content);
      if (lead) {
        const sessionId = `chat_${ip}_${Date.now()}`;
        storeLead(lead, sessionId).catch(() => {}); // fire-and-forget
        result.content = stripLeadComment(result.content);
      }
    }

    return NextResponse.json({ ok: true, ...result }, { headers: rateLimitHeaders });
  } catch (err) {
    console.error('[chat] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'chat_error', message: 'Failed to process chat' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}

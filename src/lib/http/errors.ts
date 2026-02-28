import { NextResponse } from 'next/server';

type ErrorResponse = {
  ok: false;
  error: string;
  message?: string;
  [key: string]: unknown;
};

/**
 * Centralized error response helpers with proper status codes and CORS headers.
 * All helpers return NextResponse.json with consistent error format.
 */

function errorResponse(
  error: string,
  message: string,
  status: number,
  corsHeaders?: Record<string, string>,
  extra?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { ok: false, error, message, ...extra };
  const headers = new Headers();
  
  if (corsHeaders) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }
  
  return NextResponse.json(body, { status, headers });
}

export function badRequest(
  error: string,
  message: string,
  corsHeaders?: Record<string, string>,
  extra?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return errorResponse(error, message, 400, corsHeaders, extra);
}

export function unauthorized(
  message: string = 'Authentication required',
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('unauthorized', message, 401, corsHeaders);
}

export function forbidden(
  message: string = 'Access denied',
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('forbidden', message, 403, corsHeaders);
}

export function notFound(
  resource: string,
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('not_found', `${resource} not found`, 404, corsHeaders);
}

export function conflict(
  error: string,
  message: string,
  corsHeaders?: Record<string, string>,
  extra?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return errorResponse(error, message, 409, corsHeaders, extra);
}

export function rateLimited(
  message: string = 'Too many requests',
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('rate_limited', message, 429, corsHeaders);
}

export function serverError(
  message: string = 'Internal server error',
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('server_error', message, 500, corsHeaders);
}

export function notImplemented(
  message: string = 'Not implemented',
  corsHeaders?: Record<string, string>
): NextResponse<ErrorResponse> {
  return errorResponse('not_implemented', message, 501, corsHeaders);
}

/**
 * Helper to add rate limit headers to any response
 */
export function addRateLimitHeaders(
  headers: Headers,
  opts: { limit: number; remaining: number; resetAt: number }
): void {
  headers.set('X-RateLimit-Limit', String(opts.limit));
  headers.set('X-RateLimit-Remaining', String(opts.remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(opts.resetAt / 1000)));
}

/**
 * Helper to merge CORS headers into any response
 */
export function addCorsHeaders(
  headers: Headers,
  corsHeaders: Record<string, string>
): void {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}

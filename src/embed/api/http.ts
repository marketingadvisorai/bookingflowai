// Shared HTTP helpers for the BookingFlow embed widget

export async function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

export function pickError(body: unknown): string | null {
  return typeof body === 'object' && body && 'error' in body ? String((body as { error?: unknown }).error) : null;
}

type RetryOpts = {
  retries?: number;
  timeoutMs?: number;
  retryOn?: (res: Response) => boolean;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * fetch() with:
 * - hard timeout (AbortController)
 * - small retry with exponential backoff
 *
 * Goal: make the widget resilient to transient network blips without changing app behavior.
 */
export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit, opts?: RetryOpts): Promise<Response> {
  const retries = opts?.retries ?? 2;
  const timeoutMs = opts?.timeoutMs ?? 12_000;
  const retryOn =
    opts?.retryOn ??
    ((res: Response) => {
      // Retry on common transient server errors.
      return [408, 425, 429, 500, 502, 503, 504].includes(res.status);
    });

  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(input, { ...(init ?? {}), signal: controller.signal });
      if (res.ok || attempt === retries || !retryOn(res)) return res;

      // brief exponential backoff: 250ms, 500ms, 1000ms...
      await sleep(250 * Math.pow(2, attempt));
    } catch (e) {
      lastErr = e;
      if (attempt === retries) throw e;
      await sleep(250 * Math.pow(2, attempt));
    } finally {
      clearTimeout(t);
    }
  }

  // Should never hit, but keep TS happy.
  throw lastErr instanceof Error ? lastErr : new Error('fetch_failed');
}

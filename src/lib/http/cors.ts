type CorsDecision =
  | { allowed: true; origin: string }
  | { allowed: false; reason: 'missing_origin' | 'not_allowed' | 'not_configured' | 'invalid_origin' };

function normalizeOrigin(origin: string): string | null {
  try {
    const u = new URL(origin);
    // Origin must be scheme+host(+port). No path.
    const protocol = u.protocol.toLowerCase();
    const hostname = u.hostname.toLowerCase();
    const port = u.port;

    // Remove default ports.
    const isDefaultPort = (protocol === 'https:' && port === '443') || (protocol === 'http:' && port === '80');
    const hostPort = port && !isDefaultPort ? `${hostname}:${port}` : hostname;

    return `${protocol}//${hostPort}`;
  } catch {
    return null;
  }
}

function expandWwwPair(origin: string): string[] {
  const n = normalizeOrigin(origin);
  if (!n) return [];
  try {
    const u = new URL(n);
    const host = u.hostname;
    if (host.startsWith('www.')) {
      const alt = host.slice(4);
      return [`${u.protocol}//${host}${u.port ? `:${u.port}` : ''}`, `${u.protocol}//${alt}${u.port ? `:${u.port}` : ''}`];
    }
    return [`${u.protocol}//${host}${u.port ? `:${u.port}` : ''}`, `${u.protocol}//www.${host}${u.port ? `:${u.port}` : ''}`];
  } catch {
    return [n];
  }
}

type AllowedPattern = { kind: 'exact'; origin: string } | { kind: 'wildcard'; protocol: string; suffix: string };

function parseAllowlist(): AllowedPattern[] {
  const raw = process.env.BF_CORS_ALLOW_ORIGINS ?? '';
  const entries = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const out: AllowedPattern[] = [];
  for (const e of entries) {
    const n = normalizeOrigin(e);
    if (!n) continue;

    // Support limited wildcards like https://*.example.com
    if (n.includes('*.')) {
      try {
        const u = new URL(n);
        const host = u.hostname;
        if (host.startsWith('*.') && host.length > 2) {
          out.push({ kind: 'wildcard', protocol: u.protocol, suffix: host.slice(1) }); // keep leading dot
          continue;
        }
      } catch {
        // fall through
      }
    }

    for (const ex of expandWwwPair(n)) out.push({ kind: 'exact', origin: ex });
  }

  // De-dupe exact
  const seen = new Set<string>();
  return out.filter((p) => (p.kind === 'exact' ? (seen.has(p.origin) ? false : (seen.add(p.origin), true)) : true));
}

function isAllowedOrigin(origin: string, allowlist: AllowedPattern[]): boolean {
  const n = normalizeOrigin(origin);
  if (!n) return false;

  // Exact match
  for (const p of allowlist) {
    if (p.kind === 'exact' && p.origin === n) return true;
  }

  // Wildcard match (subdomains only)
  try {
    const u = new URL(n);
    for (const p of allowlist) {
      if (p.kind !== 'wildcard') continue;
      if (u.protocol !== p.protocol) continue;
      if (!u.hostname.endsWith(p.suffix)) continue;
      // Ensure it's a subdomain (not apex)
      const host = u.hostname;
      const suffixHost = p.suffix.slice(1); // remove leading dot
      if (host === suffixHost) continue;
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function corsDecision(origin: string | null): CorsDecision {
  if (!origin) return { allowed: false, reason: 'missing_origin' };

  const allowlist = parseAllowlist();

  // CORS POLICY (intentional):
  // Widget endpoints are embedded on third-party venue websites (any domain).
  // If BF_CORS_ALLOW_ORIGINS is not set, we allow ALL origins — this is correct
  // because the booking widget must work on any venue's site without configuration.
  // To restrict: set BF_CORS_ALLOW_ORIGINS=https://venue1.com,https://venue2.com
  // Wildcard subdomains supported: https://*.example.com
  if (allowlist.length === 0) {
    return { allowed: true, origin: origin };
  }

  const n = normalizeOrigin(origin);
  if (!n) return { allowed: false, reason: 'invalid_origin' };
  if (!isAllowedOrigin(n, allowlist)) return { allowed: false, reason: 'not_allowed' };

  return { allowed: true, origin: n };
}

export function corsHeaders(origin: string | null) {
  const decision = corsDecision(origin);
  if (!decision.allowed) return null;

  return {
    'Access-Control-Allow-Origin': decision.origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    // Keep public widget endpoints minimal.
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  } as const;
}

// Fixed-window rate limiter with a bounded in-memory store.
//
// Good enough for the MVP / a single instance. In production this moves to a
// shared store (e.g. Redis / Upstash) so limits hold across instances.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Hard cap so a flood of distinct keys can't grow the map without bound
// (memory-exhaustion vector). Expired entries are swept first; if the map is
// still at capacity we evict the oldest-expiring entries.
const MAX_BUCKETS = 10_000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size < MAX_BUCKETS) return;
  const byExpiry = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const excess = buckets.size - MAX_BUCKETS + 1;
  for (let i = 0; i < excess; i++) {
    const entry = byExpiry[i];
    if (entry) buckets.delete(entry[0]);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) sweep(now);
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return { ok, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

/**
 * Client key for rate limiting.
 *
 * `x-forwarded-for` is attacker-controlled: anyone can send their own header to
 * rotate buckets and bypass the limit. So we prefer headers the platform sets
 * itself (and which it overwrites on every inbound request), and only fall back
 * to the left-most XFF entry when no trusted header is present.
 */
export function clientKey(headers: Headers): string {
  const trusted =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip");
  if (trusted) return trusted.trim();

  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0];
    if (first) return first.trim();
  }
  return "anonymous";
}

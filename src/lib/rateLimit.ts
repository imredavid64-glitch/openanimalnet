const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

// In-memory sliding window per client IP. Single-process demo API: no Redis,
// so counters reset on server restart.
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(ip: string, windowMs = WINDOW_MS, maxRequests = MAX_REQUESTS): RateLimitResult {
  const now = Date.now();
  const timestamps = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  timestamps.push(now);
  buckets.set(ip, timestamps);
  return { allowed: true, remaining: maxRequests - timestamps.length, retryAfterSec: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

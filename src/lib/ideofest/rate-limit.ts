/**
 * In-memory sliding-window rate limiter.
 *
 * Edge-runtime compatible — uses only Web Crypto / built-ins.
 * NOTE: State resets on cold starts (Vercel serverless).
 *       For multi-region persistence, swap the Map for Upstash Redis.
 *
 * Usage:
 *   const limiter = new RateLimiter({ limit: 5, windowMs: 5 * 60 * 1000 });
 *   const result  = limiter.check(ip);
 *   if (!result.success) return new Response('429 Too Many Requests', { status: 429 });
 */

interface RateLimiterOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number; // Unix ms timestamp when window resets
  limit: number;
}

interface Bucket {
  timestamps: number[]; // request timestamps in the current window
}

class RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly store = new Map<string, Bucket>();
  private lastClean = Date.now();

  constructor({ limit, windowMs }: RateLimiterOptions) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();

    // Periodic cleanup: purge buckets older than 2× the window to prevent memory leak
    if (now - this.lastClean > this.windowMs * 2) {
      this.cleanup(now);
      this.lastClean = now;
    }

    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.store.set(key, bucket);
    }

    // Slide the window: keep only timestamps within the current window
    const windowStart = now - this.windowMs;
    bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

    if (bucket.timestamps.length >= this.limit) {
      // Oldest timestamp in window determines when the window resets
      const oldestInWindow = bucket.timestamps[0];
      const resetTime = oldestInWindow + this.windowMs;
      return { success: false, remaining: 0, resetTime, limit: this.limit };
    }

    bucket.timestamps.push(now);
    const remaining = this.limit - bucket.timestamps.length;
    const resetTime = (bucket.timestamps[0] ?? now) + this.windowMs;
    return { success: true, remaining, resetTime, limit: this.limit };
  }

  private cleanup(now: number) {
    const cutoff = now - this.windowMs * 2;
    for (const [key, bucket] of this.store.entries()) {
      const latest = bucket.timestamps[bucket.timestamps.length - 1];
      if (latest === undefined || latest < cutoff) {
        this.store.delete(key);
      }
    }
  }
}

// ── Pre-built limiters ──────────────────────────────────────────────────────

/** Global API cap: 60 req / 60s per IP — general flood protection */
export const globalApiLimiter = new RateLimiter({ limit: 60, windowMs: 60_000 });

/** Booking creation: 5 req / 5 min per IP — prevents fake booking spam */
export const bookingLimiter = new RateLimiter({ limit: 5, windowMs: 5 * 60_000 });

/** File upload: 10 req / 5 min per IP — protects Cloudinary quota */
export const uploadLimiter = new RateLimiter({ limit: 10, windowMs: 5 * 60_000 });

/** Admin login: 5 attempts / 15 min per IP — brute-force lock */
export const adminLoginLimiter = new RateLimiter({ limit: 5, windowMs: 15 * 60_000 });

/** QR scan: 30 req / 60s per IP — scanner flood protection */
export const scanLimiter = new RateLimiter({ limit: 30, windowMs: 60_000 });

// ── Helper ──────────────────────────────────────────────────────────────────

/**
 * Extract the real client IP from a Next.js request.
 * Vercel injects x-forwarded-for; falls back to x-real-ip.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // xff can be comma-separated list; first entry is the originating client
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri.trim();
  return 'unknown';
}

/**
 * Build a `429 Too Many Requests` response with standard headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please slow down and try again later.',
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.max(retryAfterSeconds, 1)),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    }
  );
}

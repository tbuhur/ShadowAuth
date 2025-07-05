// Simple in-memory rate limiting (replace with Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export async function rateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  const resetTime = now + (windowSeconds * 1000);

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime <= now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime
    };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Cleanup expired rate limit entries
export function cleanupRateLimits(): number {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

// Get rate limit info for debugging
export function getRateLimitInfo(identifier: string, action: string): RateLimitEntry | null {
  const key = `${identifier}:${action}`;
  return rateLimitStore.get(key) || null;
}

// Reset rate limit for testing
export function resetRateLimit(identifier: string, action: string): boolean {
  const key = `${identifier}:${action}`;
  return rateLimitStore.delete(key);
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  login: { maxRequests: 5, windowSeconds: 60 }, // 5 requests per minute
  verify: { maxRequests: 100, windowSeconds: 60 }, // 100 requests per minute
  revoke: { maxRequests: 10, windowSeconds: 60 }, // 10 requests per minute
  register: { maxRequests: 3, windowSeconds: 300 }, // 3 requests per 5 minutes
  default: { maxRequests: 50, windowSeconds: 60 } // 50 requests per minute
} as const;

// Helper function to get rate limit config
export function getRateLimitConfig(action: keyof typeof RATE_LIMITS) {
  return RATE_LIMITS[action] || RATE_LIMITS.default;
} 
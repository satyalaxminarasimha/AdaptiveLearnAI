// In-memory rate limiter for API endpoints
// For production, consider using Redis (Upstash) for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

// Default configs for different endpoints
export const RATE_LIMIT_CONFIGS = {
  aiChat: { interval: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  auth: { interval: 60 * 1000, maxRequests: 5 }, // 5 login attempts per minute
  general: { interval: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
} as const;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

export function checkRateLimit(
  identifier: string, // Usually IP address or user ID
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.general
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitMap.get(key);
  
  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    cleanupExpiredEntries();
  }
  
  // If no entry or expired, create new one
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitMap.set(key, entry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.interval / 1000),
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitMap.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// Utility function to create rate limit response
export function rateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetIn.toString(),
      },
    }
  );
}

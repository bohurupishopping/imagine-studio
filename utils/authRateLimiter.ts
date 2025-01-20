import { NextRequest, NextResponse } from 'next/server';

interface AuthRateLimitState {
  tokens: number;
  lastRefill: number;
  lastAttempt: number;
}

const AUTH_RATE_LIMIT = {
  WINDOW_SIZE_MS: 60 * 1000, // 1 minute
  MAX_TOKENS: 5, // Max auth requests per window
  REFILL_RATE: 5, // Tokens to add per window
  RETRY_AFTER_MS: 5000, // Minimum time between attempts
};

const authRateLimitMap = new Map<string, AuthRateLimitState>();

export function authRateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Initialize rate limit state if it doesn't exist
  if (!authRateLimitMap.has(ip)) {
    authRateLimitMap.set(ip, {
      tokens: AUTH_RATE_LIMIT.MAX_TOKENS,
      lastRefill: Date.now(),
      lastAttempt: 0,
    });
  }

  const state = authRateLimitMap.get(ip)!;
  const now = Date.now();
  
  // Check minimum time between attempts
  if (now - state.lastAttempt < AUTH_RATE_LIMIT.RETRY_AFTER_MS) {
    return NextResponse.json(
      { error: 'Too many attempts, please wait' },
      { status: 429 }
    );
  }

  // Refill tokens based on time passed
  const timeSinceLastRefill = now - state.lastRefill;
  if (timeSinceLastRefill > AUTH_RATE_LIMIT.WINDOW_SIZE_MS) {
    state.tokens = Math.min(
      AUTH_RATE_LIMIT.MAX_TOKENS,
      state.tokens + AUTH_RATE_LIMIT.REFILL_RATE
    );
    state.lastRefill = now;
  }

  // Check if request is allowed
  if (state.tokens <= 0) {
    return NextResponse.json(
      { error: 'Too many auth requests' },
      { status: 429 }
    );
  }

  // Update state
  state.tokens -= 1;
  state.lastAttempt = now;

  return null;
}

export function cleanupAuthRateLimits() {
  const now = Date.now();
  
  // Remove stale rate limits
  for (const [ip, state] of authRateLimitMap.entries()) {
    if (now - state.lastRefill > AUTH_RATE_LIMIT.WINDOW_SIZE_MS * 10) {
      authRateLimitMap.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupAuthRateLimits, 5 * 60 * 1000);
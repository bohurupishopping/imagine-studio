// Simple in-memory rate limiter
const userLimits = new Map<string, number>();
const DAILY_LIMIT = 10;

// Reset all limits daily at midnight
const resetLimits = () => {
  userLimits.clear();
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight.getTime() - now.getTime();
  setTimeout(resetLimits, timeUntilMidnight);
};

// Initialize the first reset
resetLimits();

export const checkRateLimit = (userId: string) => {
  const count = userLimits.get(userId) || 0;
  
  if (count >= DAILY_LIMIT) {
    return { 
      allowed: false,
      remaining: 0
    };
  }

  userLimits.set(userId, count + 1);
  return {
    allowed: true,
    remaining: DAILY_LIMIT - (count + 1)
  };
};

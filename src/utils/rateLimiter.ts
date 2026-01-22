import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limiter configuration
export interface RateLimiterConfig {
  maxAttempts: number;      // Maximum attempts before lockout
  lockoutDuration: number;  // Lockout duration in milliseconds
  windowDuration: number;   // Time window for counting attempts in milliseconds
}

// Default configurations
export const AUTH_RATE_LIMIT_CONFIG: RateLimiterConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  windowDuration: 5 * 60 * 1000,   // 5 minutes
};

export const PASSWORD_RESET_RATE_LIMIT_CONFIG: RateLimiterConfig = {
  maxAttempts: 3,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  windowDuration: 10 * 60 * 1000,  // 10 minutes
};

// Storage keys
const RATE_LIMIT_PREFIX = '@turing_rate_limit_';

// Rate limit state
export interface RateLimitState {
  attempts: number[];        // Timestamps of attempts
  lockedUntil: number | null; // Timestamp when lockout ends
}

/**
 * Get the storage key for a specific action and identifier
 */
function getStorageKey(action: string, identifier?: string): string {
  const suffix = identifier ? `_${identifier}` : '';
  return `${RATE_LIMIT_PREFIX}${action}${suffix}`;
}

/**
 * Get the current rate limit state
 */
async function getRateLimitState(
  action: string,
  identifier?: string
): Promise<RateLimitState> {
  try {
    const key = getStorageKey(action, identifier);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as RateLimitState;
    }
  } catch (error) {
    console.error('[RateLimiter] Error getting state:', error);
  }
  return { attempts: [], lockedUntil: null };
}

/**
 * Save the rate limit state
 */
async function saveRateLimitState(
  action: string,
  state: RateLimitState,
  identifier?: string
): Promise<void> {
  try {
    const key = getStorageKey(action, identifier);
    await AsyncStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('[RateLimiter] Error saving state:', error);
  }
}

/**
 * Check if an action is currently rate limited
 */
export async function isRateLimited(
  action: string,
  config: RateLimiterConfig = AUTH_RATE_LIMIT_CONFIG,
  identifier?: string
): Promise<{ limited: boolean; remainingTime: number; attempts: number }> {
  const state = await getRateLimitState(action, identifier);
  const now = Date.now();

  // Check if currently locked out
  if (state.lockedUntil && state.lockedUntil > now) {
    return {
      limited: true,
      remainingTime: state.lockedUntil - now,
      attempts: state.attempts.length,
    };
  }

  // Filter attempts within the window
  const recentAttempts = state.attempts.filter(
    (timestamp) => now - timestamp < config.windowDuration
  );

  return {
    limited: false,
    remainingTime: 0,
    attempts: recentAttempts.length,
  };
}

/**
 * Record a failed attempt
 */
export async function recordFailedAttempt(
  action: string,
  config: RateLimiterConfig = AUTH_RATE_LIMIT_CONFIG,
  identifier?: string
): Promise<{ locked: boolean; remainingAttempts: number; lockoutEndsAt: number | null }> {
  const state = await getRateLimitState(action, identifier);
  const now = Date.now();

  // Filter recent attempts and add new one
  const recentAttempts = state.attempts.filter(
    (timestamp) => now - timestamp < config.windowDuration
  );
  recentAttempts.push(now);

  // Check if we should lock out
  const shouldLock = recentAttempts.length >= config.maxAttempts;
  const lockedUntil = shouldLock ? now + config.lockoutDuration : null;

  const newState: RateLimitState = {
    attempts: recentAttempts,
    lockedUntil,
  };

  await saveRateLimitState(action, newState, identifier);

  return {
    locked: shouldLock,
    remainingAttempts: Math.max(0, config.maxAttempts - recentAttempts.length),
    lockoutEndsAt: lockedUntil,
  };
}

/**
 * Record a successful attempt (clears rate limit for this action)
 */
export async function recordSuccessfulAttempt(
  action: string,
  identifier?: string
): Promise<void> {
  const newState: RateLimitState = {
    attempts: [],
    lockedUntil: null,
  };
  await saveRateLimitState(action, newState, identifier);
}

/**
 * Clear rate limit for a specific action
 */
export async function clearRateLimit(
  action: string,
  identifier?: string
): Promise<void> {
  try {
    const key = getStorageKey(action, identifier);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[RateLimiter] Error clearing rate limit:', error);
  }
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes} dakika ${seconds} saniye`;
  }
  return `${seconds} saniye`;
}

/**
 * Format remaining time short version
 */
export function formatRemainingTimeShort(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
}

// Pre-defined action types
export const RATE_LIMIT_ACTIONS = {
  LOGIN: 'login',
  PASSWORD_RESET: 'password_reset',
  PHONE_VERIFICATION: 'phone_verification',
  EMAIL_VERIFICATION: 'email_verification',
  REGISTRATION: 'registration',
} as const;

export type RateLimitAction = typeof RATE_LIMIT_ACTIONS[keyof typeof RATE_LIMIT_ACTIONS];

// Hook-friendly interface
export interface UseRateLimiterResult {
  isLimited: boolean;
  remainingTime: number;
  remainingAttempts: number;
  formattedTime: string;
  checkLimit: () => Promise<boolean>;
  recordFailure: () => Promise<boolean>;
  recordSuccess: () => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Create a rate limiter instance for a specific action
 */
export function createRateLimiter(
  action: RateLimitAction,
  config: RateLimiterConfig = AUTH_RATE_LIMIT_CONFIG,
  identifier?: string
) {
  return {
    isLimited: () => isRateLimited(action, config, identifier),
    recordFailure: () => recordFailedAttempt(action, config, identifier),
    recordSuccess: () => recordSuccessfulAttempt(action, identifier),
    clear: () => clearRateLimit(action, identifier),
  };
}

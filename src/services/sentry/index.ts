import * as Sentry from '@sentry/react-native';

// Track if Sentry is enabled
let sentryEnabled = false;

// Sentry DSN - Set via environment variable or replace with your actual DSN
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Check if DSN is valid (not a placeholder)
const isValidDsn = (dsn: string): boolean => {
  return dsn.length > 0 &&
         !dsn.includes('your-sentry-dsn') &&
         !dsn.includes('project-id');
};

// Environment detection
const getEnvironment = (): string => {
  if (__DEV__) return 'development';
  return 'production';
};

/**
 * Initialize Sentry for crash tracking and error monitoring
 * Call this in App.tsx before any other code
 */
export function initSentry(): void {
  // Skip Sentry in development or if DSN is not configured
  if (__DEV__ || !isValidDsn(SENTRY_DSN)) {
    console.log('[Sentry] Skipped initialization (development mode or DSN not configured)');
    sentryEnabled = false;
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: getEnvironment(),
      debug: false,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      tracesSampleRate: 0.2, // Sample 20% of transactions in production
      attachScreenshot: true,
      attachViewHierarchy: true,
      enableNativeCrashHandling: true,
      enableAutoPerformanceTracing: true,
      // Ignore common non-critical errors
      ignoreErrors: [
        'Network request failed',
        'Failed to fetch',
        'AbortError',
        'timeout',
      ],
    });
    sentryEnabled = true;
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.warn('[Sentry] Failed to initialize:', error);
    sentryEnabled = false;
  }
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return sentryEnabled && !__DEV__ && isValidDsn(SENTRY_DSN);
}

/**
 * Set user information for error tracking
 * Call this after user login
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}): void {
  if (!isSentryEnabled()) return;
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user information on logout
 */
export function clearUser(): void {
  if (!isSentryEnabled()) return;
  Sentry.setUser(null);
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string {
  // Always log errors in development
  if (__DEV__) {
    console.error('[Sentry] Exception:', error, context);
    return '';
  }
  if (!isSentryEnabled()) return '';
  if (context) {
    Sentry.setContext('additional', context);
  }
  return Sentry.captureException(error);
}

/**
 * Capture a message and send to Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
): string {
  if (__DEV__) {
    console.log('[Sentry] Message:', level, message);
    return '';
  }
  if (!isSentryEnabled()) return '';
  return Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}): void {
  if (!isSentryEnabled()) return;
  Sentry.addBreadcrumb({
    category: breadcrumb.category,
    message: breadcrumb.message,
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
  });
}

/**
 * Set extra context for errors
 */
export function setContext(
  name: string,
  context: Record<string, unknown>
): void {
  if (!isSentryEnabled()) return;
  Sentry.setContext(name, context);
}

/**
 * Set a tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  if (!isSentryEnabled()) return undefined;
  return Sentry.startInactiveSpan({ name, op });
}

/**
 * Wrap the root component with Sentry error boundary
 * Use this in App.tsx: export default Sentry.wrap(App)
 */
export const wrap = Sentry.wrap;

/**
 * Create a Sentry-wrapped error boundary
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

// Export Sentry for advanced usage
export { Sentry };

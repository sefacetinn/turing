import * as Sentry from '@sentry/react-native';

// Sentry DSN - Replace with your actual Sentry DSN
const SENTRY_DSN = 'https://your-sentry-dsn@sentry.io/project-id';

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
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: getEnvironment(),
    debug: __DEV__, // Enable debug mode in development
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // Sample 20% of transactions in production
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
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (__DEV__) {
        console.log('[Sentry] Event captured (not sent in dev):', event.message || event.exception);
        return null;
      }
      return event;
    },
  });
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
  Sentry.setUser(null);
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string {
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
  Sentry.setContext(name, context);
}

/**
 * Set a tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
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

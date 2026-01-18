import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Themed error fallback component
function ErrorFallback({
  error,
  onRetry
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#18181b' : '#ffffff',
    text: isDark ? '#FAFAFA' : '#18181b',
    textMuted: isDark ? '#A1A1AA' : '#71717a',
    cardBg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.cardBg }]}>
          <Ionicons name="warning-outline" size={64} color="#EF4444" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Bir Hata Oluştu</Text>
        <Text style={[styles.message, { color: theme.textMuted }]}>
          Beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.
        </Text>
        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: theme.cardBg }]}>
            <Text style={styles.errorText}>
              {error.message}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you could send error to a logging service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Screen-level error boundary with navigation support
interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName?: string;
  onGoBack?: () => void;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function ScreenErrorFallback({
  error,
  screenName,
  onRetry,
  onGoBack,
}: {
  error: Error | null;
  screenName?: string;
  onRetry: () => void;
  onGoBack?: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#18181b' : '#ffffff',
    text: isDark ? '#FAFAFA' : '#18181b',
    textMuted: isDark ? '#A1A1AA' : '#71717a',
    cardBg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.cardBg }]}>
          <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        </View>
        <Text style={[styles.title, { color: theme.text, fontSize: 20 }]}>
          {screenName ? `${screenName} yüklenemedi` : 'Sayfa yüklenemedi'}
        </Text>
        <Text style={[styles.message, { color: theme.textMuted }]}>
          Bu sayfada bir sorun oluştu. Tekrar deneyebilir veya geri dönebilirsiniz.
        </Text>
        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: theme.cardBg }]}>
            <Text style={styles.errorText} numberOfLines={3}>
              {error.message}
            </Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          {onGoBack && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={onGoBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={theme.text} />
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Geri Dön</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.retryButton, !onGoBack && { flex: 1 }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="white" />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ScreenErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ScreenErrorBoundary [${this.props.screenName || 'Unknown'}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScreenErrorFallback
          error={this.state.error}
          screenName={this.props.screenName}
          onRetry={this.handleRetry}
          onGoBack={this.props.onGoBack}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorDetails: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4B30B8',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

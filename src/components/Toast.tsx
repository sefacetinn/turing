import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastItem extends ToastConfig {
  id: string;
}

// Context
interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast item component
function ToastItem({ toast, onHide }: { toast: ToastItem; onHide: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          border: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
          icon: 'checkmark-circle' as const,
          color: '#10B981',
        };
      case 'error':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          border: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
          icon: 'close-circle' as const,
          color: '#EF4444',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
          border: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)',
          icon: 'warning' as const,
          color: '#F59E0B',
        };
      case 'info':
      default:
        return {
          bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          border: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
          icon: 'information-circle' as const,
          color: '#3B82F6',
        };
    }
  };

  const style = getToastStyle(toast.type || 'info');

  useEffect(() => {
    // Haptic feedback
    if (toast.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (toast.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      animateOut();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={style.icon} size={20} color={style.color} />
      <Text
        style={[
          styles.toastMessage,
          { color: isDark ? '#FAFAFA' : '#18181b' },
        ]}
        numberOfLines={2}
      >
        {toast.message}
      </Text>
      {toast.action && (
        <TouchableOpacity
          onPress={() => {
            toast.action?.onPress();
            animateOut();
          }}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: style.color }]}>
            {toast.action.label}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={animateOut} style={styles.closeButton}>
        <Ionicons name="close" size={18} color={isDark ? '#A1A1AA' : '#71717a'} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...config, id }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 32,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

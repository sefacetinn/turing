import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { EmptyState } from '../components/EmptyState';
import { SkeletonListItem } from '../components/Skeleton';
import { useTheme } from '../theme/ThemeContext';
import {
  Notification,
  NotificationCategory,
  notificationCategories,
  providerNotifications,
  organizerNotifications,
  getNotificationStyle,
  getNotificationCounts,
  filterNotificationsByCategory,
  groupNotificationsByDate,
} from '../data/notificationsData';

interface NotificationsScreenProps {
  isProviderMode?: boolean;
}

export function NotificationsScreen({ isProviderMode = false }: NotificationsScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [isProviderMode]);

  const loadNotifications = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = isProviderMode ? providerNotifications : organizerNotifications;
      setNotifications(data);
      setIsLoading(false);
    }, 600);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const data = isProviderMode ? providerNotifications : organizerNotifications;
      setNotifications(data);
      setRefreshing(false);
    }, 800);
  }, [isProviderMode]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirim silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => setNotifications(prev => prev.filter(n => n.id !== id)),
        },
      ]
    );
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.navigateTo) {
      navigation.navigate(
        notification.navigateTo.screen,
        notification.navigateTo.params
      );
    }
  };

  // Handle long press
  const handleLongPress = (notification: Notification) => {
    const options = [
      !notification.read && {
        text: 'Okundu İşaretle',
        onPress: () => markAsRead(notification.id),
      },
      { text: 'Sil', style: 'destructive' as const, onPress: () => deleteNotification(notification.id) },
      { text: 'İptal', style: 'cancel' as const },
    ].filter(Boolean) as any[];

    Alert.alert(notification.title, 'Ne yapmak istiyorsunuz?', options);
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return filterNotificationsByCategory(notifications, activeCategory);
  }, [notifications, activeCategory]);

  // Grouped notifications
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Counts
  const counts = useMemo(() => {
    return getNotificationCounts(notifications);
  }, [notifications]);

  // Render notification card
  const renderNotificationCard = (notification: Notification) => {
    const style = getNotificationStyle(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
          },
          !notification.read && {
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
          },
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleLongPress(notification)}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
          <Ionicons name={style.icon as any} size={20} color={style.color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text },
                !notification.read && { fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
              {notification.time}
            </Text>
          </View>

          <Text
            style={[styles.notificationMessage, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          {/* Amount badge */}
          {notification.amount && (
            <View style={[styles.amountBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
              <Text style={[styles.amountText, { color: colors.success }]}>
                ₺{notification.amount.toLocaleString('tr-TR')}
              </Text>
            </View>
          )}

          {/* Action button */}
          {notification.action && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}
              onPress={() => handleNotificationPress(notification)}
            >
              <Text style={[styles.actionButtonText, { color: colors.brand[400] }]}>
                {notification.action}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.brand[400]} />
            </TouchableOpacity>
          )}
        </View>

        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.brand[400] }]} />
        )}
      </TouchableOpacity>
    );
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonListItem key={index} style={{ marginBottom: 10 }} />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ScrollHeader
        title="Bildirimler"
        scrollY={scrollY}
        threshold={60}
        showBackButton={true}
        rightAction={
          counts.unread > 0 ? (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={[styles.markAllText, { color: colors.brand[400] }]}>
                Tümünü Oku
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
            progressViewOffset={insets.top + 44}
          />
        }
      >
        {/* Large Title */}
        <LargeTitle
          title="Bildirimler"
          subtitle={counts.unread > 0 ? `${counts.unread} okunmamış bildirim` : 'Tüm bildirimler okundu'}
        />

        {/* Category Tabs */}
        <View style={styles.categoryRow}>
          {notificationCategories.slice(0, 5).map((category) => {
            const isActive = activeCategory === category.key;
            const count = category.key === 'all' ? counts.total :
                         category.key === 'offers' ? counts.offers :
                         category.key === 'messages' ? counts.messages :
                         category.key === 'payments' ? counts.payments :
                         category.key === 'events' ? counts.events : counts.system;

            return (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' },
                  isActive && { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' },
                ]}
                onPress={() => setActiveCategory(category.key)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={14}
                  color={isActive ? colors.brand[400] : colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isActive ? colors.brand[400] : colors.textMuted },
                  ]}
                >
                  {category.label}
                </Text>
                {count > 0 && category.key !== 'all' && (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' },
                      isActive && { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: isActive ? colors.brand[400] : colors.textMuted },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {isLoading ? (
            renderSkeleton()
          ) : Object.keys(groupedNotifications).length > 0 ? (
            Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <View key={date}>
                <Text style={[styles.dateHeader, { color: colors.textMuted }]}>{date}</Text>
                {dateNotifications.map(renderNotificationCard)}
              </View>
            ))
          ) : (
            <EmptyState
              icon="notifications-off-outline"
              title={
                activeCategory === 'all' ? 'Bildirim yok' :
                activeCategory === 'offers' ? 'Teklif bildirimi yok' :
                activeCategory === 'messages' ? 'Mesaj bildirimi yok' :
                activeCategory === 'payments' ? 'Ödeme bildirimi yok' :
                activeCategory === 'events' ? 'Etkinlik bildirimi yok' : 'Sistem bildirimi yok'
              }
              message="Yeni bildirimler burada görünecek."
            />
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 16,
  },
  skeletonContainer: {
    paddingTop: 8,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 11,
  },
  notificationMessage: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  amountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});

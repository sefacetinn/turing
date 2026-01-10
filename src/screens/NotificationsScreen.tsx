import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { notifications } from '../data/mockData';

type NotificationFilter = 'all' | 'unread' | 'offers' | 'messages' | 'system';

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [notificationsList, setNotificationsList] = useState(notifications);

  const filters: { key: NotificationFilter; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'unread', label: 'Okunmamış' },
    { key: 'offers', label: 'Teklifler' },
    { key: 'messages', label: 'Mesajlar' },
    { key: 'system', label: 'Sistem' },
  ];

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notificationsList.filter(n => !n.read);
      case 'offers':
        return notificationsList.filter(n => n.type === 'offer');
      case 'messages':
        return notificationsList.filter(n => n.type === 'message');
      case 'system':
        return notificationsList.filter(n => n.type === 'system' || n.type === 'reminder');
      default:
        return notificationsList;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return { name: 'document-text', color: colors.brand[400], bg: 'rgba(147, 51, 234, 0.15)' };
      case 'message':
        return { name: 'chatbubble', color: colors.success, bg: 'rgba(34, 197, 94, 0.15)' };
      case 'booking':
        return { name: 'calendar', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'review':
        return { name: 'star', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
      case 'payment':
        return { name: 'card', color: colors.success, bg: 'rgba(34, 197, 94, 0.15)' };
      case 'reminder':
        return { name: 'alarm', color: colors.warning, bg: 'rgba(245, 158, 11, 0.15)' };
      case 'system':
        return { name: 'information-circle', color: colors.zinc[400], bg: 'rgba(161, 161, 170, 0.15)' };
      default:
        return { name: 'notifications', color: colors.brand[400], bg: 'rgba(147, 51, 234, 0.15)' };
    }
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotificationsList(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNotificationPress = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'offer':
        navigation.navigate('OfferDetail', { offerId: 'o1' });
        break;
      case 'message':
        navigation.navigate('Chat', { conversationId: 'c1' });
        break;
      case 'booking':
        navigation.navigate('EventDetail', { eventId: 'e1' });
        break;
      default:
        break;
    }
  };

  const filteredNotifications = getFilteredNotifications() || [];
  const unreadCount = (notificationsList || []).filter(n => !n.read).length;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date || 'Diğer';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
            {filter.key === 'unread' && unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedNotifications).map(([date, notifications]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {notifications.map(notification => {
              const icon = getNotificationIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>

                    {notification.action && (
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>{notification.action}</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.brand[400]} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.zinc[600]} />
            <Text style={styles.emptyStateTitle}>Bildirim yok</Text>
            <Text style={styles.emptyStateText}>
              Yeni bildirimler burada görünecek
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 13,
    color: colors.brand[400],
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  filterTabText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  filterTabTextActive: {
    color: colors.brand[400],
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.zinc[500],
    marginTop: 20,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationUnread: {
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderColor: 'rgba(147, 51, 234, 0.1)',
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
    color: colors.text,
    flex: 1,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.zinc[500],
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: colors.zinc[400],
    marginTop: 4,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.brand[400],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand[400],
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.zinc[500],
    marginTop: 4,
    textAlign: 'center',
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

type NotificationTab = 'all' | 'offers' | 'messages' | 'system';

// Local notification data
const localNotifications = [
  { id: 'n1', type: 'offer', title: 'Yeni Teklif Alındı', message: 'Pro Sound Istanbul ses sistemi için ₺85.000 teklif gönderdi.', time: '5 dk önce', date: 'Bugün', read: false, action: 'Teklifi İncele' },
  { id: 'n2', type: 'message', title: 'Yeni Mesaj', message: 'SecurePro Güvenlik size mesaj gönderdi.', time: '1 saat önce', date: 'Bugün', read: false, action: 'Mesajı Oku' },
  { id: 'n3', type: 'reminder', title: 'Etkinlik Hatırlatması', message: 'Yaz Festivali 2024 için 30 gün kaldı.', time: '3 saat önce', date: 'Bugün', read: true, action: 'Etkinliğe Git' },
  { id: 'n4', type: 'offer', title: 'Teklif Kabul Edildi', message: 'SecurePro Güvenlik teklifiniz onaylandı.', time: '14:30', date: 'Dün', read: true, action: null },
  { id: 'n5', type: 'system', title: 'Profil Tamamlama', message: 'Profilinizi %80 tamamladınız.', time: '10:00', date: 'Dün', read: true, action: 'Profili Tamamla' },
  { id: 'n6', type: 'message', title: 'Yeni Mesaj', message: 'Elite VIP Transfer size mesaj gönderdi.', time: '09:15', date: 'Dün', read: true, action: 'Mesajı Oku' },
  { id: 'n7', type: 'offer', title: 'Karşı Teklif', message: 'LightShow Pro ₺95.000 karşı teklif gönderdi.', time: '16:45', date: '2 gün önce', read: true, action: 'Teklifi İncele' },
];

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notificationsList, setNotificationsList] = useState(localNotifications);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');

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

  const handleNotificationPress = (notification: typeof localNotifications[0]) => {
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

  const unreadCount = notificationsList.filter(n => !n.read).length;

  // Filter notifications by tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notificationsList;
    if (activeTab === 'offers') return notificationsList.filter(n => n.type === 'offer');
    if (activeTab === 'messages') return notificationsList.filter(n => n.type === 'message');
    if (activeTab === 'system') return notificationsList.filter(n => n.type === 'system' || n.type === 'reminder');
    return notificationsList;
  }, [notificationsList, activeTab]);

  // Count by type
  const offerCount = notificationsList.filter(n => n.type === 'offer').length;
  const messageCount = notificationsList.filter(n => n.type === 'message').length;
  const systemCount = notificationsList.filter(n => n.type === 'system' || n.type === 'reminder').length;

  // Group notifications by date
  const groupedNotifications: Record<string, typeof localNotifications> = {};
  for (const notification of filteredNotifications) {
    const date = notification.date || 'Diğer';
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  }

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

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'all' && styles.tabButtonTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'offers' && styles.tabButtonActive]}
          onPress={() => setActiveTab('offers')}
        >
          <Ionicons
            name="document-text"
            size={12}
            color={activeTab === 'offers' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabButtonText, activeTab === 'offers' && styles.tabButtonTextActive]}>
            Teklifler
          </Text>
          {offerCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'offers' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'offers' && styles.tabBadgeTextActive]}>{offerCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'messages' && styles.tabButtonActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons
            name="chatbubble"
            size={12}
            color={activeTab === 'messages' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabButtonText, activeTab === 'messages' && styles.tabButtonTextActive]}>
            Mesajlar
          </Text>
          {messageCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'messages' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'messages' && styles.tabBadgeTextActive]}>{messageCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'system' && styles.tabButtonActive]}
          onPress={() => setActiveTab('system')}
        >
          <Ionicons
            name="information-circle"
            size={12}
            color={activeTab === 'system' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabButtonText, activeTab === 'system' && styles.tabButtonTextActive]}>
            Sistem
          </Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'all' ? 'Bildirim yok' :
               activeTab === 'offers' ? 'Teklif bildirimi yok' :
               activeTab === 'messages' ? 'Mesaj bildirimi yok' : 'Sistem bildirimi yok'}
            </Text>
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  tabButtonTextActive: {
    color: colors.brand[400],
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.zinc[500],
  },
  tabBadgeTextActive: {
    color: colors.brand[400],
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

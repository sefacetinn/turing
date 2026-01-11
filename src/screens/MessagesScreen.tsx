import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

type MessageTab = 'all' | 'unread' | 'archived';

interface MessagesScreenProps {
  isProviderMode: boolean;
}

const conversations = [
  { id: 'c1', name: 'Pro Sound Istanbul', message: 'Teknik detayları görüşmek isteriz...', time: '2 dk', unread: 3, avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100', archived: false },
  { id: 'c2', name: 'Elite Transfer', message: 'Araç hazır, onayınızı bekliyoruz.', time: '1 saat', unread: 0, avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100', archived: false },
  { id: 'c3', name: 'Grand Hotel', message: 'Oda rezervasyonu tamamlandı.', time: '3 saat', unread: 1, avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100', archived: false },
  { id: 'c4', name: 'Dream Decor', message: 'Renk paletiyle ilgili sorunuz var mı?', time: 'Dün', unread: 0, avatar: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=100', archived: false },
  { id: 'c5', name: 'SecurePro Güvenlik', message: 'Güvenlik planı hazır.', time: '2 gün', unread: 2, avatar: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=100', archived: false },
  { id: 'c6', name: 'Lezzet Catering', message: 'Menü seçeneklerini gönderdik.', time: '3 gün', unread: 0, avatar: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=100', archived: true },
  { id: 'c7', name: 'Stage Tech', message: 'Sahne kurulumu tamamlandı.', time: '1 hafta', unread: 0, avatar: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100', archived: true },
];

export function MessagesScreen({ isProviderMode }: MessagesScreenProps) {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');

  const filteredConversations = useMemo(() => {
    if (activeTab === 'all') return conversations.filter(c => !c.archived);
    if (activeTab === 'unread') return conversations.filter(c => c.unread > 0 && !c.archived);
    if (activeTab === 'archived') return conversations.filter(c => c.archived);
    return conversations;
  }, [activeTab]);

  const unreadCount = conversations.filter(c => c.unread > 0 && !c.archived).length;
  const archivedCount = conversations.filter(c => c.archived).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.zinc[500]} />
        <Text style={styles.searchPlaceholder}>Mesajlarda ara...</Text>
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
          style={[styles.tabButton, activeTab === 'unread' && styles.tabButtonActive]}
          onPress={() => setActiveTab('unread')}
        >
          <Ionicons
            name="mail-unread"
            size={12}
            color={activeTab === 'unread' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabButtonText, activeTab === 'unread' && styles.tabButtonTextActive]}>
            Okunmamış
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'unread' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'unread' && styles.tabBadgeTextActive]}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'archived' && styles.tabButtonActive]}
          onPress={() => setActiveTab('archived')}
        >
          <Ionicons
            name="archive"
            size={12}
            color={activeTab === 'archived' ? colors.brand[400] : colors.zinc[500]}
          />
          <Text style={[styles.tabButtonText, activeTab === 'archived' && styles.tabButtonTextActive]}>
            Arşiv
          </Text>
          {archivedCount > 0 && (
            <View style={[styles.tabBadge, activeTab === 'archived' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'archived' && styles.tabBadgeTextActive]}>{archivedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Conversations */}
        <View style={styles.conversationsList}>
          {filteredConversations.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.conversationItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Chat', { conversationId: chat.id })}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: chat.avatar }} style={styles.avatar} />
                {chat.unread > 0 && (
                  <View style={styles.onlineDot} />
                )}
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationName, chat.unread > 0 && styles.unreadName]}>
                    {chat.name}
                  </Text>
                  <Text style={styles.conversationTime}>{chat.time}</Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text
                    style={[styles.conversationMessage, chat.unread > 0 && styles.unreadMessage]}
                    numberOfLines={1}
                  >
                    {chat.message}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredConversations.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name={activeTab === 'unread' ? 'mail-open-outline' : activeTab === 'archived' ? 'archive-outline' : 'chatbubbles-outline'}
                size={48}
                color={colors.zinc[600]}
              />
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'unread' ? 'Okunmamış mesaj yok' :
                 activeTab === 'archived' ? 'Arşivlenmiş mesaj yok' : 'Mesaj yok'}
              </Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'unread' ? 'Tüm mesajlarınız okunmuş' :
                 activeTab === 'archived' ? 'Arşive taşınan mesajlar burada görünecek' : 'Yeni mesajlar burada görünecek'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  newMessageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.zinc[600],
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
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
  conversationsList: {
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  unreadName: {
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.zinc[500],
    marginRight: 8,
  },
  unreadMessage: {
    color: colors.zinc[400],
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
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

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { EmptyState } from '../components/EmptyState';
import { SkeletonMessageList } from '../components/Skeleton';
import { OptimizedImage } from '../components/OptimizedImage';
import { darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { scrollToTopEmitter } from '../utils/scrollToTop';

// Default colors for static styles (dark theme)
const colors = defaultColors;

type MessageTab = 'all' | 'unread' | 'archived';

interface MessagesScreenProps {
  isProviderMode: boolean;
}

const initialConversations = [
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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(initialConversations);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Subscribe to scroll-to-top events
  useEffect(() => {
    const unsubscribe = scrollToTopEmitter.subscribe((tabName) => {
      if (tabName === 'MessagesTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Handle long press on conversation
  const handleLongPress = (chat: typeof conversations[0]) => {
    const options = chat.archived
      ? [
          { text: 'Arşivden Çıkar', onPress: () => toggleArchive(chat.id) },
          { text: 'Sil', style: 'destructive' as const, onPress: () => deleteConversation(chat.id) },
          { text: 'İptal', style: 'cancel' as const },
        ]
      : [
          { text: 'Arşivle', onPress: () => toggleArchive(chat.id) },
          { text: 'Okundu İşaretle', onPress: () => markAsRead(chat.id) },
          { text: 'Sil', style: 'destructive' as const, onPress: () => deleteConversation(chat.id) },
          { text: 'İptal', style: 'cancel' as const },
        ];

    Alert.alert(chat.name, 'Ne yapmak istiyorsunuz?', options);
  };

  // Toggle archive status
  const toggleArchive = (id: string) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c)
    );
  };

  // Mark as read
  const markAsRead = (id: string) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unread: 0 } : c)
    );
  };

  // Delete conversation
  const deleteConversation = (id: string) => {
    Alert.alert(
      'Sohbeti Sil',
      'Bu sohbet kalıcı olarak silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => setConversations(prev => prev.filter(c => c.id !== id)),
        },
      ]
    );
  };

  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Filter by tab
    if (activeTab === 'all') result = result.filter(c => !c.archived);
    else if (activeTab === 'unread') result = result.filter(c => c.unread > 0 && !c.archived);
    else if (activeTab === 'archived') result = result.filter(c => c.archived);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.message.toLowerCase().includes(query)
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  const unreadCount = conversations.filter(c => c.unread > 0 && !c.archived).length;
  const archivedCount = conversations.filter(c => c.archived).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Scroll Header */}
      <ScrollHeader
        title="Mesajlar"
        scrollY={scrollY}
        threshold={60}
        showBackButton={true}
        rightAction={
          <TouchableOpacity
            style={styles.newMessageButton}
            onPress={() => navigation.navigate('Search', { initialFilter: 'providers', mode: 'newChat' })}
            accessibilityRole="button"
            accessibilityLabel="Yeni mesaj oluştur"
            accessibilityHint="Yeni bir sohbet başlatmak için firma arayın"
          >
            <Ionicons name="create-outline" size={22} color={colors.brand[400]} />
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 100 }}
      >
        {/* Large Title */}
        <LargeTitle
          title="Mesajlar"
          subtitle={`${unreadCount} okunmamış mesaj`}
        />

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Mesajlarda ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Mesajlarda ara"
            accessibilityHint="Sohbetleri ada veya içeriğe göre filtreleyin"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Aramayı temizle"
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('all')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'all' }}
              accessibilityLabel="Tüm mesajlar"
            >
              <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.brand[400] : colors.textMuted }]}>
                Tümü
              </Text>
              {activeTab === 'all' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('unread')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'unread' }}
              accessibilityLabel={`Okunmamış mesajlar, ${unreadCount} adet`}
            >
              <Text style={[styles.tabText, { color: activeTab === 'unread' ? colors.brand[400] : colors.textMuted }]}>
                Okunmamış {unreadCount > 0 && `(${unreadCount})`}
              </Text>
              {activeTab === 'unread' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('archived')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'archived' }}
              accessibilityLabel={`Arşivlenmiş mesajlar, ${archivedCount} adet`}
            >
              <Text style={[styles.tabText, { color: activeTab === 'archived' ? colors.brand[400] : colors.textMuted }]}>
                Arşiv {archivedCount > 0 && `(${archivedCount})`}
              </Text>
              {activeTab === 'archived' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Conversations */}
        <View style={styles.conversationsList}>
          {isLoading ? (
            <SkeletonMessageList count={5} />
          ) : filteredConversations.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.conversationItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Chat', { conversationId: chat.id })}
              onLongPress={() => handleLongPress(chat)}
              delayLongPress={500}
              accessibilityRole="button"
              accessibilityLabel={`${chat.name} ile sohbet${chat.unread > 0 ? `, ${chat.unread} okunmamış mesaj` : ''}`}
              accessibilityHint="Sohbeti açmak için dokunun, seçenekler için basılı tutun"
            >
              <View style={styles.avatarContainer}>
                <OptimizedImage source={chat.avatar} style={styles.avatar} />
                {chat.unread > 0 && (
                  <View style={styles.onlineDot} />
                )}
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationName, { color: colors.text }, chat.unread > 0 && styles.unreadName]}>
                    {chat.name}
                  </Text>
                  <Text style={[styles.conversationTime, { color: colors.textMuted }]}>{chat.time}</Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text
                    style={[styles.conversationMessage, { color: colors.textMuted }]}
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

          {!isLoading && filteredConversations.length === 0 && (
            <EmptyState
              icon={activeTab === 'unread' ? 'mail-open-outline' : activeTab === 'archived' ? 'archive-outline' : 'chatbubbles-outline'}
              title={activeTab === 'unread' ? 'Okunmamış mesaj yok' :
                     activeTab === 'archived' ? 'Arşivlenmiş mesaj yok' : 'Mesaj yok'}
              message={activeTab === 'unread' ? 'Tüm mesajlarınız okunmuş.' :
                       activeTab === 'archived' ? 'Arşive taşınan mesajlar burada görünecek.' : 'Yeni mesajlar burada görünecek.'}
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  tabContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tabContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
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
  },
  unreadName: {
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
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
});

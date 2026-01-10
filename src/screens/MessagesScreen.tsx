import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

interface MessagesScreenProps {
  isProviderMode: boolean;
}

const conversations = [
  { id: 'c1', name: 'Pro Sound Istanbul', message: 'Teknik detayları görüşmek isteriz...', time: '2 dk', unread: 3, avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100' },
  { id: 'c2', name: 'Elite Transfer', message: 'Araç hazır, onayınızı bekliyoruz.', time: '1 saat', unread: 0, avatar: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100' },
  { id: 'c3', name: 'Grand Hotel', message: 'Oda rezervasyonu tamamlandı.', time: '3 saat', unread: 1, avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100' },
  { id: 'c4', name: 'Dream Decor', message: 'Renk paletiyle ilgili sorunuz var mı?', time: 'Dün', unread: 0, avatar: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=100' },
];

export function MessagesScreen({ isProviderMode }: MessagesScreenProps) {
  const navigation = useNavigation<any>();
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Conversations */}
        <View style={styles.conversationsList}>
          {conversations.map((chat) => (
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
});

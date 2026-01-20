import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../../../components/navigation';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useArtists, FirestoreArtist } from '../../../hooks';
import * as Haptics from 'expo-haptics';

type TabType = 'all' | 'available' | 'on_tour' | 'inactive';

export function ArtistRosterScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Auth and data hooks
  const { user } = useAuth();
  const { artists, loading: artistsLoading } = useArtists(user?.uid);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => ({
    totalArtists: artists.length,
    availableArtists: artists.filter(a => a.availability === 'available' && a.status === 'active').length,
    upcomingShows: artists.reduce((sum, a) => sum + (a.totalShows || 0), 0),
    totalRevenue: artists.reduce((sum, a) => sum + (a.totalRevenue || 0), 0),
  }), [artists]);

  const filteredArtists = useMemo(() => {
    let filtered = artists;

    if (activeTab === 'available') {
      filtered = filtered.filter(a => a.availability === 'available' && a.status === 'active');
    } else if (activeTab === 'on_tour') {
      filtered = filtered.filter(a => a.status === 'on_tour');
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(a => a.status === 'inactive');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        (a.stageName && a.stageName.toLowerCase().includes(query)) ||
        a.genre.some(g => g.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [artists, activeTab, searchQuery]);

  const getAvailabilityInfo = (artist: FirestoreArtist) => {
    switch (artist.availability) {
      case 'available':
        return { label: 'Müsait', color: '#10B981' };
      case 'busy':
        return { label: 'Meşgul', color: '#EF4444' };
      case 'limited':
        return { label: 'Sınırlı', color: '#F59E0B' };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted };
    }
  };

  const tabs = [
    { key: 'all' as TabType, label: 'Tümü', count: artists.length },
    { key: 'available' as TabType, label: 'Müsait', count: stats.availableArtists },
    { key: 'on_tour' as TabType, label: 'Turnede', count: artists.filter(a => a.status === 'on_tour').length },
    { key: 'inactive' as TabType, label: 'Pasif', count: artists.filter(a => a.status === 'inactive').length },
  ];

  const handleTabChange = (tab: TabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const formatFollowers = (num: string) => {
    const n = parseInt(num.replace(/[^0-9]/g, ''));
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return num;
  };

  const renderArtistItem = (artist: FirestoreArtist, index: number) => {
    const availabilityInfo = getAvailabilityInfo(artist);
    const displayName = artist.stageName || artist.name;
    const primaryGenre = artist.genre[0] || 'Tür belirtilmemiş';

    return (
      <TouchableOpacity
        key={artist.id}
        style={[
          styles.artistItem,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
          index === 0 && styles.artistItemFirst,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('ArtistDetailManage', { artistId: artist.id });
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <OptimizedImage source={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'} style={styles.avatar} />
          <View style={[styles.statusDot, { backgroundColor: availabilityInfo.color }]} />
        </View>

        {/* Info */}
        <View style={styles.artistInfo}>
          <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.artistMeta, { color: colors.textMuted }]} numberOfLines={1}>
            {primaryGenre}{artist.priceRange ? ` • ${artist.priceRange}` : ''}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.artistStats}>
          <View style={styles.statBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.statText, { color: colors.text }]}>{artist.rating}</Text>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Sanatçılar"
        scrollY={scrollY}
        showBackButton
        rightAction={
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand[500] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('AddEditArtist');
            }}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 44 }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        <LargeTitle
          title="Sanatçılar"
          subtitle={`${stats.totalArtists} sanatçı`}
          scrollY={scrollY}
        />

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
            <Text style={[styles.quickStatValue, { color: '#10B981' }]}>{stats.availableArtists}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Müsait</Text>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
            <Text style={[styles.quickStatValue, { color: '#F59E0B' }]}>{stats.upcomingShows}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Gösteri</Text>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)' }]}>
            <Text style={[styles.quickStatValue, { color: '#6366F1' }]}>{(stats.totalRevenue / 1000).toFixed(0)}K</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Gelir</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F5F5F5',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Sanatçı veya tür ara..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSearchQuery('');
              }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabs}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  isActive && { backgroundColor: colors.brand[500] },
                  !isActive && { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F5' },
                ]}
                onPress={() => handleTabChange(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? 'white' : colors.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      { color: isActive ? 'white' : colors.textMuted },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Artists List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.textMuted }]}>
              {filteredArtists.length} Sanatçı
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={16} color={colors.textMuted} />
              <Text style={[styles.sortText, { color: colors.textMuted }]}>Sırala</Text>
            </TouchableOpacity>
          </View>

          {filteredArtists.length > 0 ? (
            <View style={[
              styles.listContainer,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
              }
            ]}>
              {filteredArtists.map((artist, index) => (
                <View key={artist.id}>
                  {renderArtistItem(artist, index)}
                  {index < filteredArtists.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F5' }]}>
                <Ionicons name="musical-notes-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {artists.length === 0 ? 'Henüz sanatçı eklenmedi' : 'Sanatçı bulunamadı'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {artists.length === 0
                  ? 'Sağ üstteki + butonuna tıklayarak sanatçı ekleyebilirsiniz'
                  : 'Arama kriterlerinize uygun sonuç yok'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickStatItem: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Search
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  // Tabs
  tabs: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // List Section
  listSection: {},
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
  },
  listContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Artist Item
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  artistItemFirst: {},
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '600',
  },
  artistMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  artistStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginLeft: 78,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  Artist,
  mockArtists,
  mockContracts,
  getArtistStats,
} from '../../../data/provider/artistData';

type TabType = 'all' | 'available' | 'on_tour' | 'inactive';

const genreColors: Record<string, [string, string]> = {
  Electronic: ['#9333EA', '#C084FC'],
  House: ['#3B82F6', '#60A5FA'],
  Techno: ['#10B981', '#34D399'],
  Pop: ['#EC4899', '#F472B6'],
  'R&B': ['#F59E0B', '#FBBF24'],
  Rock: ['#EF4444', '#F87171'],
  Alternative: ['#6366F1', '#818CF8'],
  'Deep House': ['#0EA5E9', '#38BDF8'],
  'Melodic Techno': ['#8B5CF6', '#A78BFA'],
  'Turkish Pop': ['#F43F5E', '#FB7185'],
};

export function ArtistRosterScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => getArtistStats(), []);

  const filteredArtists = useMemo(() => {
    let filtered = mockArtists;

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
  }, [activeTab, searchQuery]);

  const getAvailabilityInfo = (artist: Artist) => {
    switch (artist.availability) {
      case 'available':
        return { label: 'Musait', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'busy':
        return { label: 'Mesgul', color: '#EF4444', icon: 'close-circle' as const };
      case 'limited':
        return { label: 'Sinirli', color: '#F59E0B', icon: 'warning' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const tabs = [
    { key: 'all' as TabType, label: 'Tumu', count: mockArtists.length },
    { key: 'available' as TabType, label: 'Musait', count: stats.availableArtists },
    { key: 'on_tour' as TabType, label: 'Turnede', count: mockArtists.filter(a => a.status === 'on_tour').length },
    { key: 'inactive' as TabType, label: 'Pasif', count: mockArtists.filter(a => a.status === 'inactive').length },
  ];

  const renderArtistCard = (artist: Artist) => {
    const availabilityInfo = getAvailabilityInfo(artist);
    const upcomingShowsCount = artist.upcomingShows.length;
    const primaryGenre = artist.genre[0];
    const genreGradient = genreColors[primaryGenre] || ['#6366F1', '#818CF8'];

    return (
      <TouchableOpacity
        key={artist.id}
        style={[
          styles.artistCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ArtistDetailManage', { artistId: artist.id })}
      >
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: artist.coverImage }} style={styles.cardCoverImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardImageGradient}
            locations={[0, 0.4, 1]}
          />

          <View style={styles.topLeftBadges}>
            <LinearGradient
              colors={genreGradient}
              style={styles.genreBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="musical-notes" size={12} color="white" />
              <Text style={styles.genreText}>{primaryGenre}</Text>
            </LinearGradient>
          </View>

          <View style={styles.topRightBadges}>
            <View style={[styles.availabilityBadge, { backgroundColor: `${availabilityInfo.color}30` }]}>
              <Ionicons name={availabilityInfo.icon} size={12} color={availabilityInfo.color} />
              <Text style={[styles.availabilityText, { color: availabilityInfo.color }]}>
                {availabilityInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.artistImageContainer}>
            <Image source={{ uri: artist.image }} style={styles.artistImage} />
          </View>

          <View style={styles.cardImageContent}>
            <Text style={styles.artistName} numberOfLines={1}>
              {artist.stageName || artist.name}
            </Text>
            {artist.stageName && (
              <Text style={styles.artistRealName}>{artist.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={14} color={colors.brand[400]} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{artist.rating}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Puan</Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="musical-note" size={14} color={colors.brand[400]} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{artist.stats.totalShows}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Gosteriler</Text>
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={14} color={colors.brand[400]} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{artist.stats.followers}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Takipci</Text>
              </View>
            </View>
          </View>

          <View style={[styles.priceRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
            <View style={styles.priceInfo}>
              <Ionicons name="cash-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Ucret Araligi</Text>
            </View>
            <Text style={[styles.priceValue, { color: colors.text }]}>{artist.priceRange}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.upcomingInfo}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.upcomingText, { color: colors.textMuted }]}>
                {upcomingShowsCount > 0
                  ? `${upcomingShowsCount} yaklasan etkinlik`
                  : 'Yaklasan etkinlik yok'}
              </Text>
            </View>
            <View style={styles.genreTags}>
              {artist.genre.slice(1, 3).map((g, i) => (
                <View key={i} style={[styles.genreTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Text style={[styles.genreTagText, { color: colors.textMuted }]}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sanatci Kadrosu</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {stats.totalArtists} sanatci, {stats.upcomingShows} yaklasan gosteriler
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)',
              borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)',
            },
          ]}
          onPress={() => navigation.navigate('AddEditArtist')}
        >
          <Ionicons name="add" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsSummary, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.brand[400] }]}>{stats.activeArtists}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Aktif</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>{stats.availableArtists}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Musait</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{stats.pendingContracts}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Bekleyen Sozlesme</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {(stats.totalRevenue / 1000).toFixed(0)}K
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Gelir</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Sanatci ara..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={styles.tabContent}>
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab.key ? colors.brand[400] : colors.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor: activeTab === tab.key
                        ? 'rgba(147, 51, 234, 0.2)'
                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      { color: activeTab === tab.key ? colors.brand[400] : colors.textMuted },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </View>
              {activeTab === tab.key && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Artists List */}
      <ScrollView
        style={styles.artistsList}
        contentContainerStyle={styles.artistsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        {filteredArtists.length > 0 ? (
          filteredArtists.map(renderArtistCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sanatci bulunamadi</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              Arama kriterlerinize uygun sanatci yok
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statsSummary: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  summaryLabel: { fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  summaryDivider: { width: 1, height: 30 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabContainer: {
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tabScroll: { paddingHorizontal: 20, gap: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 8, position: 'relative' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 11, fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, borderRadius: 1 },
  artistsList: { flex: 1 },
  artistsListContent: { paddingHorizontal: 20, gap: 16 },
  artistCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageContainer: { height: 140, position: 'relative' },
  cardCoverImage: { width: '100%', height: '100%' },
  cardImageGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  topLeftBadges: { position: 'absolute', top: 12, left: 12 },
  genreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  genreText: { fontSize: 11, fontWeight: '600', color: 'white' },
  topRightBadges: { position: 'absolute', top: 12, right: 12 },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  availabilityText: { fontSize: 10, fontWeight: '600' },
  artistImageContainer: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  artistImage: { width: '100%', height: '100%' },
  cardImageContent: { position: 'absolute', bottom: 12, left: 92, right: 12 },
  artistName: { fontSize: 18, fontWeight: '700', color: 'white' },
  artistRealName: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cardContent: { padding: 16, paddingTop: 8 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },
  statDivider: { width: 1, height: 30 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  priceInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceLabel: { fontSize: 12 },
  priceValue: { fontSize: 13, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upcomingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  upcomingText: { fontSize: 11 },
  genreTags: { flexDirection: 'row', gap: 6 },
  genreTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  genreTagText: { fontSize: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },
});

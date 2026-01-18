import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage, Thumbnail } from '../components/OptimizedImage';

type SearchScreenParams = {
  Search: {
    initialFilter?: 'all' | 'artists' | 'providers' | 'venues';
    initialQuery?: string;
    mode?: 'default' | 'newChat';
  };
};

// Default colors for static styles
const colors = defaultColors;

// Local data
const artists = [
  { id: '1', name: 'Mabel Matiz', genre: 'Alternatif Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', rating: 4.9, type: 'artist', reviewCount: 128 },
  { id: '2', name: 'DJ Burak Yeter', genre: 'EDM / House', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', rating: 4.8, type: 'artist', reviewCount: 95 },
  { id: '3', name: 'Duman', genre: 'Rock', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', rating: 4.9, type: 'artist', reviewCount: 312 },
  { id: '4', name: 'Mor ve Ötesi', genre: 'Alternative Rock', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400', rating: 4.7, type: 'artist', reviewCount: 186 },
  { id: '5', name: 'Sezen Aksu', genre: 'Pop', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', rating: 5.0, type: 'artist', reviewCount: 547 },
  { id: '6', name: 'Tarkan', genre: 'Pop', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', rating: 4.9, type: 'artist', reviewCount: 423 },
  { id: '7', name: 'Şebnem Ferah', genre: 'Rock', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400', rating: 4.8, type: 'artist', reviewCount: 198 },
  { id: '8', name: 'Athena', genre: 'Ska / Rock', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400', rating: 4.6, type: 'artist', reviewCount: 87 },
];

const providers = [
  { id: 'p1', name: 'Pro Sound Istanbul', category: 'technical', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400', rating: 4.9, type: 'provider', reviewCount: 64 },
  { id: 'p2', name: 'Elite VIP Transfer', category: 'transport', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', rating: 4.8, type: 'provider', reviewCount: 112 },
  { id: 'p3', name: 'Stage Masters', category: 'technical', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400', rating: 4.7, type: 'provider', reviewCount: 43 },
  { id: 'p4', name: 'Backstage Catering', category: 'operation', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', rating: 4.5, type: 'provider', reviewCount: 28 },
];

const categories = [
  { id: 'booking', name: 'Booking', icon: 'musical-notes', gradient: ['#4b30b8', '#4b30b8'] },
  { id: 'technical', name: 'Teknik', icon: 'volume-high', gradient: ['#059669', '#34d399'] },
  { id: 'venue', name: 'Mekan', icon: 'business', gradient: ['#2563eb', '#60a5fa'] },
  { id: 'accommodation', name: 'Konaklama', icon: 'bed', gradient: ['#db2777', '#f472b6'] },
  { id: 'transport', name: 'Ulaşım', icon: 'car', gradient: ['#dc2626', '#f87171'] },
  { id: 'operation', name: 'Operasyon', icon: 'settings', gradient: ['#d97706', '#fbbf24'] },
];

type FilterType = 'all' | 'artists' | 'providers' | 'venues';
type SortType = 'relevance' | 'rating' | 'price_low' | 'price_high';

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SearchScreenParams, 'Search'>>();
  const { colors, isDark, helpers } = useTheme();

  // Get initial values from route params
  const initialFilter = route.params?.initialFilter || 'all';
  const initialQuery = route.params?.initialQuery || '';
  const isNewChatMode = route.params?.mode === 'newChat';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterType>(isNewChatMode ? 'providers' : initialFilter);
  const [sortBy, setSortBy] = useState<SortType>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);

  // Update filter when route params change
  useEffect(() => {
    if (isNewChatMode) {
      setActiveFilter('providers');
    } else if (route.params?.initialFilter) {
      setActiveFilter(route.params.initialFilter);
    }
    if (route.params?.initialQuery !== undefined) {
      setSearchQuery(route.params.initialQuery);
    }
  }, [route.params, isNewChatMode]);

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'Tümü', icon: 'apps' },
    { key: 'artists', label: 'Sanatçılar', icon: 'musical-notes' },
    { key: 'providers', label: 'Hizmetler', icon: 'briefcase' },
    { key: 'venues', label: 'Mekanlar', icon: 'location' },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'relevance', label: 'Alaka Düzeyi' },
    { key: 'rating', label: 'En Yüksek Puan' },
    { key: 'price_low', label: 'En Düşük Fiyat' },
    { key: 'price_high', label: 'En Yüksek Fiyat' },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setMinRating(0);
    setSortBy('relevance');
  };

  const getFilteredResults = () => {
    let results: any[] = [];

    if (activeFilter === 'all' || activeFilter === 'artists') {
      results = [...results, ...(artists || []).map(a => ({ ...a, type: 'artist' }))];
    }
    if (activeFilter === 'all' || activeFilter === 'providers') {
      results = [...results, ...(providers || []).map(p => ({ ...p, type: 'provider' }))];
    }

    // Filter by search query
    if (searchQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.genre && item.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by rating
    if (minRating > 0) {
      results = results.filter(item => item.rating >= minRating);
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
      case 'price_high':
        // For demo, just shuffle
        break;
      default:
        break;
    }

    return results;
  };

  const results = getFilteredResults();

  const handleItemPress = useCallback((item: any) => {
    if (isNewChatMode) {
      // In new chat mode, directly start a chat with this person/provider
      navigation.navigate('Chat', {
        providerId: item.id,
        providerName: item.name,
        providerImage: item.image,
      });
    } else {
      // Default mode - navigate to profile
      if (item.type === 'artist') {
        navigation.navigate('ArtistDetail', { artistId: item.id });
      } else {
        navigation.navigate('ProviderDetail', { providerId: item.id });
      }
    }
  }, [navigation, isNewChatMode]);

  // Simple chat item for newChat mode
  const renderChatItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.chatItem, {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
      }]}
      onPress={() => handleItemPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} ile sohbet başlat`}
      accessibilityHint="Dokunarak sohbet başlatın"
    >
      <OptimizedImage source={item.image} style={styles.chatItemAvatar} />
      <View style={styles.chatItemInfo}>
        <Text style={[styles.chatItemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.chatItemCategory, { color: colors.textMuted }]}>
          {item.genre || item.subcategory || item.category}
        </Text>
      </View>
      <View style={[styles.chatItemAction, {
        backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
      }]}>
        <Ionicons name="chatbubble-outline" size={18} color={colors.brand[400]} />
      </View>
    </TouchableOpacity>
  ), [isDark, colors, handleItemPress]);

  const renderResultItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultCard, {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        ...(isDark ? {} : helpers.getShadow('sm'))
      }]}
      onPress={() => handleItemPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.type === 'artist' ? 'Sanatçı' : 'Hizmet'}, ${item.rating} puan`}
      accessibilityHint="Detayları görmek için dokunun"
    >
      <Thumbnail source={item.image} width={100} height={100} borderRadius={12} />
      <View style={styles.resultInfo}>
        <View style={styles.resultHeader}>
          <View style={styles.resultNameRow}>
            <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} />
            )}
          </View>
          <View style={[styles.typeBadge, {
            backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
          }]}>
            <Text style={[styles.typeBadgeText, { color: colors.brand[400] }]}>
              {item.type === 'artist' ? 'Sanatçı' : 'Hizmet'}
            </Text>
          </View>
        </View>

        <Text style={[styles.resultCategory, { color: colors.textMuted }]}>
          {item.genre || item.subcategory || item.category}
        </Text>

        <View style={styles.resultMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
            <Text style={[styles.reviewCount, { color: colors.textMuted }]}>({item.reviewCount || 0})</Text>
          </View>

          {item.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.resultFooter}>
          <Text style={[styles.priceText, { color: colors.brand[400] }]}>{item.price}</Text>
          <TouchableOpacity style={[styles.contactButton, {
            backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
          }]}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), [isDark, colors, helpers, handleItemPress]);

  const keyExtractor = useCallback((item: any) => `${item.type}-${item.id}`, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.searchContainer, {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
        }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={isNewChatMode ? "Firma ara..." : "Sanatçı, hizmet veya mekan ara..."}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            accessibilityLabel={isNewChatMode ? "Firma ara" : "Sanatçı, hizmet veya mekan ara"}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Aramayı temizle"
            >
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {!isNewChatMode && (
          <TouchableOpacity
            style={[styles.filterButton, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
            }, showFilters && {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
            }]}
            onPress={() => setShowFilters(!showFilters)}
            accessibilityRole="button"
            accessibilityLabel={showFilters ? "Filtreleri gizle" : "Filtreleri göster"}
            accessibilityState={{ expanded: showFilters }}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={showFilters ? colors.brand[400] : colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs - hide in newChat mode */}
      {!isNewChatMode && (
        <View style={styles.filterTabs} accessibilityRole="tablist">
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterTab, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
              }, activeFilter === filter.key && {
                backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
              }]}
              onPress={() => setActiveFilter(filter.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === filter.key }}
              accessibilityLabel={filter.label}
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={activeFilter === filter.key ? colors.brand[400] : colors.textMuted}
              />
              <Text
                style={[
                  styles.filterTabText,
                  { color: colors.textMuted },
                  activeFilter === filter.key && { color: colors.brand[400], fontWeight: '500' },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Advanced Filters Panel - hide in newChat mode */}
      {showFilters && !isNewChatMode && (
        <View style={[styles.filtersPanel, {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
        }]}>
          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Sıralama</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortOptions}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sortOption, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
                    }, sortBy === option.key && {
                      backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
                    }]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: colors.textMuted },
                        sortBy === option.key && { color: colors.brand[400], fontWeight: '500' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Minimum Puan</Text>
            <View style={styles.ratingOptions}>
              {[0, 3, 4, 4.5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingOption, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
                  }, minRating === rating && {
                    backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
                  }]}
                  onPress={() => setMinRating(rating)}
                >
                  {rating > 0 && <Ionicons name="star" size={14} color="#fbbf24" />}
                  <Text
                    style={[
                      styles.ratingOptionText,
                      { color: colors.textMuted },
                      minRating === rating && { color: colors.brand[400], fontWeight: '500' },
                    ]}
                  >
                    {rating === 0 ? 'Tümü' : `${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Kategoriler</Text>
            <View style={styles.categoriesGrid}>
              {(categories || []).slice(0, 6).map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
                    },
                    selectedCategories.includes(category.id) && {
                      backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
                    },
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: colors.textMuted },
                      selectedCategories.includes(category.id) && { color: colors.brand[400], fontWeight: '500' },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Clear Filters */}
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Ionicons name="refresh" size={16} color={colors.brand[400]} />
            <Text style={[styles.clearFiltersText, { color: colors.brand[400] }]}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {isNewChatMode ? `${results.length} firma` : `${results.length} sonuç bulundu`}
        </Text>
        {!isNewChatMode && selectedCategories.length > 0 && (
          <View style={[styles.activeFiltersCount, {
            backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.1)'
          }]}>
            <Text style={[styles.activeFiltersText, { color: colors.brand[400] }]}>
              {selectedCategories.length} filtre aktif
            </Text>
          </View>
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        renderItem={isNewChatMode ? renderChatItem : renderResultItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Sonuç bulunamadı</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              Farklı anahtar kelimeler veya filtreler deneyin
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  filterTabText: {
    fontSize: 11,
  },
  filterTabTextActive: {
    fontWeight: '500',
  },
  filtersPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  sortOptionText: {
    fontSize: 13,
  },
  sortOptionTextActive: {
    fontWeight: '500',
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  ratingOptionActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  ratingOptionText: {
    fontSize: 13,
  },
  ratingOptionTextActive: {
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
  },
  categoryChipText: {
    fontSize: 13,
  },
  categoryChipTextActive: {
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginHorizontal: 16,
  },
  clearFiltersText: {
    fontSize: 13,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  activeFiltersCount: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFiltersText: {
    fontSize: 12,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  resultCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  // Chat item styles for newChat mode
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  chatItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  chatItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  chatItemCategory: {
    fontSize: 13,
    marginTop: 2,
  },
  chatItemAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

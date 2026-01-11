import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { artists, providers, categories } from '../data/mockData';

type FilterType = 'all' | 'artists' | 'providers' | 'venues';
type SortType = 'relevance' | 'rating' | 'price_low' | 'price_high';

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);

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

  const renderResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => {
        if (item.type === 'artist') {
          navigation.navigate('ArtistDetail', { artistId: item.id });
        } else {
          navigation.navigate('ProviderDetail', { providerId: item.id });
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <View style={styles.resultHeader}>
          <View style={styles.resultNameRow}>
            <Text style={styles.resultName}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.brand[400]} />
            )}
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {item.type === 'artist' ? 'Sanatçı' : 'Hizmet'}
            </Text>
          </View>
        </View>

        <Text style={styles.resultCategory}>
          {item.genre || item.subcategory || item.category}
        </Text>

        <View style={styles.resultMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>

          {item.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={colors.zinc[500]} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.resultFooter}>
          <Text style={styles.priceText}>{item.price}</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.zinc[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sanatçı, hizmet veya mekan ara..."
            placeholderTextColor={colors.zinc[600]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.zinc[500]} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? colors.brand[400] : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={activeFilter === filter.key ? colors.brand[400] : colors.zinc[500]}
            />
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.filterTabTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sıralama</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sortOptions}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sortOption, sortBy === option.key && styles.sortOptionActive]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option.key && styles.sortOptionTextActive,
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
            <Text style={styles.filterSectionTitle}>Minimum Puan</Text>
            <View style={styles.ratingOptions}>
              {[0, 3, 4, 4.5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingOption, minRating === rating && styles.ratingOptionActive]}
                  onPress={() => setMinRating(rating)}
                >
                  {rating > 0 && <Ionicons name="star" size={14} color="#fbbf24" />}
                  <Text
                    style={[
                      styles.ratingOptionText,
                      minRating === rating && styles.ratingOptionTextActive,
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
            <Text style={styles.filterSectionTitle}>Kategoriler</Text>
            <View style={styles.categoriesGrid}>
              {(categories || []).slice(0, 6).map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category.id) && styles.categoryChipActive,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategories.includes(category.id) && styles.categoryChipTextActive,
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
            <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} sonuç bulundu</Text>
        {selectedCategories.length > 0 && (
          <View style={styles.activeFiltersCount}>
            <Text style={styles.activeFiltersText}>
              {selectedCategories.length} filtre aktif
            </Text>
          </View>
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={item => `${item.type}-${item.id}`}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.zinc[600]} />
            <Text style={styles.emptyStateTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyStateText}>
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
    backgroundColor: colors.background,
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
    color: colors.text,
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
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
    color: colors.zinc[400],
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  sortOptionText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  sortOptionTextActive: {
    color: colors.brand[400],
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  ratingOptionText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  ratingOptionTextActive: {
    color: colors.brand[400],
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.zinc[500],
  },
  categoryChipTextActive: {
    color: colors.brand[400],
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
    color: colors.brand[400],
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
    color: colors.zinc[400],
  },
  activeFiltersCount: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeFiltersText: {
    fontSize: 12,
    color: colors.brand[400],
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
    color: colors.text,
  },
  typeBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    color: colors.brand[400],
    fontWeight: '500',
  },
  resultCategory: {
    fontSize: 13,
    color: colors.zinc[500],
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
    color: colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.zinc[500],
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
    color: colors.brand[400],
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
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

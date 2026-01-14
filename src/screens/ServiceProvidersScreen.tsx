import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import {
  Filters,
  Provider,
  FilterTab,
  cities,
  ratingOptions,
  budgetRanges,
  categoryConfig,
  getProvidersByCategory,
} from '../data/serviceProvidersData';

const colors = defaultColors;

export function ServiceProvidersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors, isDark, helpers } = useTheme();
  const { category } = (route.params as { category: string }) || { category: 'booking' };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    city: null,
    minRating: null,
    budgetRange: null,
  });

  const config = categoryConfig[category] || categoryConfig.booking;
  const allProviders = getProvidersByCategory(category);

  const activeFilterCount = [filters.city, filters.minRating, filters.budgetRange].filter(Boolean).length;

  const filteredProviders = useMemo(() => {
    let filtered = allProviders;

    if (activeTab === 'worked') {
      filtered = filtered.filter(p => p.previouslyWorked);
    }

    if (filters.city) {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    if (filters.minRating) {
      filtered = filtered.filter(p => p.rating >= filters.minRating!);
    }

    if (searchQuery) {
      filtered = filtered.filter(provider => {
        const matchesSearch = provider.name.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')) ||
          provider.description.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'));
        return matchesSearch;
      });
    }

    return filtered;
  }, [allProviders, searchQuery, activeTab, filters]);

  const workedCount = allProviders.filter(p => p.previouslyWorked).length;

  const clearFilters = () => {
    setFilters({ city: null, minRating: null, budgetRange: null });
  };

  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleProviderDetail = (provider: Provider) => {
    navigation.navigate('ProviderDetail', { providerId: provider.id });
  };

  const handleRequestOffer = (provider: Provider) => {
    navigation.navigate('CategoryRequest', {
      category: category,
      provider: {
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        image: provider.image,
      }
    });
  };

  const handleBulkOfferRequest = () => {
    navigation.navigate('CategoryRequest', {
      category: category,
      bulkProviders: selectedProviders.map(id => {
        const p = allProviders.find((pr: Provider) => pr.id === id);
        return p ? { id: p.id, name: p.name, rating: p.rating, image: p.image } : null;
      }).filter(Boolean)
    });
    setSelectionMode(false);
    setSelectedProviders([]);
  };

  const handleCall = (provider: Provider) => {
    Alert.alert(
      'Ara',
      `${provider.name} ile iletişime geçmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ara',
          onPress: () => Linking.openURL(`tel:${provider.phone}`),
        },
      ]
    );
  };

  const handleMessage = (provider: Provider) => {
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <LinearGradient
            colors={config.gradient}
            style={styles.headerIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={config.icon as any} size={16} color="white" />
          </LinearGradient>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{config.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa' },
              activeFilterCount > 0 && styles.filterButtonActive,
              ...(isDark ? [] : [helpers.getShadow('sm')])
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? colors.brand[400] : colors.zinc[400]} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectionButton,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8f9fa' },
              selectionMode && styles.selectionButtonActive,
              ...(isDark ? [] : [helpers.getShadow('sm')])
            ]}
            onPress={() => setSelectionMode(!selectionMode)}
          >
            <Ionicons name={selectionMode ? 'close' : 'checkbox-outline'} size={20} color={selectionMode ? colors.brand[400] : colors.zinc[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          },
          ...(isDark ? [] : [helpers.getShadow('sm')])
        ]}>
          <Ionicons name="search" size={18} color={colors.zinc[500]} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Hizmet sağlayıcı ara..."
            placeholderTextColor={colors.zinc[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.zinc[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.brand[400] : colors.textMuted }]}>
            Tümü
          </Text>
          {activeTab === 'all' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
        </TouchableOpacity>
        {workedCount > 0 && (
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('worked')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'worked' ? colors.brand[400] : colors.textMuted }]}>
              Çalıştıklarım ({workedCount})
            </Text>
            {activeTab === 'worked' && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={[styles.resultsCountText, { color: colors.textMuted }]}>
          {filteredProviders.length} sağlayıcı bulundu
        </Text>
        {selectionMode && selectedProviders.length > 0 && (
          <Text style={[styles.selectedCountText, { color: colors.brand[400] }]}>
            {selectedProviders.length} seçildi
          </Text>
        )}
      </View>

      {/* Provider List */}
      <ScrollView style={styles.providerList} showsVerticalScrollIndicator={false}>
        {filteredProviders.map(provider => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
              },
              !isDark && helpers.getShadow('sm'),
              selectionMode && selectedProviders.includes(provider.id) && styles.providerCardSelected
            ]}
            activeOpacity={0.8}
            onPress={() => selectionMode ? toggleProviderSelection(provider.id) : handleProviderDetail(provider)}
          >
            {selectionMode && (
              <View style={[styles.checkboxContainer, { borderRightColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={[styles.checkbox, { borderColor: colors.textSecondary }, selectedProviders.includes(provider.id) && styles.checkboxChecked]}>
                  {selectedProviders.includes(provider.id) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </View>
            )}

            <View style={styles.providerContent}>
              <View style={styles.providerTop}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: provider.image }} style={styles.providerImage} />
                  {provider.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                  )}
                </View>
                <View style={styles.providerInfo}>
                  <View style={styles.providerHeader}>
                    <View style={styles.nameContainer}>
                      <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>{provider.name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                      <Text style={styles.ratingText}>{provider.rating}</Text>
                      <Text style={[styles.reviewCountText, { color: colors.textMuted }]}>({provider.reviewCount})</Text>
                    </View>
                  </View>
                  <Text style={[styles.providerDescription, { color: colors.textMuted }]} numberOfLines={2}>
                    {provider.description}
                  </Text>
                  <View style={styles.providerMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={12} color={colors.zinc[500]} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>{provider.city}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={12} color={colors.success} />
                      <Text style={[styles.metaText, { color: colors.success }]}>{provider.responseTime}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.specialtiesRow}>
                {provider.specialties.slice(0, 3).map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={[styles.specialtyText, { color: colors.brand[400] }]}>{specialty}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.statsRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{provider.yearsExperience} yıl</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Deneyim</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{provider.completedEvents}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Etkinlik</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text, fontSize: 11 }]}>{provider.priceRange}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Fiyat</Text>
                </View>
              </View>

              <View style={[styles.providerBottom, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border }]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => handleRequestOffer(provider)}
                  >
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.offerButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.offerButtonText}>Teklif Al</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconButton, { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground }]}
                    onPress={() => handleCall(provider)}
                  >
                    <Ionicons name="call" size={16} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconButton, { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground }]}
                    onPress={() => handleMessage(provider)}
                  >
                    <Ionicons name="chatbubble" size={16} color={colors.brand[400]} />
                  </TouchableOpacity>
                </View>
                {provider.previouslyWorked && (
                  <View style={styles.workedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.workedBadgeText, { color: colors.success }]}>Daha önce çalıştık</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: selectionMode && selectedProviders.length > 0 ? 100 : 24 }} />
      </ScrollView>

      {/* Bulk Offer Button */}
      {selectionMode && selectedProviders.length > 0 && (
        <View style={styles.bulkOfferContainer}>
          <TouchableOpacity style={styles.bulkOfferButton} onPress={handleBulkOfferRequest}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.bulkOfferGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.bulkOfferText}>
                {selectedProviders.length} Sağlayıcıya Teklif Gönder
              </Text>
              <Ionicons name="paper-plane" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtreler</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Şehir</Text>
                <View style={styles.filterOptions}>
                  {cities.map(city => (
                    <TouchableOpacity
                      key={city}
                      style={[styles.filterChip, filters.city === city && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, city: f.city === city ? null : city }))}
                    >
                      <Text style={[styles.filterChipText, { color: filters.city === city ? colors.brand[400] : colors.textMuted }]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Minimum Puan</Text>
                <View style={styles.filterOptions}>
                  {ratingOptions.map(rating => (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.filterChip, filters.minRating === rating && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, minRating: f.minRating === rating ? null : rating }))}
                    >
                      <Ionicons name="star" size={12} color={filters.minRating === rating ? colors.brand[400] : '#fbbf24'} />
                      <Text style={[styles.filterChipText, { color: filters.minRating === rating ? colors.brand[400] : colors.textMuted }]}>
                        {rating}+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Bütçe Aralığı</Text>
                <View style={styles.filterOptions}>
                  {budgetRanges.map(range => (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.filterChip, filters.budgetRange === range.id && styles.filterChipActive]}
                      onPress={() => setFilters(f => ({ ...f, budgetRange: f.budgetRange === range.id ? null : range.id }))}
                    >
                      <Text style={[styles.filterChipText, { color: filters.budgetRange === range.id ? colors.brand[400] : colors.textMuted }]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={[styles.clearButtonText, { color: colors.textMuted }]}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
                <LinearGradient
                  colors={gradients.primary}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)', position: 'relative' },
  filterButtonActive: { backgroundColor: 'rgba(147, 51, 234, 0.1)' },
  filterBadge: { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.brand[500], alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 9, fontWeight: '600', color: 'white' },
  selectionButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  selectionButtonActive: { backgroundColor: 'rgba(147, 51, 234, 0.1)' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)' },
  searchInput: { flex: 1, fontSize: 14 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, borderBottomWidth: 1, gap: 8 },
  tab: { paddingVertical: 12, paddingHorizontal: 12, position: 'relative' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 12, right: 12, height: 2, borderRadius: 1 },
  resultsCount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  resultsCountText: { fontSize: 13 },
  selectedCountText: { fontSize: 13, fontWeight: '500' },
  providerList: { flex: 1, paddingHorizontal: 16 },
  providerCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  providerCardSelected: { borderColor: colors.brand[400], backgroundColor: 'rgba(147, 51, 234, 0.05)' },
  checkboxContainer: { width: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.04)' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.brand[500], borderColor: colors.brand[500] },
  providerContent: { flex: 1, padding: 14 },
  providerTop: { flexDirection: 'row', gap: 12 },
  imageContainer: { position: 'relative' },
  providerImage: { width: 72, height: 72, borderRadius: 12 },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.brand[500], alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background },
  nameContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  providerInfo: { flex: 1 },
  providerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  providerName: { flex: 1, fontSize: 15, fontWeight: '600', marginRight: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#fbbf24' },
  reviewCountText: { fontSize: 10, marginLeft: 2 },
  providerDescription: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  providerMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  specialtyTag: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: 6 },
  specialtyText: { fontSize: 10, fontWeight: '500' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.04)' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 12, fontWeight: '600' },
  statLabel: { fontSize: 9, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  providerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.04)' },
  workedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  workedBadgeText: { fontSize: 11, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  offerButton: { borderRadius: 10, overflow: 'hidden' },
  offerButtonGradient: { paddingHorizontal: 16, paddingVertical: 10 },
  offerButtonText: { fontSize: 13, fontWeight: '600', color: 'white' },
  iconButton: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.03)', alignItems: 'center', justifyContent: 'center' },
  bulkOfferContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: 'rgba(9, 9, 11, 0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)' },
  bulkOfferButton: { borderRadius: 14, overflow: 'hidden' },
  bulkOfferGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  bulkOfferText: { fontSize: 15, fontWeight: '600', color: 'white' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 40, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  filterSection: { paddingHorizontal: 20, marginBottom: 24 },
  filterLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  filterChipActive: { backgroundColor: 'rgba(147, 51, 234, 0.15)', borderColor: colors.brand[400] },
  filterChipText: { fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)' },
  clearButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center' },
  clearButtonText: { fontSize: 14, fontWeight: '500' },
  applyButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  applyButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  applyButtonText: { fontSize: 14, fontWeight: '600', color: 'white' },
});

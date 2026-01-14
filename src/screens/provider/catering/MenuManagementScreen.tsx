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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  MenuItem,
  MenuCategory,
  MenuPackage,
  mockMenuItems,
  mockMenuPackages,
  getMenuStats,
  menuCategories,
} from '../../../data/provider/menuData';

type TabType = 'items' | 'packages';

const categoryIcons: Record<MenuCategory, string> = {
  appetizer: 'restaurant-outline',
  main: 'fast-food',
  dessert: 'ice-cream',
  beverage: 'wine',
  snack: 'cafe',
  special: 'star',
};

const categoryColors: Record<MenuCategory, [string, string]> = {
  appetizer: ['#F59E0B', '#FBBF24'],
  main: ['#EF4444', '#F87171'],
  dessert: ['#EC4899', '#F472B6'],
  beverage: ['#3B82F6', '#60A5FA'],
  snack: ['#10B981', '#34D399'],
  special: ['#9333EA', '#C084FC'],
};

const dietaryColors: Record<string, { icon: string; color: string }> = {
  vegan: { icon: 'leaf', color: '#10B981' },
  vegetarian: { icon: 'nutrition', color: '#22C55E' },
  gluten_free: { icon: 'ban', color: '#F59E0B' },
  halal: { icon: 'checkmark-circle', color: '#3B82F6' },
  kosher: { icon: 'star', color: '#8B5CF6' },
  dairy_free: { icon: 'water', color: '#06B6D4' },
  nut_free: { icon: 'alert-circle', color: '#EF4444' },
};

export function MenuManagementScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => getMenuStats(), []);

  const filteredItems = useMemo(() => {
    let filtered = mockMenuItems;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  const categories: { key: MenuCategory | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'Tumu', count: mockMenuItems.length },
    ...stats.categoryCounts.map((cat) => ({
      key: cat.category,
      label: cat.label,
      count: cat.count,
    })),
  ];

  const getCategoryLabel = (category: MenuCategory): string => {
    const found = menuCategories.find(c => c.key === category);
    return found ? found.label : category;
  };

  const veganCount = mockMenuItems.filter(i => i.dietaryOptions.includes('vegan')).length;
  const glutenFreeCount = mockMenuItems.filter(i => i.dietaryOptions.includes('gluten_free')).length;

  const renderMenuItem = (item: MenuItem) => {
    const categoryGradient = categoryColors[item.category] || (['#6366F1', '#818CF8'] as [string, string]);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Menu Detayi', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.menuCardHeader}>
          <View style={styles.menuImageContainer}>
            <Image source={{ uri: item.image }} style={styles.menuImage} />
            {!item.isAvailable && (
              <View style={styles.unavailableOverlay}>
                <Text style={styles.unavailableText}>Mevcut Degil</Text>
              </View>
            )}
          </View>

          <View style={styles.menuInfo}>
            <View style={styles.menuTitleRow}>
              <Text style={[styles.menuName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="flame" size={12} color="#EF4444" />
                </View>
              )}
            </View>

            <Text style={[styles.menuDescription, { color: colors.textMuted }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.menuMeta}>
              <LinearGradient
                colors={categoryGradient}
                style={styles.categoryBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={categoryIcons[item.category] as any} size={10} color="white" />
                <Text style={styles.categoryBadgeText}>{getCategoryLabel(item.category)}</Text>
              </LinearGradient>

              {item.dietaryOptions.length > 0 && (
                <View style={styles.dietaryTags}>
                  {item.dietaryOptions.slice(0, 3).map((opt, i) => {
                    const dietary = dietaryColors[opt];
                    if (!dietary) return null;
                    return (
                      <View
                        key={i}
                        style={[styles.dietaryTag, { backgroundColor: `${dietary.color}15` }]}
                      >
                        <Ionicons name={dietary.icon as any} size={10} color={dietary.color} />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <View style={styles.menuPriceContainer}>
            <Text style={[styles.menuPrice, { color: colors.brand[400] }]}>
              {item.price.toLocaleString('tr-TR')} TL
            </Text>
            <Text style={[styles.menuUnit, { color: colors.textMuted }]}>
              /kisi
            </Text>
          </View>
        </View>

        {item.allergens && item.allergens.length > 0 && (
          <View style={[styles.allergensRow, { borderTopColor: colors.border }]}>
            <Ionicons name="warning-outline" size={12} color="#F59E0B" />
            <Text style={[styles.allergensText, { color: colors.textMuted }]}>
              Alerjen: {item.allergens.join(', ')}
            </Text>
          </View>
        )}

        {item.preparationTime && (
          <View style={[styles.prepTimeRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.prepTimeText, { color: colors.textMuted }]}>
              Hazirlama: {item.preparationTime} dk
            </Text>
            {item.minOrder > 1 && (
              <>
                <View style={[styles.prepTimeDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.prepTimeText, { color: colors.textMuted }]}>
                  Min: {item.minOrder} kisi
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPackageCard = (pkg: MenuPackage) => {
    const totalItems = pkg.items.reduce((acc, cat) => acc + cat.count, 0);

    return (
      <TouchableOpacity
        key={pkg.id}
        style={[
          styles.packageCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Menu Detayi', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.packageImageContainer}>
          <Image source={{ uri: pkg.image }} style={styles.packageImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)'] as [string, string]}
            style={styles.packageImageGradient}
          />
          {pkg.isPopular && (
            <View style={styles.packageBadges}>
              <View style={styles.popularPackageBadge}>
                <Ionicons name="flame" size={12} color="white" />
                <Text style={styles.popularPackageText}>Populer</Text>
              </View>
            </View>
          )}
          <View style={styles.packageImageContent}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            <Text style={styles.packagePersonCount}>
              {pkg.minGuests}-{pkg.maxGuests} kisi icin
            </Text>
          </View>
        </View>

        <View style={styles.packageContent}>
          <Text style={[styles.packageDescription, { color: colors.textMuted }]} numberOfLines={2}>
            {pkg.description}
          </Text>

          <View style={styles.packageItemsRow}>
            <Text style={[styles.packageItemsLabel, { color: colors.textMuted }]}>
              {totalItems} urun kategorisi
            </Text>
            <View style={styles.packageItemsList}>
              {pkg.items.slice(0, 4).map((item, i) => (
                <View key={i} style={[styles.packageItemDot, { backgroundColor: colors.brand[400] }]} />
              ))}
              {pkg.items.length > 4 && (
                <Text style={[styles.packageItemsMore, { color: colors.textMuted }]}>+{pkg.items.length - 4}</Text>
              )}
            </View>
          </View>

          <View style={styles.includesRow}>
            <Text style={[styles.includesLabel, { color: colors.textMuted }]}>Dahil:</Text>
            <Text style={[styles.includesText, { color: colors.text }]} numberOfLines={1}>
              {pkg.includes.slice(0, 2).join(', ')}
              {pkg.includes.length > 2 ? ` +${pkg.includes.length - 2}` : ''}
            </Text>
          </View>

          <View style={[styles.packagePriceRow, { backgroundColor: isDark ? 'rgba(147,51,234,0.1)' : 'rgba(147,51,234,0.05)' }]}>
            <Text style={[styles.packagePrice, { color: colors.brand[400] }]}>
              {pkg.pricePerPerson.toLocaleString('tr-TR')} TL
            </Text>
            <Text style={[styles.packageUnit, { color: colors.textMuted }]}>/ kisi</Text>
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Yonetimi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {stats.totalItems} urun, {stats.totalPackages} paket
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
          onPress={() => Alert.alert('Menu Detayi', 'Bu ozellik yakinda aktif olacak.')}
        >
          <Ionicons name="add" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={[styles.statBoxValue, { color: '#10B981' }]}>{stats.availableItems}</Text>
          <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Aktif</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)' }]}>
          <Ionicons name="flame" size={18} color="#EF4444" />
          <Text style={[styles.statBoxValue, { color: '#EF4444' }]}>{stats.popularItems}</Text>
          <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Populer</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)' }]}>
          <Ionicons name="leaf" size={18} color="#22C55E" />
          <Text style={[styles.statBoxValue, { color: '#22C55E' }]}>{veganCount}</Text>
          <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Vegan</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
          <Ionicons name="ban" size={18} color="#F59E0B" />
          <Text style={[styles.statBoxValue, { color: '#F59E0B' }]}>{glutenFreeCount}</Text>
          <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>Glutensiz</Text>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={[styles.mainTabs, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity
          style={styles.mainTab}
          onPress={() => setActiveTab('items')}
        >
          <View style={styles.mainTabContent}>
            <Ionicons
              name="restaurant"
              size={16}
              color={activeTab === 'items' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.mainTabText,
                { color: activeTab === 'items' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Menu Kalemleri
            </Text>
          </View>
          {activeTab === 'items' && (
            <View style={[styles.mainTabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainTab}
          onPress={() => setActiveTab('packages')}
        >
          <View style={styles.mainTabContent}>
            <Ionicons
              name="gift"
              size={16}
              color={activeTab === 'packages' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.mainTabText,
                { color: activeTab === 'packages' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Paket Menuler
            </Text>
          </View>
          {activeTab === 'packages' && (
            <View style={[styles.mainTabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'items' && (
        <>
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
                placeholder="Menu ara..."
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

          {/* Category Tabs */}
          <View style={styles.categoryTabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: activeCategory === cat.key
                        ? isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)'
                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: activeCategory === cat.key
                        ? colors.brand[400]
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setActiveCategory(cat.key)}
                >
                  {cat.key !== 'all' && (
                    <Ionicons
                      name={categoryIcons[cat.key as MenuCategory] as any}
                      size={14}
                      color={activeCategory === cat.key ? colors.brand[400] : colors.textMuted}
                    />
                  )}
                  <Text
                    style={[
                      styles.categoryTabText,
                      { color: activeCategory === cat.key ? colors.brand[400] : colors.textMuted },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryTabCount,
                      { color: activeCategory === cat.key ? colors.brand[400] : colors.textMuted },
                    ]}
                  >
                    ({cat.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Content */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        {activeTab === 'items' ? (
          filteredItems.length > 0 ? (
            filteredItems.map(renderMenuItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Urun bulunamadi</Text>
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                Arama kriterlerinize uygun urun yok
              </Text>
            </View>
          )
        ) : (
          mockMenuPackages.length > 0 ? (
            mockMenuPackages.map(renderPackageCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Paket bulunamadi</Text>
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                Henuz paket menu eklenmemis
              </Text>
            </View>
          )
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 2,
  },
  statBoxValue: { fontSize: 16, fontWeight: '700' },
  statBoxLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3 },
  mainTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    position: 'relative',
  },
  mainTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainTabText: { fontSize: 14, fontWeight: '500' },
  mainTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
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
  categoryTabsContainer: { marginBottom: 12 },
  categoryTabs: { paddingHorizontal: 20, gap: 8 },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  categoryTabText: { fontSize: 12, fontWeight: '500' },
  categoryTabCount: { fontSize: 11 },
  contentList: { flex: 1 },
  contentListContainer: { paddingHorizontal: 20, gap: 12 },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuCardHeader: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  menuImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  menuImage: { width: '100%', height: '100%' },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: { color: 'white', fontSize: 10, fontWeight: '600' },
  menuInfo: { flex: 1 },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuName: { fontSize: 15, fontWeight: '600', flex: 1 },
  popularBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDescription: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  menuMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryBadgeText: { fontSize: 9, fontWeight: '600', color: 'white' },
  dietaryTags: { flexDirection: 'row', gap: 4 },
  dietaryTag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPriceContainer: { alignItems: 'flex-end' },
  menuPrice: { fontSize: 16, fontWeight: '700' },
  menuUnit: { fontSize: 11, marginTop: 2 },
  allergensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  allergensText: { fontSize: 11 },
  prepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  prepTimeText: { fontSize: 11 },
  prepTimeDivider: { width: 1, height: 12 },
  packageCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  packageImageContainer: {
    height: 140,
    position: 'relative',
  },
  packageImage: { width: '100%', height: '100%' },
  packageImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  packageBadges: { position: 'absolute', top: 12, right: 12 },
  popularPackageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  popularPackageText: { color: 'white', fontSize: 11, fontWeight: '600' },
  packageImageContent: { position: 'absolute', bottom: 12, left: 12 },
  packageName: { fontSize: 18, fontWeight: '700', color: 'white' },
  packagePersonCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  packageContent: { padding: 14 },
  packageDescription: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  packageItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageItemsLabel: { fontSize: 12 },
  packageItemsList: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  packageItemDot: { width: 6, height: 6, borderRadius: 3 },
  packageItemsMore: { fontSize: 11, marginLeft: 4 },
  includesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  includesLabel: { fontSize: 11 },
  includesText: { fontSize: 11, flex: 1 },
  packagePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  packagePrice: { fontSize: 20, fontWeight: '700' },
  packageUnit: { fontSize: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },
});

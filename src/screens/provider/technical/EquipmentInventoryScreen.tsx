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
  Equipment,
  EquipmentCategory,
  mockEquipment,
  getEquipmentStats,
  equipmentCategories,
} from '../../../data/provider/equipmentData';

type TabType = 'all' | EquipmentCategory;

const categoryIcons: Record<EquipmentCategory, string> = {
  sound: 'volume-high',
  lighting: 'bulb',
  stage: 'cube',
  video: 'videocam',
  power: 'flash',
  rigging: 'git-network',
  accessories: 'hardware-chip',
};

const categoryColors: Record<EquipmentCategory, [string, string]> = {
  sound: ['#9333EA', '#C084FC'],
  lighting: ['#F59E0B', '#FBBF24'],
  stage: ['#10B981', '#34D399'],
  video: ['#3B82F6', '#60A5FA'],
  power: ['#EF4444', '#F87171'],
  rigging: ['#6366F1', '#818CF8'],
  accessories: ['#EC4899', '#F472B6'],
};

export function EquipmentInventoryScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => getEquipmentStats(), []);

  const filteredEquipment = useMemo(() => {
    let filtered = mockEquipment;

    if (activeTab !== 'all') {
      filtered = filtered.filter(e => e.category === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.brand.toLowerCase().includes(query) ||
        e.model.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  const getStatusInfo = (status: Equipment['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Musait', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'rented':
        return { label: 'Kirada', color: '#3B82F6', icon: 'swap-horizontal' as const };
      case 'maintenance':
        return { label: 'Bakimda', color: '#F59E0B', icon: 'construct' as const };
      case 'reserved':
        return { label: 'Rezerve', color: '#9333EA', icon: 'time' as const };
      case 'damaged':
        return { label: 'Hasarli', color: '#EF4444', icon: 'warning' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const getConditionInfo = (condition: Equipment['condition']) => {
    switch (condition) {
      case 'excellent':
        return { label: 'Mukemmel', color: '#10B981' };
      case 'good':
        return { label: 'Iyi', color: '#3B82F6' };
      case 'fair':
        return { label: 'Orta', color: '#F59E0B' };
      case 'poor':
        return { label: 'Kotu', color: '#EF4444' };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted };
    }
  };

  const getCategoryLabel = (category: EquipmentCategory): string => {
    const found = equipmentCategories.find(c => c.key === category);
    return found ? found.label : category;
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tumu', count: stats.totalItems },
    ...stats.categoryCounts.map((cat) => ({
      key: cat.category as TabType,
      label: cat.label,
      count: cat.count,
    })).filter(t => t.count > 0).slice(0, 5),
  ];

  const renderEquipmentCard = (equipment: Equipment) => {
    const statusInfo = getStatusInfo(equipment.status);
    const conditionInfo = getConditionInfo(equipment.condition);
    const categoryGradient = categoryColors[equipment.category];

    return (
      <TouchableOpacity
        key={equipment.id}
        style={[
          styles.equipmentCard,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Ekipman Detayi', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: equipment.image }} style={styles.cardImage} />
            <LinearGradient
              colors={categoryGradient}
              style={styles.categoryIconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={categoryIcons[equipment.category] as any} size={14} color="white" />
            </LinearGradient>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.equipmentName, { color: colors.text }]} numberOfLines={1}>
              {equipment.name}
            </Text>
            <Text style={[styles.equipmentBrand, { color: colors.textMuted }]}>
              {equipment.brand} {equipment.model}
            </Text>
            <View style={styles.serialRow}>
              <Ionicons name="barcode-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.serialText, { color: colors.textMuted }]}>{equipment.serialNumber}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Durum</Text>
              <View style={styles.conditionContainer}>
                <View style={[styles.conditionDot, { backgroundColor: conditionInfo.color }]} />
                <Text style={[styles.infoValue, { color: colors.text }]}>{conditionInfo.label}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Stok</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {equipment.availableQuantity}/{equipment.quantity}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Gunluk Ucret</Text>
              <Text style={[styles.infoValue, { color: colors.brand[400] }]}>
                {equipment.rentalPrice.toLocaleString('tr-TR')} TL
              </Text>
            </View>
          </View>

          {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
            <View style={[styles.specsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
              <View style={styles.specsHeader}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.specsTitle, { color: colors.textMuted }]}>Ozellikler</Text>
              </View>
              <View style={styles.specsTags}>
                {Object.entries(equipment.specifications).slice(0, 3).map(([key, value], i) => (
                  <View key={i} style={[styles.specTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text style={[styles.specTagText, { color: colors.textMuted }]} numberOfLines={1}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {equipment.nextMaintenance && (
            <View style={styles.maintenanceRow}>
              <Ionicons name="construct-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.maintenanceText, { color: colors.textMuted }]}>
                Sonraki bakim: {equipment.nextMaintenance}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate status-based stats
  const availableEquipment = mockEquipment.filter(e => e.status === 'available').length;
  const rentedEquipment = mockEquipment.filter(e => e.status === 'rented').length;
  const maintenanceEquipment = mockEquipment.filter(e => e.status === 'maintenance').length;
  const reservedEquipment = mockEquipment.filter(e => e.status === 'reserved').length;

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Ekipman Envanteri</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {stats.totalItems} ekipman, {(stats.totalValue / 1000000).toFixed(1)}M TL deger
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              },
            ]}
            onPress={() => Alert.alert('Ekipman Detayi', 'Bu ozellik yakinda aktif olacak.')}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)',
                borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)',
              },
            ]}
            onPress={() => Alert.alert('Ekipman Detayi', 'Bu ozellik yakinda aktif olacak.')}
          >
            <Ionicons name="add" size={22} color={colors.brand[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={[styles.statCardValue, { color: '#10B981' }]}>{availableEquipment}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Musait</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}>
          <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
          <Text style={[styles.statCardValue, { color: '#3B82F6' }]}>{rentedEquipment}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Kirada</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
          <Ionicons name="construct" size={20} color="#F59E0B" />
          <Text style={[styles.statCardValue, { color: '#F59E0B' }]}>{maintenanceEquipment}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Bakimda</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)' }]}>
          <Ionicons name="time" size={20} color="#9333EA" />
          <Text style={[styles.statCardValue, { color: '#9333EA' }]}>{reservedEquipment}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Rezerve</Text>
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
            placeholder="Ekipman ara..."
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
                {tab.key !== 'all' && (
                  <Ionicons
                    name={categoryIcons[tab.key as EquipmentCategory] as any}
                    size={14}
                    color={activeTab === tab.key ? colors.brand[400] : colors.textMuted}
                  />
                )}
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

      {/* Equipment List */}
      <ScrollView
        style={styles.equipmentList}
        contentContainerStyle={styles.equipmentListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map(renderEquipmentCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Ekipman bulunamadi</Text>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              Arama kriterlerinize uygun ekipman yok
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
  headerActions: { flexDirection: 'row', gap: 10 },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  statCardValue: { fontSize: 18, fontWeight: '700' },
  statCardLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3 },
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
  tabScroll: { paddingHorizontal: 20, gap: 4 },
  tab: { paddingVertical: 12, paddingHorizontal: 8, position: 'relative' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 11, fontWeight: '600' },
  tabIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, borderRadius: 1 },
  equipmentList: { flex: 1 },
  equipmentListContent: { paddingHorizontal: 20, gap: 12 },
  equipmentCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  cardImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  categoryIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  equipmentName: { fontSize: 15, fontWeight: '600' },
  equipmentBrand: { fontSize: 12, marginTop: 2 },
  serialRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  serialText: { fontSize: 10 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardDivider: { height: 1, marginHorizontal: 14 },
  cardBody: { padding: 14, paddingTop: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600' },
  conditionContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  conditionDot: { width: 8, height: 8, borderRadius: 4 },
  specsContainer: { padding: 10, borderRadius: 10, marginBottom: 10 },
  specsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  specsTitle: { fontSize: 11, fontWeight: '500' },
  specsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  specTagText: { fontSize: 10 },
  maintenanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  maintenanceText: { fontSize: 11 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },
});

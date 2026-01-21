import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScrollHeader, LargeTitle } from '../../components/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminEvents } from '../../hooks/useAdminEvents';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { EventModerationCard } from '../../components/admin/EventModerationCard';
import { ActionModal } from '../../components/admin/ActionModal';
import type { AdminEvent, EventFilters } from '../../types/admin';

type FilterTab = 'all' | 'pending' | 'flagged' | 'approved' | 'rejected';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'pending', label: 'Onay Bekleyen' },
  { id: 'flagged', label: 'İşaretli' },
  { id: 'approved', label: 'Onaylı' },
  { id: 'rejected', label: 'Reddedildi' },
];

export function AdminEventsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    filteredEvents,
    filters,
    setFilters,
    isRefreshing,
    isProcessing,
    refresh,
    approveEvent,
    rejectEvent,
    flagEvent,
    stats,
  } = useAdminEvents();
  const { canApproveEvents } = useAdminPermissions();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Handle tab change
  const handleTabChange = useCallback((tab: FilterTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);

    const newFilters: EventFilters = { ...filters, search: searchQuery };

    switch (tab) {
      case 'all':
        newFilters.approvalStatus = 'all';
        newFilters.isFlagged = undefined;
        break;
      case 'pending':
        newFilters.approvalStatus = 'pending';
        newFilters.isFlagged = undefined;
        break;
      case 'flagged':
        newFilters.approvalStatus = 'all';
        newFilters.isFlagged = true;
        break;
      case 'approved':
        newFilters.approvalStatus = 'approved';
        newFilters.isFlagged = undefined;
        break;
      case 'rejected':
        newFilters.approvalStatus = 'rejected';
        newFilters.isFlagged = undefined;
        break;
    }

    setFilters(newFilters);
  }, [filters, searchQuery, setFilters]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setFilters({ ...filters, search: text });
  }, [filters, setFilters]);

  // Handle event press
  const handleEventPress = useCallback((event: AdminEvent) => {
    navigation.navigate('AdminEventDetail', { eventId: event.id });
  }, [navigation]);

  // Handle approve
  const handleApprove = useCallback(async (event: AdminEvent) => {
    await approveEvent(event.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [approveEvent]);

  // Handle reject
  const handleReject = useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
  }, []);

  const confirmReject = useCallback(async (reason?: string) => {
    if (selectedEvent && reason) {
      await rejectEvent(selectedEvent.id, reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowRejectModal(false);
    setSelectedEvent(null);
  }, [selectedEvent, rejectEvent]);

  // Handle flag
  const handleFlag = useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setShowFlagModal(true);
  }, []);

  const confirmFlag = useCallback(async (reason?: string) => {
    if (selectedEvent && reason) {
      await flagEvent(selectedEvent.id, reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowFlagModal(false);
    setSelectedEvent(null);
  }, [selectedEvent, flagEvent]);

  // Get tab badge count
  const getTabBadge = (tab: FilterTab) => {
    switch (tab) {
      case 'pending':
        return stats.pending;
      case 'flagged':
        return stats.flagged;
      default:
        return undefined;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Etkinlik Moderasyonu"
        scrollY={scrollY}
        showBackButton
        rightAction={
          <TouchableOpacity
            style={[
              styles.headerAction,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
            ]}
          >
            <Ionicons name="filter" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <LargeTitle
          title="Etkinlik Moderasyonu"
          subtitle={`${stats.total} toplam etkinlik`}
          scrollY={scrollY}
        />

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Etkinlik, mekan veya organizatör ara..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsSection}>
          <FlatList
            horizontal
            data={filterTabs}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            renderItem={({ item }) => {
              const isActive = activeTab === item.id;
              const badge = getTabBadge(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    isActive && { backgroundColor: colors.brand[500] },
                    !isActive && {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground,
                    },
                  ]}
                  onPress={() => handleTabChange(item.id)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {badge !== undefined && badge > 0 && (
                    <View style={[styles.tabBadge, { backgroundColor: isActive ? '#fff' : '#ef4444' }]}>
                      <Text
                        style={[
                          styles.tabBadgeText,
                          { color: isActive ? colors.brand[500] : '#fff' },
                        ]}
                      >
                        {badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bekleyen</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.approved}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Onaylı</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.flagged}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>İşaretli</Text>
          </View>
        </View>

        {/* Event List */}
        <View style={styles.listSection}>
          {filteredEvents.map((event) => (
            <EventModerationCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
              onApprove={canApproveEvents ? () => handleApprove(event) : undefined}
              onReject={canApproveEvents ? () => handleReject(event) : undefined}
              onFlag={canApproveEvents ? () => handleFlag(event) : undefined}
            />
          ))}

          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Etkinlik bulunamadı
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                Arama kriterlerinizi değiştirmeyi deneyin
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Reject Modal */}
      <ActionModal
        visible={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedEvent(null);
        }}
        onConfirm={confirmReject}
        title="Etkinliği Reddet"
        message={`"${selectedEvent?.title}" etkinliğini reddetmek istediğinize emin misiniz?`}
        confirmLabel="Reddet"
        icon="close-circle"
        iconColor="#ef4444"
        requireReason
        reasonPlaceholder="Red sebebini yazın..."
        isDestructive
        isLoading={isProcessing}
      />

      {/* Flag Modal */}
      <ActionModal
        visible={showFlagModal}
        onClose={() => {
          setShowFlagModal(false);
          setSelectedEvent(null);
        }}
        onConfirm={confirmFlag}
        title="Etkinliği İşaretle"
        message={`"${selectedEvent?.title}" etkinliğini moderasyon için işaretlemek istediğinize emin misiniz?`}
        confirmLabel="İşaretle"
        icon="flag"
        iconColor="#f59e0b"
        requireReason
        reasonPlaceholder="İşaretleme sebebini yazın..."
        isLoading={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsSection: {
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default AdminEventsScreen;

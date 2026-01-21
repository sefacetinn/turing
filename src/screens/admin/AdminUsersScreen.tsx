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
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { UserCard } from '../../components/admin/UserCard';
import { ActionModal } from '../../components/admin/ActionModal';
import type { AdminUser, UserFilters } from '../../types/admin';

type FilterTab = 'all' | 'organizers' | 'providers' | 'pending' | 'suspended';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'organizers', label: 'Organizatörler' },
  { id: 'providers', label: 'Sağlayıcılar' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'suspended', label: 'Askıda' },
];

export function AdminUsersScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    filteredUsers,
    filters,
    setFilters,
    isRefreshing,
    isProcessing,
    refresh,
    suspendUser,
    unsuspendUser,
    verifyUser,
    stats,
  } = useAdminUsers();
  const { canEditUsers, canApproveUsers } = useAdminPermissions();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

    const newFilters: UserFilters = { ...filters, search: searchQuery };

    switch (tab) {
      case 'all':
        newFilters.role = 'all';
        newFilters.status = 'all';
        newFilters.verificationStatus = 'all';
        break;
      case 'organizers':
        newFilters.role = 'organizer';
        newFilters.status = 'all';
        newFilters.verificationStatus = 'all';
        break;
      case 'providers':
        newFilters.role = 'provider';
        newFilters.status = 'all';
        newFilters.verificationStatus = 'all';
        break;
      case 'pending':
        newFilters.role = 'all';
        newFilters.status = 'all';
        newFilters.verificationStatus = 'pending';
        break;
      case 'suspended':
        newFilters.role = 'all';
        newFilters.status = 'suspended';
        newFilters.verificationStatus = 'all';
        break;
    }

    setFilters(newFilters);
  }, [filters, searchQuery, setFilters]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setFilters({ ...filters, search: text });
  }, [filters, setFilters]);

  // Handle user press
  const handleUserPress = useCallback((user: AdminUser) => {
    navigation.navigate('AdminUserDetail', { userId: user.id });
  }, [navigation]);

  // Handle suspend
  const handleSuspend = useCallback((user: AdminUser) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  }, []);

  const confirmSuspend = useCallback(async (reason?: string) => {
    if (selectedUser && reason) {
      await suspendUser(selectedUser.id, reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowSuspendModal(false);
    setSelectedUser(null);
  }, [selectedUser, suspendUser]);

  // Handle verify
  const handleVerify = useCallback(async (user: AdminUser) => {
    await verifyUser(user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [verifyUser]);

  // Render user item
  const renderUser = useCallback(({ item }: { item: AdminUser }) => (
    <UserCard
      user={item}
      onPress={() => handleUserPress(item)}
    />
  ), [handleUserPress]);

  // Get tab badge count
  const getTabBadge = (tab: FilterTab) => {
    switch (tab) {
      case 'pending':
        return stats.pending;
      case 'suspended':
        return stats.suspended;
      default:
        return undefined;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Kullanıcılar"
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
          title="Kullanıcılar"
          subtitle={`${stats.total} toplam kullanıcı`}
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
              placeholder="İsim, e-posta veya şirket ara..."
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
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Aktif</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bekleyen</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground }]}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.suspended}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Askıda</Text>
          </View>
        </View>

        {/* User List */}
        <View style={styles.listSection}>
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onPress={() => handleUserPress(user)}
            />
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Kullanıcı bulunamadı
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                Arama kriterlerinizi değiştirmeyi deneyin
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Suspend Modal */}
      <ActionModal
        visible={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmSuspend}
        title="Kullanıcıyı Askıya Al"
        message={`${selectedUser?.name} adlı kullanıcıyı askıya almak istediğinize emin misiniz?`}
        confirmLabel="Askıya Al"
        icon="pause-circle"
        iconColor="#f59e0b"
        requireReason
        reasonPlaceholder="Askıya alma sebebini yazın..."
        isDestructive
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

export default AdminUsersScreen;

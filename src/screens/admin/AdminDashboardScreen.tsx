import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
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
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { AdminKPICard } from '../../components/admin/AdminKPICard';
import { AuditLogItem } from '../../components/admin/AuditLogItem';
import type { AdminKPI, QuickAction, RecentActivity } from '../../types/admin';

export function AdminDashboardScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    stats,
    kpis,
    quickActions,
    recentActivities,
    isLoading,
    isRefreshing,
    refresh,
  } = useAdminDashboard();
  const { adminRoleName, isSuperAdmin } = useAdminPermissions();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(action.screen, action.params);
  }, [navigation]);

  const accentColor = colors.brand[400];
  const accentBg = isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)';

  // Get activity icon and color
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return { icon: 'person', color: '#8b5cf6' };
      case 'event':
        return { icon: 'calendar', color: '#3b82f6' };
      case 'payout':
        return { icon: 'wallet', color: '#10b981' };
      case 'moderation':
        return { icon: 'shield-checkmark', color: '#f59e0b' };
      default:
        return { icon: 'ellipse', color: colors.textMuted };
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Admin Panel"
        scrollY={scrollY}
        showBackButton
        rightAction={
          <TouchableOpacity
            style={[
              styles.headerAction,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.cardBackground },
            ]}
            onPress={() => navigation.navigate('AdminSettings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
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
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        <LargeTitle
          title="Admin Panel"
          subtitle={`Hoş geldiniz, ${adminRoleName || 'Admin'}`}
          scrollY={scrollY}
        />

        {/* Role Badge */}
        <View style={styles.modeSection}>
          <View
            style={[
              styles.modeBadge,
              { backgroundColor: accentBg, borderColor: accentColor },
            ]}
          >
            <Ionicons name="shield-checkmark" size={14} color={accentColor} />
            <Text style={[styles.modeText, { color: accentColor }]}>
              {adminRoleName || 'Admin'}
            </Text>
          </View>
        </View>

        {/* KPI Cards - Row 1 */}
        <View style={styles.section}>
          <View style={styles.kpiGrid}>
            {kpis.slice(0, 2).map((kpi) => (
              <AdminKPICard key={kpi.id} kpi={kpi} />
            ))}
          </View>
          <View style={[styles.kpiGrid, { marginTop: 12 }]}>
            {kpis.slice(2, 4).map((kpi) => (
              <AdminKPICard key={kpi.id} kpi={kpi} />
            ))}
          </View>
        </View>

        {/* KPI Cards - Row 2 */}
        <View style={styles.section}>
          <View style={styles.kpiGrid}>
            {kpis.slice(4, 6).map((kpi) => (
              <AdminKPICard key={kpi.id} kpi={kpi} />
            ))}
          </View>
          <View style={[styles.kpiGrid, { marginTop: 12 }]}>
            {kpis.slice(6, 8).map((kpi) => (
              <AdminKPICard key={kpi.id} kpi={kpi} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı İşlemler</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                  {action.badge !== undefined && action.badge > 0 ? (
                    <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                      <Text style={styles.badgeText}>
                        {action.badge > 99 ? '99+' : String(action.badge)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[styles.quickActionLabel, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navigation Shortcuts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Yönetim</Text>
          <View style={styles.navGrid}>
            <TouchableOpacity
              style={[
                styles.navCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <Ionicons name="people" size={28} color="#8b5cf6" />
              <Text style={[styles.navCardTitle, { color: colors.text }]}>Kullanıcılar</Text>
              <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                {stats?.totalUsers || 0} kullanıcı
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
              onPress={() => navigation.navigate('AdminEvents')}
            >
              <Ionicons name="calendar" size={28} color="#3b82f6" />
              <Text style={[styles.navCardTitle, { color: colors.text }]}>Etkinlikler</Text>
              <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                {stats?.pendingApproval || 0} bekleyen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
              onPress={() => navigation.navigate('AdminFinance')}
            >
              <Ionicons name="wallet" size={28} color="#10b981" />
              <Text style={[styles.navCardTitle, { color: colors.text }]}>Finans</Text>
              <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                {stats?.pendingPayouts || 0} ödeme
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
              onPress={() => navigation.navigate('AdminReports')}
            >
              <Ionicons name="bar-chart" size={28} color="#f59e0b" />
              <Text style={[styles.navCardTitle, { color: colors.text }]}>Raporlar</Text>
              <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                Analiz & Export
              </Text>
            </TouchableOpacity>
          </View>

          {isSuperAdmin && (
            <View style={[styles.navGrid, { marginTop: 12 }]}>
              <TouchableOpacity
                style={[
                  styles.navCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
                onPress={() => navigation.navigate('AdminRoles')}
              >
                <Ionicons name="key" size={28} color="#ec4899" />
                <Text style={[styles.navCardTitle, { color: colors.text }]}>Roller</Text>
                <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                  Yetki yönetimi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navCard,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
                ]}
                onPress={() => navigation.navigate('AdminSettings')}
              >
                <Ionicons name="settings" size={28} color="#6366f1" />
                <Text style={[styles.navCardTitle, { color: colors.text }]}>Ayarlar</Text>
                <Text style={[styles.navCardSubtitle, { color: colors.textMuted }]}>
                  Sistem ayarları
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Aktiviteler</Text>
          <View
            style={[
              styles.activitiesCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
          >
            {recentActivities.map((activity, index) => {
              const { icon, color } = getActivityIcon(activity.type);
              return (
                <View
                  key={activity.id}
                  style={[
                    styles.activityRow,
                    index !== recentActivities.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityAction, { color: colors.text }]}>
                      {activity.action}
                    </Text>
                    <Text style={[styles.activityDescription, { color: colors.textMuted }]}>
                      {activity.description}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                    {formatRelativeTime(activity.timestamp)}
                  </Text>
                </View>
              );
            })}
          </View>
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
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  quickActionCard: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  navCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  navCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  activitiesCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
  },
});

export default AdminDashboardScreen;

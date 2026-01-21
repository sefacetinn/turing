import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'users' | 'events' | 'finance' | 'performance';
}

const reports: ReportItem[] = [
  {
    id: 'users_overview',
    title: 'Kullanıcı Raporu',
    description: 'Kayıt, doğrulama ve aktivite istatistikleri',
    icon: 'people',
    color: '#8b5cf6',
    type: 'users',
  },
  {
    id: 'events_overview',
    title: 'Etkinlik Raporu',
    description: 'Etkinlik oluşturma ve moderasyon verileri',
    icon: 'calendar',
    color: '#3b82f6',
    type: 'events',
  },
  {
    id: 'finance_overview',
    title: 'Finansal Rapor',
    description: 'Gelir, komisyon ve ödeme analizleri',
    icon: 'wallet',
    color: '#10b981',
    type: 'finance',
  },
  {
    id: 'performance_overview',
    title: 'Performans Raporu',
    description: 'Platform performans metrikleri',
    icon: 'trending-up',
    color: '#f59e0b',
    type: 'performance',
  },
  {
    id: 'provider_activity',
    title: 'Provider Aktivite Raporu',
    description: 'Provider bazlı aktivite ve gelir analizi',
    icon: 'briefcase',
    color: '#ec4899',
    type: 'finance',
  },
  {
    id: 'moderation_log',
    title: 'Moderasyon Raporu',
    description: 'Moderasyon işlemleri ve audit log',
    icon: 'shield-checkmark',
    color: '#6366f1',
    type: 'events',
  },
];

export function AdminReportsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { canExportReports } = useAdminPermissions();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleReportPress = useCallback((report: ReportItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to specific report detail or generate report
    console.log('Generate report:', report.id);
  }, []);

  const handleExport = useCallback((report: ReportItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Export report
    console.log('Export report:', report.id);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Raporlar"
        scrollY={scrollY}
        showBackButton
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <LargeTitle
          title="Raporlar"
          subtitle="Platform analiz ve raporları"
          scrollY={scrollY}
        />

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.quickStats}>
            <View
              style={[
                styles.quickStatCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              <Ionicons name="document-text" size={24} color={colors.brand[400]} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {reports.length}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>
                Rapor Tipi
              </Text>
            </View>

            <View
              style={[
                styles.quickStatCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              <Ionicons name="download" size={24} color="#10b981" />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                CSV, XLSX
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>
                Export Format
              </Text>
            </View>
          </View>
        </View>

        {/* Report List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mevcut Raporlar</Text>

          {reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.reportCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
              onPress={() => handleReportPress(report)}
              activeOpacity={0.7}
            >
              <View style={[styles.reportIcon, { backgroundColor: `${report.color}20` }]}>
                <Ionicons name={report.icon as any} size={24} color={report.color} />
              </View>

              <View style={styles.reportContent}>
                <Text style={[styles.reportTitle, { color: colors.text }]}>
                  {report.title}
                </Text>
                <Text style={[styles.reportDescription, { color: colors.textMuted }]}>
                  {report.description}
                </Text>
              </View>

              <View style={styles.reportActions}>
                {canExportReports && (
                  <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: `${colors.brand[400]}20` }]}
                    onPress={() => handleExport(report)}
                  >
                    <Ionicons name="download-outline" size={18} color={colors.brand[400]} />
                  </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Options */}
        {canExportReports && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Toplu Export</Text>

            <TouchableOpacity
              style={[
                styles.bulkExportCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
              ]}
            >
              <View style={styles.bulkExportContent}>
                <Ionicons name="cloud-download" size={32} color={colors.brand[400]} />
                <View style={styles.bulkExportText}>
                  <Text style={[styles.bulkExportTitle, { color: colors.text }]}>
                    Tüm Verileri Dışa Aktar
                  </Text>
                  <Text style={[styles.bulkExportDescription, { color: colors.textMuted }]}>
                    Kullanıcı, etkinlik ve finansal verileri tek seferde indirin
                  </Text>
                </View>
              </View>
              <View style={[styles.exportFormatBadge, { backgroundColor: colors.brand[500] }]}>
                <Text style={styles.exportFormatText}>XLSX</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkExportCard: {
    padding: 16,
    borderRadius: 16,
  },
  bulkExportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulkExportText: {
    flex: 1,
  },
  bulkExportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  bulkExportDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  exportFormatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  exportFormatText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AdminReportsScreen;

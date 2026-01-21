import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Switch,
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
import { ActionModal } from '../../components/admin/ActionModal';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'toggle' | 'action' | 'link';
  value?: boolean;
  danger?: boolean;
}

const platformSettings: SettingItem[] = [
  {
    id: 'maintenance_mode',
    title: 'Bakım Modu',
    description: 'Platformu bakım moduna al',
    icon: 'construct',
    type: 'toggle',
    value: false,
    danger: true,
  },
  {
    id: 'new_registrations',
    title: 'Yeni Kayıtlar',
    description: 'Yeni kullanıcı kayıtlarına izin ver',
    icon: 'person-add',
    type: 'toggle',
    value: true,
  },
  {
    id: 'event_creation',
    title: 'Etkinlik Oluşturma',
    description: 'Yeni etkinlik oluşturmaya izin ver',
    icon: 'calendar',
    type: 'toggle',
    value: true,
  },
  {
    id: 'auto_approve',
    title: 'Otomatik Onay',
    description: 'Doğrulanmış kullanıcıların etkinliklerini otomatik onayla',
    icon: 'checkmark-circle',
    type: 'toggle',
    value: false,
  },
];

const moderationSettings: SettingItem[] = [
  {
    id: 'content_filter',
    title: 'İçerik Filtresi',
    description: 'Uygunsuz içerikleri otomatik filtrele',
    icon: 'shield-checkmark',
    type: 'toggle',
    value: true,
  },
  {
    id: 'spam_protection',
    title: 'Spam Koruması',
    description: 'Spam tespiti ve engelleme',
    icon: 'ban',
    type: 'toggle',
    value: true,
  },
  {
    id: 'rate_limiting',
    title: 'Hız Sınırlama',
    description: 'API isteklerini sınırla',
    icon: 'speedometer',
    type: 'toggle',
    value: true,
  },
];

const dataActions: SettingItem[] = [
  {
    id: 'export_users',
    title: 'Kullanıcıları Dışa Aktar',
    description: 'Tüm kullanıcı verilerini dışa aktar',
    icon: 'download',
    type: 'action',
  },
  {
    id: 'export_events',
    title: 'Etkinlikleri Dışa Aktar',
    description: 'Tüm etkinlik verilerini dışa aktar',
    icon: 'document-text',
    type: 'action',
  },
  {
    id: 'clear_cache',
    title: 'Önbelleği Temizle',
    description: 'Platform önbelleğini temizle',
    icon: 'trash',
    type: 'action',
  },
  {
    id: 'rebuild_indexes',
    title: 'İndeksleri Yeniden Oluştur',
    description: 'Arama indekslerini yeniden oluştur',
    icon: 'refresh',
    type: 'action',
  },
];

const dangerZone: SettingItem[] = [
  {
    id: 'purge_deleted',
    title: 'Silinen Verileri Temizle',
    description: 'Soft-delete edilmiş verileri kalıcı olarak sil',
    icon: 'trash',
    type: 'action',
    danger: true,
  },
  {
    id: 'reset_analytics',
    title: 'Analitiği Sıfırla',
    description: 'Tüm analitik verilerini sıfırla',
    icon: 'analytics',
    type: 'action',
    danger: true,
  },
];

export function AdminSettingsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isSuperAdmin, canEditSettings } = useAdminPermissions();

  const [settings, setSettings] = useState<Record<string, boolean>>({
    maintenance_mode: false,
    new_registrations: true,
    event_creation: true,
    auto_approve: false,
    content_filter: true,
    spam_protection: true,
    rate_limiting: true,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SettingItem | null>(null);

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

  const handleToggle = useCallback((id: string) => {
    if (!canEditSettings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, [canEditSettings]);

  const handleAction = useCallback((item: SettingItem) => {
    if (!canEditSettings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (item.danger) {
      setSelectedAction(item);
      setShowDangerModal(true);
    } else {
      // Execute action
      console.log('Execute action:', item.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [canEditSettings]);

  const confirmDangerAction = useCallback(() => {
    if (selectedAction) {
      console.log('Execute dangerous action:', selectedAction.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowDangerModal(false);
    setSelectedAction(null);
  }, [selectedAction]);

  const renderSettingItem = (item: SettingItem) => {
    const isToggle = item.type === 'toggle';
    const value = settings[item.id];

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
        ]}
        onPress={() => (isToggle ? handleToggle(item.id) : handleAction(item))}
        activeOpacity={0.7}
        disabled={!canEditSettings}
      >
        <View
          style={[
            styles.settingIcon,
            {
              backgroundColor: item.danger
                ? 'rgba(239,68,68,0.1)'
                : `${colors.brand[400]}20`,
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.danger ? '#ef4444' : colors.brand[400]}
          />
        </View>

        <View style={styles.settingContent}>
          <Text
            style={[
              styles.settingTitle,
              { color: item.danger ? '#ef4444' : colors.text },
            ]}
          >
            {item.title}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            {item.description}
          </Text>
        </View>

        {isToggle ? (
          <Switch
            value={value}
            onValueChange={() => handleToggle(item.id)}
            trackColor={{
              false: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              true: item.danger ? '#ef4444' : colors.brand[500],
            }}
            thumbColor="#fff"
            disabled={!canEditSettings}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollHeader
        title="Admin Ayarları"
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
          title="Admin Ayarları"
          subtitle="Platform yapılandırması"
          scrollY={scrollY}
        />

        {/* Admin Info */}
        <View style={styles.section}>
          <View
            style={[
              styles.adminInfoCard,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.cardBackground },
            ]}
          >
            <View style={[styles.adminAvatar, { backgroundColor: colors.brand[500] }]}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={[styles.adminName, { color: colors.text }]}>Admin</Text>
              <Text style={[styles.adminRole, { color: colors.textMuted }]}>
                {isSuperAdmin ? 'Super Admin' : 'Administrator'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#10b98120' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.statusText, { color: '#10b981' }]}>Aktif</Text>
            </View>
          </View>
        </View>

        {/* Platform Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Ayarları</Text>
          <View style={styles.settingsList}>
            {platformSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Moderation Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Moderasyon Ayarları</Text>
          <View style={styles.settingsList}>
            {moderationSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Data Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Veri İşlemleri</Text>
          <View style={styles.settingsList}>
            {dataActions.map(renderSettingItem)}
          </View>
        </View>

        {/* Danger Zone - Only for Super Admin */}
        {isSuperAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Tehlikeli Bölge</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Bu işlemler geri alınamaz. Dikkatli kullanın.
            </Text>
            <View style={styles.settingsList}>
              {dangerZone.map(renderSettingItem)}
            </View>
          </View>
        )}

        {/* Version Info */}
        <View style={styles.section}>
          <View style={styles.versionInfo}>
            <Text style={[styles.versionLabel, { color: colors.textMuted }]}>
              Admin Panel Sürümü
            </Text>
            <Text style={[styles.versionValue, { color: colors.text }]}>1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Danger Action Modal */}
      <ActionModal
        visible={showDangerModal}
        onClose={() => {
          setShowDangerModal(false);
          setSelectedAction(null);
        }}
        onConfirm={confirmDangerAction}
        title={selectedAction?.title || 'Tehlikeli İşlem'}
        message={`"${selectedAction?.title}" işlemini gerçekleştirmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Devam Et"
        icon="warning"
        iconColor="#ef4444"
        isDestructive
      />
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
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },
  adminInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  adminAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminInfo: {
    flex: 1,
    marginLeft: 14,
  },
  adminName: {
    fontSize: 17,
    fontWeight: '600',
  },
  adminRole: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsList: {
    gap: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionLabel: {
    fontSize: 12,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default AdminSettingsScreen;

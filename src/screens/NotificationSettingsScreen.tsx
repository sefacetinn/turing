import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { darkTheme as defaultColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationGroup {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  settings: NotificationSetting[];
}

export function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([
    {
      title: 'Teklifler',
      icon: 'pricetags',
      settings: [
        { id: 'new_offer', title: 'Yeni Teklifler', description: 'Yeni teklif geldiğinde bildir', enabled: true },
        { id: 'offer_accepted', title: 'Teklif Onayları', description: 'Teklifiniz onaylandığında bildir', enabled: true },
        { id: 'offer_rejected', title: 'Teklif Redleri', description: 'Teklifiniz reddedildiğinde bildir', enabled: true },
        { id: 'offer_expiring', title: 'Süre Uyarıları', description: 'Teklif süresi dolmadan bildir', enabled: false },
      ],
    },
    {
      title: 'Mesajlar',
      icon: 'chatbubble-ellipses',
      settings: [
        { id: 'new_message', title: 'Yeni Mesajlar', description: 'Yeni mesaj geldiğinde bildir', enabled: true },
        { id: 'message_read', title: 'Okundu Bildirimi', description: 'Mesajınız okunduğunda bildir', enabled: false },
      ],
    },
    {
      title: 'Etkinlikler',
      icon: 'calendar',
      settings: [
        { id: 'event_reminder', title: 'Etkinlik Hatırlatıcı', description: 'Etkinlik öncesi hatırlat', enabled: true },
        { id: 'event_update', title: 'Etkinlik Güncellemeleri', description: 'Etkinlik değişikliklerinde bildir', enabled: true },
        { id: 'event_cancelled', title: 'İptal Bildirimleri', description: 'Etkinlik iptallerinde bildir', enabled: true },
      ],
    },
    {
      title: 'Pazarlama',
      icon: 'megaphone',
      settings: [
        { id: 'promotions', title: 'Kampanyalar', description: 'Özel teklifler ve kampanyalar', enabled: false },
        { id: 'newsletter', title: 'Bülten', description: 'Haftalık bülten ve haberler', enabled: false },
        { id: 'recommendations', title: 'Öneriler', description: 'Kişiselleştirilmiş öneriler', enabled: true },
      ],
    },
  ]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const toggleSetting = (groupIndex: number, settingId: string) => {
    setNotificationGroups((prev) =>
      prev.map((group, idx) => {
        if (idx !== groupIndex) return group;
        return {
          ...group,
          settings: group.settings.map((setting) =>
            setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting
          ),
        };
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bildirim Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Master Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Bildirim Kanalları</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Ionicons name="notifications" size={20} color={colors.brand[400]} />
                </View>
                <View>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Push Bildirimleri</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Anlık bildirimler al</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={pushEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="mail" size={20} color={colors.info} />
                </View>
                <View>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>E-posta Bildirimleri</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>E-posta ile bildirim al</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={emailEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="chatbox" size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>SMS Bildirimleri</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>SMS ile bildirim al</Text>
                </View>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={smsEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>
          </View>
        </View>

        {/* Notification Groups */}
        {notificationGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={group.icon} size={18} color={colors.brand[400]} />
              <Text style={[styles.sectionTitle, { color: colors.textMuted, marginBottom: 0 }]}>{group.title}</Text>
            </View>
            <View style={[styles.card, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}>
              {group.settings.map((setting, settingIndex) => (
                <View key={setting.id}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                      <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{setting.description}</Text>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => toggleSetting(groupIndex, setting.id)}
                      trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                      thumbColor={setting.enabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
                    />
                  </View>
                  {settingIndex < group.settings.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Sessiz Saatler</Text>
          <TouchableOpacity style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]} activeOpacity={0.7} onPress={() => navigation.navigate('QuietHours')}>
            <View style={styles.quietHoursRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="moon" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Sessiz Mod</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>22:00 - 08:00 arası bildirim alma</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  masterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  masterToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationGroup {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  settings: NotificationSetting[];
}

export function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  // Permission state
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoaded, setIsLoaded] = useState(false);

  // Channel toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Sound & Vibration
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [badgeEnabled, setBadgeEnabled] = useState(true);

  // Quiet Hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartHour, setQuietStartHour] = useState(22);
  const [quietStartMinute, setQuietStartMinute] = useState(0);
  const [quietEndHour, setQuietEndHour] = useState(8);
  const [quietEndMinute, setQuietEndMinute] = useState(0);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [editingTime, setEditingTime] = useState<'start' | 'end'>('start');

  // Notification Groups
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([
    {
      id: 'offers',
      title: 'Teklifler',
      icon: 'pricetags',
      color: '#6366F1',
      settings: [
        { id: 'new_offer', title: 'Yeni Teklifler', description: 'Yeni teklif geldiğinde bildir', enabled: true },
        { id: 'offer_accepted', title: 'Teklif Onayları', description: 'Teklifiniz onaylandığında bildir', enabled: true },
        { id: 'offer_rejected', title: 'Teklif Redleri', description: 'Teklifiniz reddedildiğinde bildir', enabled: true },
        { id: 'offer_counter', title: 'Karşı Teklifler', description: 'Pazarlık teklifleri geldiğinde bildir', enabled: true },
        { id: 'offer_expiring', title: 'Süre Uyarıları', description: 'Teklif süresi dolmadan bildir', enabled: false },
      ],
    },
    {
      id: 'messages',
      title: 'Mesajlar',
      icon: 'chatbubble-ellipses',
      color: '#10B981',
      settings: [
        { id: 'new_message', title: 'Yeni Mesajlar', description: 'Yeni mesaj geldiğinde bildir', enabled: true },
        { id: 'message_read', title: 'Okundu Bildirimi', description: 'Mesajınız okunduğunda bildir', enabled: false },
        { id: 'typing_indicator', title: 'Yazıyor Göstergesi', description: 'Karşı taraf yazarken göster', enabled: true },
      ],
    },
    {
      id: 'events',
      title: 'Etkinlikler',
      icon: 'calendar',
      color: '#F59E0B',
      settings: [
        { id: 'event_reminder_1d', title: '1 Gün Önce Hatırlat', description: 'Etkinlikten 1 gün önce bildir', enabled: true },
        { id: 'event_reminder_1h', title: '1 Saat Önce Hatırlat', description: 'Etkinlikten 1 saat önce bildir', enabled: true },
        { id: 'event_update', title: 'Etkinlik Güncellemeleri', description: 'Etkinlik değişikliklerinde bildir', enabled: true },
        { id: 'event_cancelled', title: 'İptal Bildirimleri', description: 'Etkinlik iptallerinde bildir', enabled: true },
      ],
    },
    {
      id: 'payments',
      title: 'Ödemeler',
      icon: 'card',
      color: '#8B5CF6',
      settings: [
        { id: 'payment_received', title: 'Ödeme Alındı', description: 'Ödeme alındığında bildir', enabled: true },
        { id: 'payment_pending', title: 'Bekleyen Ödemeler', description: 'Ödeme beklerken hatırlat', enabled: true },
        { id: 'invoice_created', title: 'Fatura Oluşturuldu', description: 'Yeni fatura oluşturulduğunda bildir', enabled: true },
      ],
    },
    {
      id: 'marketing',
      title: 'Pazarlama',
      icon: 'megaphone',
      color: '#EC4899',
      settings: [
        { id: 'promotions', title: 'Kampanyalar', description: 'Özel teklifler ve kampanyalar', enabled: false },
        { id: 'newsletter', title: 'Bülten', description: 'Haftalık bülten ve haberler', enabled: false },
        { id: 'recommendations', title: 'Öneriler', description: 'Kişiselleştirilmiş öneriler', enabled: true },
        { id: 'tips', title: 'İpuçları', description: 'Uygulama kullanım ipuçları', enabled: false },
      ],
    },
  ]);

  // Load saved settings on mount
  useEffect(() => {
    checkPermission();
    loadSettings();
  }, []);

  // Save settings whenever they change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveSettings();
    }
  }, [isLoaded, pushEnabled, emailEnabled, smsEnabled, soundEnabled, vibrationEnabled, badgeEnabled, quietHoursEnabled, quietStartHour, quietStartMinute, quietEndHour, quietEndMinute, notificationGroups]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPushEnabled(settings.pushEnabled ?? true);
        setEmailEnabled(settings.emailEnabled ?? true);
        setSmsEnabled(settings.smsEnabled ?? false);
        setSoundEnabled(settings.soundEnabled ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
        setBadgeEnabled(settings.badgeEnabled ?? true);
        setQuietHoursEnabled(settings.quietHoursEnabled ?? false);
        setQuietStartHour(settings.quietStartHour ?? 22);
        setQuietStartMinute(settings.quietStartMinute ?? 0);
        setQuietEndHour(settings.quietEndHour ?? 8);
        setQuietEndMinute(settings.quietEndMinute ?? 0);
        if (settings.notificationGroups) {
          setNotificationGroups(settings.notificationGroups);
        }
      }
    } catch (error) {
      console.warn('Error loading notification settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        pushEnabled,
        emailEnabled,
        smsEnabled,
        soundEnabled,
        vibrationEnabled,
        badgeEnabled,
        quietHoursEnabled,
        quietStartHour,
        quietStartMinute,
        quietEndHour,
        quietEndMinute,
        notificationGroups,
      };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving notification settings:', error);
    }
  };

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') {
      setPushEnabled(false);
    }
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status === 'granted') {
      setPushEnabled(true);
      Alert.alert('Başarılı', 'Push bildirimleri etkinleştirildi');
    } else {
      Alert.alert(
        'İzin Gerekli',
        'Bildirimleri alabilmek için ayarlardan izin vermeniz gerekiyor.',
        [
          { text: 'Tamam' },
        ]
      );
    }
  };

  const handlePushToggle = async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      await requestPermission();
    } else {
      setPushEnabled(value);
      if (value) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  // Toggle single setting
  const toggleSetting = (groupId: string, settingId: string) => {
    Haptics.selectionAsync();
    setNotificationGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          settings: group.settings.map((setting) =>
            setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting
          ),
        };
      })
    );
  };

  // Toggle all in group
  const toggleAllInGroup = (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotificationGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const allEnabled = group.settings.every(s => s.enabled);
        return {
          ...group,
          settings: group.settings.map((setting) => ({ ...setting, enabled: !allEnabled })),
        };
      })
    );
  };

  // Check if all settings in group are enabled
  const isGroupAllEnabled = (groupId: string): boolean => {
    const group = notificationGroups.find(g => g.id === groupId);
    return group ? group.settings.every(s => s.enabled) : false;
  };

  // Check if some settings in group are enabled
  const isGroupPartialEnabled = (groupId: string): boolean => {
    const group = notificationGroups.find(g => g.id === groupId);
    if (!group) return false;
    const enabledCount = group.settings.filter(s => s.enabled).length;
    return enabledCount > 0 && enabledCount < group.settings.length;
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Test bildirimi göndermek için önce push bildirimlerini etkinleştirin.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Bildirimi',
        body: 'Bu bir test bildirimidir. Bildirimleriniz düzgün çalışıyor!',
        sound: soundEnabled ? 'default' : undefined,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Gönderildi', 'Test bildirimi 1 saniye içinde gelecek');
  };

  // Format time
  const formatTime = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Time picker hours
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bildirim Ayarları</Text>
        <TouchableOpacity onPress={sendTestNotification} style={styles.testButton}>
          <Ionicons name="paper-plane-outline" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Permission Warning */}
        {permissionStatus !== 'granted' && (
          <TouchableOpacity
            style={[styles.permissionWarning, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <View style={styles.permissionWarningText}>
              <Text style={[styles.permissionWarningTitle, { color: colors.text }]}>Bildirim İzni Gerekli</Text>
              <Text style={[styles.permissionWarningDesc, { color: colors.textMuted }]}>
                Push bildirimleri almak için dokunun
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

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
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(75, 48, 184, 0.15)' }]}>
                  <Ionicons name="notifications" size={20} color={colors.brand[400]} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Push Bildirimleri</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Anlık bildirimler al</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handlePushToggle}
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
                <View style={styles.toggleTextContainer}>
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
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>SMS Bildirimleri</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Kritik bildirimler için SMS</Text>
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

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Ses & Titreşim</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="volume-high" size={20} color="#EF4444" />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Bildirim Sesi</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Sesli bildirim al</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(value) => {
                  setSoundEnabled(value);
                  if (value) Haptics.selectionAsync();
                }}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={soundEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Ionicons name="phone-portrait" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Titreşim</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Titreşimli bildirim al</Text>
                </View>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={(value) => {
                  setVibrationEnabled(value);
                  if (value) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={vibrationEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />

            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Ionicons name="ellipse" size={20} color="#EC4899" />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Rozet (Badge)</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>Uygulama ikonunda sayı göster</Text>
                </View>
              </View>
              <Switch
                value={badgeEnabled}
                onValueChange={setBadgeEnabled}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={badgeEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Sessiz Saatler</Text>
          <View style={[styles.card, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            ...(isDark ? {} : helpers.getShadow('sm'))
          }]}>
            <View style={styles.masterToggleRow}>
              <View style={styles.masterToggleInfo}>
                <View style={[styles.toggleIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="moon" size={20} color="#F59E0B" />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Sessiz Mod</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>
                    {quietHoursEnabled
                      ? `${formatTime(quietStartHour, quietStartMinute)} - ${formatTime(quietEndHour, quietEndMinute)}`
                      : 'Belirli saatlerde bildirim alma'}
                  </Text>
                </View>
              </View>
              <Switch
                value={quietHoursEnabled}
                onValueChange={setQuietHoursEnabled}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                thumbColor={quietHoursEnabled ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>

            {quietHoursEnabled && (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                <View style={styles.quietHoursTimeRow}>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                    onPress={() => {
                      setEditingTime('start');
                      setShowQuietHoursModal(true);
                    }}
                  >
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Başlangıç</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(quietStartHour, quietStartMinute)}</Text>
                  </TouchableOpacity>
                  <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                    onPress={() => {
                      setEditingTime('end');
                      setShowQuietHoursModal(true);
                    }}
                  >
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Bitiş</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(quietEndHour, quietEndMinute)}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Notification Groups */}
        {notificationGroups.map((group) => (
          <View key={group.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name={group.icon} size={18} color={group.color} />
                <Text style={[styles.sectionTitle, { color: colors.textMuted, marginBottom: 0 }]}>{group.title}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleAllButton, {
                  backgroundColor: isGroupAllEnabled(group.id) ? `${group.color}20` : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5')
                }]}
                onPress={() => toggleAllInGroup(group.id)}
              >
                <Text style={[styles.toggleAllText, { color: isGroupAllEnabled(group.id) ? group.color : colors.textMuted }]}>
                  {isGroupAllEnabled(group.id) ? 'Tümünü Kapat' : 'Tümünü Aç'}
                </Text>
              </TouchableOpacity>
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
                      onValueChange={() => toggleSetting(group.id, setting.id)}
                      trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: group.color }}
                      thumbColor={setting.enabled ? '#FFFFFF' : isDark ? colors.zinc[400] : colors.zinc[300]}
                    />
                  </View>
                  {settingIndex < group.settings.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Test Notification Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.testNotificationButton}
            onPress={sendTestNotification}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4B30B8', '#6366F1']}
              style={styles.testNotificationGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="paper-plane" size={20} color="white" />
              <Text style={styles.testNotificationText}>Test Bildirimi Gönder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quiet Hours Time Picker Modal */}
      <Modal visible={showQuietHoursModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTime === 'start' ? 'Başlangıç Saati' : 'Bitiş Saati'}
              </Text>
              <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerLabel, { color: colors.textMuted }]}>Saat</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {hours.map((hour) => {
                    const isSelected = editingTime === 'start' ? hour === quietStartHour : hour === quietEndHour;
                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[styles.timePickerItem, isSelected && { backgroundColor: colors.brand[400] }]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          if (editingTime === 'start') {
                            setQuietStartHour(hour);
                          } else {
                            setQuietEndHour(hour);
                          }
                        }}
                      >
                        <Text style={[styles.timePickerItemText, { color: isSelected ? 'white' : colors.text }]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerLabel, { color: colors.textMuted }]}>Dakika</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {minutes.map((minute) => {
                    const isSelected = editingTime === 'start' ? minute === quietStartMinute : minute === quietEndMinute;
                    return (
                      <TouchableOpacity
                        key={minute}
                        style={[styles.timePickerItem, isSelected && { backgroundColor: colors.brand[400] }]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          if (editingTime === 'start') {
                            setQuietStartMinute(minute);
                          } else {
                            setQuietEndMinute(minute);
                          }
                        }}
                      >
                        <Text style={[styles.timePickerItemText, { color: isSelected ? 'white' : colors.text }]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowQuietHoursModal(false)}
            >
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.modalButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalButtonText}>Tamam</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  testButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  permissionWarningText: {
    flex: 1,
  },
  permissionWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionWarningDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  toggleAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleAllText: {
    fontSize: 12,
    fontWeight: '600',
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
  toggleTextContainer: {
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
  quietHoursTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  timeLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  testNotificationButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  testNotificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  testNotificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 40,
  },
  timePickerColumn: {
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timePickerScroll: {
    height: 200,
  },
  timePickerItem: {
    width: 60,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  timePickerItemText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

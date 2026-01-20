import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useRBAC } from '../context/RBACContext';
import { usePermissions } from '../hooks/usePermissions';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { currentOrganization } = useRBAC();
  const { canManageTeam } = usePermissions();

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  // Privacy settings
  const [showProfile, setShowProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cikis Yap',
      'Hesabinizdan cikis yapmak istediginize emin misiniz?',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Cikis Yap',
          style: 'destructive',
          onPress: () => onLogout?.()
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Hesabi Sil',
      'Bu islem geri alinamaz. Hesabiniz ve tum verileriniz kalici olarak silinecektir.',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Hesabi Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme talebi alindi. 7 gun icinde hesabiniz silinecektir.');
          }
        },
      ]
    );
  };

  const handleRateApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Uygulamayi Degerlendir',
      'Bizi degerlendirmek icin App Store\'a yonlendirileceksiniz.',
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Devam',
          onPress: () => {
            // In a real app, this would open the App Store
            Linking.openURL('https://apps.apple.com');
          }
        },
      ]
    );
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      ...(isDark ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
      }),
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.text,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    logoutButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      paddingVertical: 16,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
      marginBottom: 12,
    },
    deleteButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      paddingVertical: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    versionText: {
      fontSize: 13,
      fontWeight: '500' as const,
      color: colors.textSecondary,
    },
    versionSubtext: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
  };

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    iconBg: string,
    iconColor: string,
    label: string,
    description?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={dynamicStyles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingInfo}>
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.settingText}>
          <Text style={dynamicStyles.settingLabel}>{label}</Text>
          {description && <Text style={dynamicStyles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  const renderSwitch = (value: boolean, onValueChange: (val: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: isDark ? colors.zinc[700] : '#a1a1aa', true: colors.brand[500] }}
      thumbColor="#ffffff"
      ios_backgroundColor={isDark ? colors.zinc[700] : '#d4d4d8'}
    />
  );

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Gorunum</Text>
          {renderSettingItem(
            isDark ? 'moon' : 'sunny',
            isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            isDark ? '#818cf8' : '#f59e0b',
            isDark ? 'Karanlik Mod' : 'Aydinlik Mod',
            isDark ? 'Koyu tema aktif' : 'Acik tema aktif',
            undefined,
            renderSwitch(isDark, toggleTheme)
          )}
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Ekip</Text>
          {renderSettingItem(
            'people',
            'rgba(75, 48, 184, 0.15)',
            '#4b30b8',
            'Ekip Yönetimi',
            currentOrganization ? `${currentOrganization.members.length} üye` : 'Ekibinizi yönetin',
            () => navigation.navigate('Team')
          )}
          {canManageTeam && renderSettingItem(
            'person-add',
            'rgba(16, 185, 129, 0.15)',
            colors.success,
            'Üye Davet Et',
            'Yeni ekip üyesi ekleyin',
            () => navigation.navigate('InviteMember')
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Bildirimler</Text>

          {renderSettingItem(
            'notifications',
            'rgba(75, 48, 184, 0.15)',
            colors.brand[400],
            'Push Bildirimleri',
            'Anlik bildirimler al',
            undefined,
            renderSwitch(pushNotifications, setPushNotifications)
          )}

          {renderSettingItem(
            'mail',
            'rgba(59, 130, 246, 0.15)',
            colors.info,
            'E-posta Bildirimleri',
            'Onemli guncellemeler icin',
            undefined,
            renderSwitch(emailNotifications, setEmailNotifications)
          )}

          {renderSettingItem(
            'pricetag',
            'rgba(16, 185, 129, 0.15)',
            colors.success,
            'Teklif Bildirimleri',
            'Yeni teklifler icin uyari',
            undefined,
            renderSwitch(offerNotifications, setOfferNotifications)
          )}

          {renderSettingItem(
            'chatbubble',
            'rgba(245, 158, 11, 0.15)',
            colors.warning,
            'Mesaj Bildirimleri',
            'Yeni mesajlar icin uyari',
            undefined,
            renderSwitch(messageNotifications, setMessageNotifications)
          )}

          {renderSettingItem(
            'options',
            'rgba(113, 113, 122, 0.15)',
            colors.textSecondary,
            'Detayli Bildirim Ayarlari',
            'Kategori bazli ayarlar',
            () => navigation.navigate('NotificationSettings')
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Gizlilik</Text>

          {renderSettingItem(
            'eye',
            'rgba(75, 48, 184, 0.15)',
            colors.brand[400],
            'Profili Goster',
            'Profilin herkese acik',
            undefined,
            renderSwitch(showProfile, setShowProfile)
          )}

          {renderSettingItem(
            'location',
            'rgba(59, 130, 246, 0.15)',
            colors.info,
            'Konum Paylas',
            'Yakindaki saglayicilar icin',
            undefined,
            renderSwitch(showLocation, setShowLocation)
          )}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Genel</Text>

          {renderSettingItem(
            'language',
            'rgba(75, 48, 184, 0.15)',
            colors.brand[400],
            'Dil',
            'Turkce',
            () => navigation.navigate('Language')
          )}

          {renderSettingItem(
            'cash',
            'rgba(16, 185, 129, 0.15)',
            colors.success,
            'Para Birimi',
            'TRY (₺)',
            () => navigation.navigate('Currency')
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Destek</Text>

          {renderSettingItem(
            'help-circle',
            'rgba(75, 48, 184, 0.15)',
            colors.brand[400],
            'Yardim Merkezi',
            'SSS ve rehberler',
            () => navigation.navigate('HelpSupport')
          )}

          {renderSettingItem(
            'chatbubbles',
            'rgba(59, 130, 246, 0.15)',
            colors.info,
            'Bize Ulasin',
            'Destek ekibimizle iletisime gecin',
            () => navigation.navigate('ContactSupport')
          )}

          {renderSettingItem(
            'star',
            'rgba(245, 158, 11, 0.15)',
            colors.warning,
            'Uygulamayi Degerlendir',
            'App Store\'da degerlendir',
            handleRateApp
          )}
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Yasal</Text>

          {renderSettingItem(
            'document-text',
            'rgba(113, 113, 122, 0.15)',
            colors.textSecondary,
            'Kullanim Kosullari',
            undefined,
            () => navigation.navigate('Terms')
          )}

          {renderSettingItem(
            'shield-checkmark',
            'rgba(113, 113, 122, 0.15)',
            colors.textSecondary,
            'Gizlilik Politikasi',
            undefined,
            () => navigation.navigate('PrivacyPolicy')
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Cikis Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.deleteText, { color: colors.textMuted }]}>Hesabi Sil</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={dynamicStyles.versionText}>turing v1.0.0</Text>
          <Text style={dynamicStyles.versionSubtext}>Build 2024.1</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
});

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { userProfile } from '../data/mockData';
import { useApp } from '../../App';

interface ProfileScreenProps {
  isProviderMode: boolean;
  onToggleMode: () => void;
  onLogout: () => void;
}

const organizerMenuItems = [
  { id: 'account', icon: 'person-outline', label: 'Hesap Bilgileri', chevron: true },
  { id: 'team', icon: 'people-outline', label: 'Ekip Yönetimi', chevron: true },
  { id: 'contracts', icon: 'document-text-outline', label: 'Sözleşmelerim', chevron: true },
  { id: 'reviews', icon: 'star-outline', label: 'Değerlendirmelerim', chevron: true },
  { id: 'favorites', icon: 'heart-outline', label: 'Favorilerim', chevron: true },
  { id: 'notifications', icon: 'notifications-outline', label: 'Bildirim Ayarları', chevron: true },
  { id: 'security', icon: 'shield-outline', label: 'Güvenlik', chevron: true },
  { id: 'payment', icon: 'card-outline', label: 'Ödeme Yöntemleri', chevron: true },
  { id: 'help', icon: 'help-circle-outline', label: 'Yardım & Destek', chevron: true },
  { id: 'about', icon: 'information-circle-outline', label: 'Hakkında', chevron: true },
];

const providerMenuItems = [
  { id: 'account', icon: 'person-outline', label: 'Hesap Bilgileri', chevron: true },
  { id: 'team', icon: 'people-outline', label: 'Ekip Yönetimi', chevron: true },
  { id: 'services', icon: 'construct-outline', label: 'Verdiğim Hizmetler', chevron: true },
  { id: 'contracts', icon: 'document-text-outline', label: 'Sözleşmelerim', chevron: true },
  { id: 'reviews', icon: 'star-outline', label: 'Değerlendirmelerim', chevron: true },
  { id: 'favorites', icon: 'heart-outline', label: 'Favorilerim', chevron: true },
  { id: 'notifications', icon: 'notifications-outline', label: 'Bildirim Ayarları', chevron: true },
  { id: 'security', icon: 'shield-outline', label: 'Güvenlik', chevron: true },
  { id: 'payment', icon: 'card-outline', label: 'Ödeme Yöntemleri', chevron: true },
  { id: 'help', icon: 'help-circle-outline', label: 'Yardım & Destek', chevron: true },
  { id: 'about', icon: 'information-circle-outline', label: 'Hakkında', chevron: true },
];

// Business management items for different provider types
const businessManagementItems = [
  { id: 'artistRoster', icon: 'musical-notes', label: 'Sanatçı Kadrosu', description: 'Booking sağlayıcıları için', gradient: ['#9333EA', '#C084FC'] },
  { id: 'equipment', icon: 'hardware-chip', label: 'Ekipman Envanteri', description: 'Teknik firmalar için', gradient: ['#3B82F6', '#60A5FA'] },
  { id: 'menu', icon: 'restaurant', label: 'Menü Yönetimi', description: 'Catering firmaları için', gradient: ['#F59E0B', '#FBBF24'] },
  { id: 'fleet', icon: 'car', label: 'Filo Yönetimi', description: 'Ulaşım firmaları için', gradient: ['#10B981', '#34D399'] },
  { id: 'personnel', icon: 'shield-checkmark', label: 'Personel Yönetimi', description: 'Güvenlik firmaları için', gradient: ['#EF4444', '#F87171'] },
];

export function ProfileScreen({ isProviderMode, onToggleMode, onLogout }: ProfileScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { canSwitchMode } = useApp();
  const menuItems = isProviderMode ? providerMenuItems : organizerMenuItems;

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'account':
        navigation.navigate('EditProfile');
        break;
      case 'team':
        navigation.navigate('Team');
        break;
      case 'services':
        navigation.navigate('ProviderServices');
        break;
      case 'contracts':
        navigation.navigate('Contracts');
        break;
      case 'reviews':
        navigation.navigate('MyReviews');
        break;
      case 'favorites':
        navigation.navigate('Favorites');
        break;
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'security':
        navigation.navigate('Security');
        break;
      case 'payment':
        navigation.navigate('PaymentMethods');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      case 'about':
        navigation.navigate('About');
        break;
    }
  };

  const handleBusinessManagementPress = (itemId: string) => {
    switch (itemId) {
      case 'artistRoster':
        navigation.navigate('ArtistRoster');
        break;
      case 'equipment':
        navigation.navigate('EquipmentInventory');
        break;
      case 'menu':
        navigation.navigate('MenuManagement');
        break;
      case 'fleet':
        navigation.navigate('FleetManagement');
        break;
      case 'personnel':
        navigation.navigate('PersonnelManagement');
        break;
    }
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    profileCard: {
      marginHorizontal: 20,
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      ...(isDark ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    profileEmail: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    editAvatarButton: {
      position: 'absolute' as const,
      bottom: -4,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: isDark ? colors.zinc[700] : colors.zinc[200],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 2,
      borderColor: colors.background,
    },
    modeCard: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginHorizontal: 20,
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...(isDark ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    modeLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
    },
    modeDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statCard: {
      flex: 1,
      alignItems: 'center' as const,
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...(isDark ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
    menuSection: {
      marginHorizontal: 20,
      marginTop: 24,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden' as const,
      ...(isDark ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    menuItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: 12,
    },
    menuLabel: {
      fontSize: 14,
      color: colors.text,
    },
    logoutButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      marginHorizontal: 20,
      marginTop: 24,
      paddingVertical: 14,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    versionText: {
      textAlign: 'center' as const,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 20,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={dynamicStyles.headerTitle}>Profil</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <TouchableOpacity style={dynamicStyles.profileCard} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={dynamicStyles.editAvatarButton}>
                <Ionicons name="camera" size={14} color={isDark ? 'white' : colors.text} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={dynamicStyles.profileName}>{userProfile.name}</Text>
              <Text style={dynamicStyles.profileEmail}>{userProfile.email}</Text>
              {userProfile.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={[styles.verifiedText, { color: colors.success }]}>Doğrulanmış</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Mode Switch - Only show if user has dual access */}
        {/* Debug: Always show for now, canSwitchMode = {canSwitchMode} */}
        {true && (
          <View style={dynamicStyles.modeCard}>
            <View style={styles.modeInfo}>
              <View style={[
                styles.modeIcon,
                isProviderMode
                  ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.15)', borderWidth: isDark ? 0 : 1, borderColor: 'rgba(16, 185, 129, 0.25)' }
                  : { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.15)', borderWidth: isDark ? 0 : 1, borderColor: 'rgba(147, 51, 234, 0.25)' }
              ]}>
                <Ionicons
                  name={isProviderMode ? 'musical-notes' : 'people'}
                  size={20}
                  color={isProviderMode ? colors.success : colors.brand[400]}
                />
              </View>
              <View>
                <Text style={dynamicStyles.modeLabel}>
                  {isProviderMode ? 'Sağlayıcı Modu' : 'Organizatör Modu'}
                </Text>
                <Text style={dynamicStyles.modeDescription}>
                  {isProviderMode ? 'Hizmet sunuyorsunuz' : 'Etkinlik düzenliyorsunuz'}
                </Text>
              </View>
            </View>
            <Switch
              value={isProviderMode}
              onValueChange={onToggleMode}
              trackColor={{ false: isDark ? colors.zinc[700] : '#a1a1aa', true: colors.brand[600] }}
              thumbColor={isProviderMode ? '#ffffff' : isDark ? colors.zinc[400] : '#ffffff'}
              ios_backgroundColor={isDark ? colors.zinc[700] : '#d4d4d8'}
            />
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>{userProfile.stats.totalEvents}</Text>
            <Text style={dynamicStyles.statLabel}>Etkinlik</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>{userProfile.stats.totalOffers}</Text>
            <Text style={dynamicStyles.statLabel}>Teklif</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={dynamicStyles.statNumber}>{userProfile.stats.rating}</Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Puan</Text>
          </View>
        </View>

        {/* Business Management Section - Only for providers */}
        {isProviderMode && (
          <View style={styles.businessSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>İşletme Yönetimi</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessScrollContent}
            >
              {businessManagementItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.businessCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleBusinessManagementPress(item.id)}
                >
                  <LinearGradient
                    colors={item.gradient as [string, string]}
                    style={styles.businessIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={item.icon as any} size={22} color="white" />
                  </LinearGradient>
                  <Text style={[styles.businessCardLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.businessCardDesc, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu Items */}
        <View style={dynamicStyles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                dynamicStyles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <View style={dynamicStyles.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                </View>
                <Text style={dynamicStyles.menuLabel}>{item.label}</Text>
              </View>
              {item.chevron && (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={dynamicStyles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={dynamicStyles.versionText}>Turing v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  businessSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  businessScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  businessCard: {
    width: 130,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  businessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  businessCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  businessCardDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
});

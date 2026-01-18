import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, LayoutAnimation, Platform, UIManager, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollHeader, LargeTitle } from '../components/navigation';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { userProfile } from '../data/mockData';
import { useApp } from '../../App';
import { isOrganizerStats, isProviderStats } from '../types';
import { scrollToTopEmitter } from '../utils/scrollToTop';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  { id: 'artistRoster', icon: 'musical-notes', label: 'Sanatçı Kadrosu', description: 'Booking sağlayıcıları için', gradient: ['#4b30b8', '#C084FC'], requiredService: 'booking' },
  { id: 'equipment', icon: 'hardware-chip', label: 'Ekipman Envanteri', description: 'Teknik firmalar için', gradient: ['#3B82F6', '#60A5FA'], requiredService: 'technical' },
  { id: 'menu', icon: 'restaurant', label: 'Menü Yönetimi', description: 'Catering firmaları için', gradient: ['#F59E0B', '#FBBF24'], requiredService: 'catering' },
  { id: 'fleet', icon: 'car', label: 'Filo Yönetimi', description: 'Ulaşım firmaları için', gradient: ['#10B981', '#34D399'], requiredService: 'transport' },
  { id: 'personnel', icon: 'shield-checkmark', label: 'Personel Yönetimi', description: 'Güvenlik firmaları için', gradient: ['#EF4444', '#F87171'], requiredService: 'security' },
];

export function ProfileScreen({ isProviderMode, onToggleMode, onLogout }: ProfileScreenProps) {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { canSwitchMode, providerServices = [], currentAccount } = useApp();
  const insets = useSafeAreaInsets();
  const menuItems = isProviderMode ? providerMenuItems : organizerMenuItems;
  const [isBusinessExpanded, setIsBusinessExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Subscribe to scroll-to-top events
  useEffect(() => {
    const unsubscribe = scrollToTopEmitter.subscribe((tabName) => {
      if (tabName === 'ProfileTab') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Use currentAccount data if available, otherwise fallback to userProfile
  const profile = currentAccount?.profile || userProfile;

  // Filter business management items based on provider's active services
  const filteredBusinessItems = useMemo(() => {
    if (!providerServices || providerServices.length === 0) {
      return businessManagementItems; // Show all if no services defined yet
    }
    return businessManagementItems.filter(item =>
      providerServices.includes(item.requiredService)
    );
  }, [providerServices]);

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

  const toggleBusinessSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsBusinessExpanded(!isBusinessExpanded);
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
    companyCard: {
      marginHorizontal: 20,
      marginTop: 16,
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
    companyName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
    },
    companyRating: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    companyCategory: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    companyEditHintText: {
      flex: 1,
      fontSize: 13,
      color: colors.textMuted,
      marginLeft: 8,
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
    <View style={dynamicStyles.container}>
      {/* Animated Scroll Header */}
      <ScrollHeader
        title="Profil"
        scrollY={scrollY}
        threshold={60}
        showBackButton={true}
        rightAction={
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Ayarlar"
            accessibilityHint="Ayarlar ekranını aç"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            progressViewOffset={insets.top + 44}
          />
        }
      >
        {/* Large Title */}
        <LargeTitle title="Profil" />

        {/* Profile Card */}
        <TouchableOpacity
          style={dynamicStyles.profileCard}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${profile.name} profili`}
          accessibilityHint="Profili düzenlemek için dokun"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={dynamicStyles.editAvatarButton}>
                <Ionicons name="camera" size={14} color={isDark ? 'white' : colors.text} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={dynamicStyles.profileName}>{profile.name}</Text>
              {profile.company && (
                <Text style={[dynamicStyles.profileEmail, { marginBottom: 2 }]}>{profile.company}</Text>
              )}
              <Text style={dynamicStyles.profileEmail}>{profile.email}</Text>
              {profile.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={[styles.verifiedText, { color: colors.success }]}>Doğrulanmış</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Mode Switch - Only show if user has dual access */}
        {canSwitchMode && (
          <View style={dynamicStyles.modeCard}>
            <View style={styles.modeInfo}>
              <View style={[
                styles.modeIcon,
                isProviderMode
                  ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.15)', borderWidth: isDark ? 0 : 1, borderColor: 'rgba(16, 185, 129, 0.25)' }
                  : { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.15)', borderWidth: isDark ? 0 : 1, borderColor: 'rgba(75, 48, 184, 0.25)' }
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

        {/* Company Profile Card */}
        <TouchableOpacity
          style={dynamicStyles.companyCard}
          onPress={() => navigation.navigate('EditCompanyProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.companyCardContent}>
            <Image
              source={{ uri: isProviderMode
                ? 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
              }}
              style={styles.companyLogo}
            />
            <View style={styles.companyInfo}>
              <Text style={dynamicStyles.companyName}>
                {isProviderMode ? 'EventPro 360' : 'Stellar Events'}
              </Text>
              <View style={styles.companyMeta}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={dynamicStyles.companyRating}>
                  {isProviderMode ? '4.9 (456)' : '4.8 (128)'}
                </Text>
                <View style={[styles.companyDot, { backgroundColor: colors.textMuted }]} />
                <Text style={dynamicStyles.companyCategory}>
                  {isProviderMode ? 'Teknik & Booking' : 'Etkinlik Organizasyonu'}
                </Text>
              </View>
            </View>
            <View style={[styles.companyEditIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="create-outline" size={18} color={colors.brand[400]} />
            </View>
          </View>
          <View style={[styles.companyEditHint, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
            <Ionicons name="business-outline" size={14} color={colors.textMuted} />
            <Text style={dynamicStyles.companyEditHintText}>Şirket profilini düzenle</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>
              {isProviderMode && isProviderStats(profile.stats)
                ? profile.stats.completedJobs
                : isOrganizerStats(profile.stats)
                ? profile.stats.totalEvents
                : 0}
            </Text>
            <Text style={dynamicStyles.statLabel}>
              {isProviderMode ? 'Tamamlanan İş' : 'Etkinlik'}
            </Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>
              {isProviderMode && isProviderStats(profile.stats)
                ? profile.stats.activeJobs
                : isOrganizerStats(profile.stats)
                ? profile.stats.totalOffers
                : 0}
            </Text>
            <Text style={dynamicStyles.statLabel}>
              {isProviderMode ? 'Aktif İş' : 'Teklif'}
            </Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={dynamicStyles.statNumber}>{profile.stats.rating}</Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Puan</Text>
          </View>
        </View>

        {/* Business Management Section - Only for providers with active services */}
        {isProviderMode && filteredBusinessItems.length > 0 && (
          <View style={dynamicStyles.menuSection}>
            {/* Business Management Header (Expandable) */}
            <TouchableOpacity
              style={[
                dynamicStyles.menuItem,
                styles.menuItemFirst,
                !isBusinessExpanded && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={toggleBusinessSection}
            >
              <View style={styles.menuItemLeft}>
                <View style={dynamicStyles.menuIcon}>
                  <Ionicons name="briefcase-outline" size={20} color={colors.brand[400]} />
                </View>
                <Text style={[dynamicStyles.menuLabel, { fontWeight: '600' }]}>İşletme Yönetimi</Text>
              </View>
              <Ionicons
                name={isBusinessExpanded ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Expanded Business Items */}
            {isBusinessExpanded && filteredBusinessItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  dynamicStyles.menuItem,
                  styles.businessSubItem,
                  index === filteredBusinessItems.length - 1 && styles.menuItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => handleBusinessManagementPress(item.id)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[dynamicStyles.menuIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.12)' : 'rgba(75, 48, 184, 0.08)' }]}>
                    <Ionicons name={item.icon as any} size={18} color={colors.brand[400]} />
                  </View>
                  <View>
                    <Text style={dynamicStyles.menuLabel}>{item.label}</Text>
                    <Text style={[styles.businessSubItemDesc, { color: colors.textMuted }]}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
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
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  companyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  companyDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  companyEditIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyEditHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
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
  businessSubItem: {
    paddingLeft: 24,
  },
  businessSubItemDesc: {
    fontSize: 11,
    marginTop: 2,
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

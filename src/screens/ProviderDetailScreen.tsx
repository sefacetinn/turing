import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const { width } = Dimensions.get('window');

const HEADER_HEIGHT = 100;
const SCROLL_THRESHOLD = 200;
const TAB_BAR_HEIGHT = 60;

// Firebase user type
interface FirebaseProvider {
  id: string;
  displayName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  photoURL?: string;
  userPhotoURL?: string;
  coverImage?: string;
  bio?: string;
  city?: string;
  website?: string;
  role?: string;
  userType?: string;
  isVerified?: boolean;
  isOrganizer?: boolean;
  isProvider?: boolean;
  createdAt?: any;
  // Provider specific
  providerServices?: string[];
  specialties?: string[];
  priceRange?: string;
  yearsExperience?: number;
  // Social media
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

export function ProviderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { providerId } = (route.params as { providerId: string }) || { providerId: '' };
  const { colors, isDark, helpers } = useTheme();
  const insets = useSafeAreaInsets();

  const [provider, setProvider] = useState<FirebaseProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [completedOffers, setCompletedOffers] = useState(0);

  // Fetch provider data from Firebase
  const fetchProvider = useCallback(async () => {
    if (!providerId) {
      setError('Kullanıcı ID\'si bulunamadı');
      setLoading(false);
      return;
    }

    try {
      console.log('[ProviderDetailScreen] Fetching user:', providerId);
      const userDoc = await getDoc(doc(db, 'users', providerId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('[ProviderDetailScreen] User data found:', userData.displayName || userData.companyName);
        setProvider({
          id: userDoc.id,
          ...userData,
        } as FirebaseProvider);
        setError(null);

        // Fetch completed offers count
        try {
          const offersQuery = query(
            collection(db, 'offers'),
            where('providerId', '==', providerId),
            where('status', '==', 'accepted')
          );
          const offersSnapshot = await getDocs(offersQuery);
          setCompletedOffers(offersSnapshot.size);
        } catch (e) {
          console.log('Could not fetch offers count:', e);
        }
      } else {
        console.log('[ProviderDetailScreen] User not found:', providerId);
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      console.warn('[ProviderDetailScreen] Error fetching user:', err);
      setError('Profil yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProvider();
    setRefreshing(false);
  }, [fetchProvider]);

  // Animated scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header background style
  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Animated header title style
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD - 30, SCROLL_THRESHOLD + 20],
      [10, 0],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  const handleCall = () => {
    if (!provider?.phone && !provider?.phoneNumber) {
      Alert.alert('Telefon Yok', 'Bu kullanıcının telefon numarası kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = provider.phone || provider.phoneNumber;
    Alert.alert(
      'Ara',
      `${displayName} ile iletişime geçmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ara',
          onPress: () => Linking.openURL(`tel:${phone}`),
        },
      ]
    );
  };

  const handleMessage = () => {
    if (!provider) return;
    navigation.navigate('Chat', {
      providerId: provider.id,
      providerName: displayName,
      providerImage: profileImage,
    });
  };

  const handleRequestOffer = () => {
    if (!provider) return;
    navigation.navigate('CategoryRequest', {
      category: provider.providerServices?.[0] || 'booking',
      provider: {
        id: provider.id,
        name: displayName,
        rating: 0,
        image: profileImage,
      }
    });
  };

  const handleEmail = () => {
    if (!provider?.email) {
      Alert.alert('E-posta Yok', 'Bu kullanıcının e-posta adresi kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${provider.email}`);
  };

  const handleWebsite = () => {
    if (!provider?.website) {
      Alert.alert('Website Yok', 'Bu kullanıcının website adresi kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = provider.website.startsWith('http') ? provider.website : `https://${provider.website}`;
    Linking.openURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Profil yükleniyor...</Text>
      </View>
    );
  }

  // Error state
  if (error || !provider) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorHeader, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="person-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Profil Bulunamadı</Text>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>{error || 'Bu kullanıcı mevcut değil veya silinmiş olabilir.'}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.brand[500] }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Get display values with fallbacks
  const displayName = provider.displayName || provider.companyName || 'İsimsiz Kullanıcı';
  const profileImage = provider.userPhotoURL || provider.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=6366F1&color=fff&size=200';
  const coverImage = provider.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
  const location = provider.city || 'Türkiye';
  const bio = provider.bio || 'Bu kullanıcı henüz bir açıklama eklememiş.';
  const services = provider.providerServices || [];
  const specialties = provider.specialties || [];
  const memberSince = provider.createdAt ? new Date(provider.createdAt.toDate?.() || provider.createdAt).getFullYear() : '-';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header Background */}
      <Animated.View style={[styles.animatedHeaderBg, { paddingTop: insets.top }, headerBgStyle]}>
        <BlurView intensity={isDark ? 60 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.7)' : 'rgba(255, 255, 255, 0.8)' }]} />
      </Animated.View>

      {/* Header - Floating */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Animated Title */}
        <Animated.Text
          style={[styles.animatedHeaderTitle, { color: colors.text }, headerTitleStyle]}
          numberOfLines={1}
        >
          {displayName}
        </Animated.Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsFavorite(!isFavorite);
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <OptimizedImage source={coverImage} style={styles.heroImage} priority="high" />
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', colors.background]}
            style={styles.heroGradient}
          />
          {/* Provider Badge on Hero */}
          <View style={styles.heroBadge}>
            <OptimizedImage source={profileImage} style={[styles.heroAvatar, { borderColor: colors.background }]} priority="high" />
            {provider.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.brand[500], borderColor: colors.background }]}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.providerName, { color: colors.text }]}>{displayName}</Text>
          </View>
          <Text style={[styles.subcategory, { color: colors.textMuted }]}>
            {services.length > 0 ? services[0] : 'Hizmet Sağlayıcı'}
          </Text>

          <View style={styles.quickInfo}>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={14} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>{location}</Text>
            </View>
          </View>

          {/* Price Range */}
          {provider.priceRange && (
            <View style={styles.priceContainer}>
              <LinearGradient
                colors={['rgba(75, 48, 184, 0.15)', 'rgba(75, 48, 184, 0.05)']}
                style={styles.priceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="pricetag" size={18} color={colors.brand[400]} />
                <Text style={[styles.priceText, { color: colors.text }]}>{provider.priceRange}</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={20} color={colors.brand[400]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{completedOffers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tamamlanan İş</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{memberSince}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Üyelik Yılı</Text>
          </View>
          {provider.yearsExperience && (
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={20} color={colors.brand[400]} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{provider.yearsExperience} Yıl</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Deneyim</Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          <Text style={[styles.aboutText, { color: colors.textMuted }]}>{bio}</Text>
        </View>

        {/* Services */}
        {services.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hizmetler</Text>
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <View key={index} style={[styles.serviceItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={[styles.serviceText, { color: colors.text }]}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Uzmanlık Alanları</Text>
            <View style={styles.tagsContainer}>
              {specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={[styles.specialtyText, { color: colors.brand[400] }]}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim</Text>
          <View style={styles.contactGrid}>
            {(provider.phone || provider.phoneNumber) && (
              <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]} onPress={handleCall}>
                <View style={[styles.contactIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="call" size={18} color={colors.success} />
                </View>
                <View style={styles.contactText}>
                  <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Telefon</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>{provider.phone || provider.phoneNumber}</Text>
                </View>
              </TouchableOpacity>
            )}
            {provider.email && (
              <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]} onPress={handleEmail}>
                <View style={[styles.contactIconBg, { backgroundColor: 'rgba(75, 48, 184, 0.15)' }]}>
                  <Ionicons name="mail" size={18} color={colors.brand[400]} />
                </View>
                <View style={styles.contactText}>
                  <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>E-posta</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>{provider.email}</Text>
                </View>
              </TouchableOpacity>
            )}
            {provider.website && (
              <TouchableOpacity style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground }]} onPress={handleWebsite}>
                <View style={[styles.contactIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="globe" size={18} color="#3b82f6" />
                </View>
                <View style={styles.contactText}>
                  <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Website</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>{provider.website}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom spacing for fixed button */}
        <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + 100 }} />
      </Animated.ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 16, backgroundColor: isDark ? 'rgba(9,9,11,0.95)' : 'rgba(255,255,255,0.95)' }]}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.brand[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestOffer}>
          <LinearGradient
            colors={['#4B30B8', '#6366F1']}
            style={styles.primaryBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryBtnText}>Teklif İste</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorHeader: {
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  animatedHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 50,
    zIndex: 10,
    overflow: 'hidden',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  heroBadge: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 24,
    fontWeight: '700',
  },
  subcategory: {
    fontSize: 14,
    marginTop: 4,
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  priceContainer: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  priceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  servicesGrid: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 14,
    flex: 1,
  },
  contactGrid: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  contactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  secondaryBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProviderDetailScreen;

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { OptimizedImage } from '../components/OptimizedImage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useUserEvents, useOrganizerOffers } from '../hooks/useFirestoreData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Firebase user type
interface FirebaseUser {
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
  // Company membership
  primaryCompanyId?: string;
  companyIds?: string[];
  // Social media
  instagram?: string;
  twitter?: string;
  facebook?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

// Company type for display
interface CompanyInfo {
  id: string;
  name: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  city?: string;
  website?: string;
  isVerified?: boolean;
}

type OrganizerProfileParams = {
  organizerId: string;
};

export function OrganizerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: OrganizerProfileParams }, 'params'>>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const organizerId = route.params?.organizerId;

  const [organizer, setOrganizer] = useState<FirebaseUser | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizer's events for stats
  const { events: organizerEvents } = useUserEvents(organizerId);
  const { offers: organizerOffers } = useOrganizerOffers(organizerId);

  // Fetch organizer data from Firebase
  const fetchOrganizer = useCallback(async () => {
    if (!organizerId) {
      setError('Kullanıcı ID\'si bulunamadı');
      setLoading(false);
      return;
    }

    try {
      console.log('[OrganizerProfileScreen] Fetching user:', organizerId);
      const userDoc = await getDoc(doc(db, 'users', organizerId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('[OrganizerProfileScreen] User data found:', userData.displayName || userData.companyName);
        setOrganizer({
          id: userDoc.id,
          ...userData,
        } as FirebaseUser);

        // Fetch company data if user has a primary company
        if (userData.primaryCompanyId) {
          try {
            console.log('[OrganizerProfileScreen] Fetching company:', userData.primaryCompanyId);
            const companyDoc = await getDoc(doc(db, 'companies', userData.primaryCompanyId));
            if (companyDoc.exists()) {
              const companyData = companyDoc.data();
              setCompany({
                id: companyDoc.id,
                name: companyData.name,
                logo: companyData.logo,
                coverImage: companyData.coverImage,
                description: companyData.description,
                city: companyData.city,
                website: companyData.website,
                isVerified: companyData.isVerified,
              });
              console.log('[OrganizerProfileScreen] Company data found:', companyData.name);
            }
          } catch (companyErr) {
            console.warn('[OrganizerProfileScreen] Error fetching company:', companyErr);
            // Don't fail the whole profile if company fetch fails
          }
        }

        setError(null);
      } else {
        console.log('[OrganizerProfileScreen] User not found:', organizerId);
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      console.warn('[OrganizerProfileScreen] Error fetching user:', err);
      setError('Profil yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    fetchOrganizer();
  }, [fetchOrganizer]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrganizer();
    setRefreshing(false);
  }, [fetchOrganizer]);

  const handleCall = () => {
    if (!organizer?.phone && !organizer?.phoneNumber) {
      Alert.alert('Telefon Yok', 'Bu kullanıcının telefon numarası kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${organizer.phone || organizer.phoneNumber}`);
  };

  const handleEmail = () => {
    if (!organizer?.email) {
      Alert.alert('E-posta Yok', 'Bu kullanıcının e-posta adresi kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`mailto:${organizer.email}`);
  };

  const handleWebsite = () => {
    if (!organizer?.website) {
      Alert.alert('Website Yok', 'Bu kullanıcının website adresi kayıtlı değil.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = organizer.website.startsWith('http') ? organizer.website : `https://${organizer.website}`;
    Linking.openURL(url);
  };

  const handleMessage = () => {
    if (!organizer) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Chat', {
      providerId: organizer.id,
      providerName: organizer.displayName || organizer.companyName || 'Kullanıcı',
      providerImage: organizer.photoURL,
    });
  };

  // Calculate stats from real data
  const stats = {
    totalEvents: organizerEvents.length,
    completedEvents: organizerEvents.filter(e => e.status === 'completed').length,
    activeOffers: organizerOffers.filter(o => o.status === 'pending' || o.status === 'quoted').length,
    memberSince: organizer?.createdAt ? new Date(organizer.createdAt.toDate?.() || organizer.createdAt).getFullYear().toString() : '-',
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
  if (error || !organizer) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

  // Get display values with fallbacks - prefer company info if available
  const hasCompany = !!company;
  const displayName = hasCompany ? company.name : (organizer.displayName || organizer.companyName || 'İsimsiz Kullanıcı');
  const profileImage = hasCompany && company.logo
    ? company.logo
    : (organizer.userPhotoURL || organizer.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=6366F1&color=fff&size=200');
  const coverImage = hasCompany && company.coverImage
    ? company.coverImage
    : (organizer.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800');
  const location = hasCompany && company.city ? company.city : (organizer.city || 'Türkiye');
  const title = organizer.isProvider ? 'Hizmet Sağlayıcı' : 'Etkinlik Organizatörü';
  const bio = hasCompany && company.description
    ? company.description
    : (organizer.bio || 'Bu kullanıcı henüz bir açıklama eklememiş.');
  const isVerified = hasCompany ? company.isVerified : organizer.isVerified;
  const socialMedia = organizer.socialMedia || {
    instagram: organizer.instagram,
    twitter: organizer.twitter,
    facebook: organizer.facebook,
  };
  // User info for subtitle when showing company
  const userName = organizer.displayName || '';
  const userImage = organizer.userPhotoURL || organizer.photoURL;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <OptimizedImage source={coverImage} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
        </View>

        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <View style={styles.profileHeader}>
            <OptimizedImage source={profileImage} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                  </View>
                )}
              </View>
              {hasCompany && userName ? (
                <View style={styles.companyUserRow}>
                  {userImage && (
                    <OptimizedImage source={userImage} style={styles.companyUserImage} />
                  )}
                  <Text style={[styles.companyUserName, { color: colors.textSecondary }]}>{userName}</Text>
                </View>
              ) : (
                <Text style={[styles.profileTitle, { color: colors.textSecondary }]}>{title}</Text>
              )}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.locationText, { color: colors.textMuted }]}>{location}</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalEvents}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>etkinlik</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedEvents}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>tamamlanan</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.memberSince}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>yılından beri</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton]}
              onPress={handleMessage}
            >
              <LinearGradient
                colors={['#4B30B8', '#6366F1']}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="chatbubble" size={18} color="white" />
                <Text style={styles.primaryButtonText}>Mesaj Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={18} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}
              onPress={handleEmail}
            >
              <Ionicons name="mail" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>{bio}</Text>
        </View>

        {/* Stats Grid */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: colors.brand[400] }]}>{stats.totalEvents}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Toplam Etkinlik</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#10B981' }]}>{stats.completedEvents}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Tamamlanan</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#F59E0B' }]}>{stats.activeOffers}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Aktif Teklif</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#3B82F6' }]}>{stats.memberSince}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Üyelik Yılı</Text>
            </View>
          </View>
        </View>

        {/* Recent Events */}
        {organizerEvents.length > 0 && (
          <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Etkinlikler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
              {organizerEvents.slice(0, 5).map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('OrganizerEventDetail', { eventId: event.id })}
                >
                  <OptimizedImage
                    source={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'}
                    style={styles.eventImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.eventGradient}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim</Text>

          {(organizer.phone || organizer.phoneNumber) && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <View style={[styles.contactIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)' }]}>
                <Ionicons name="call-outline" size={18} color="#10B981" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Telefon</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{organizer.phone || organizer.phoneNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {organizer.email && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={[styles.contactIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
                <Ionicons name="mail-outline" size={18} color="#3B82F6" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textMuted }]}>E-posta</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{organizer.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {organizer.website && (
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
              <View style={[styles.contactIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' }]}>
                <Ionicons name="globe-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Website</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{organizer.website}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {!organizer.phone && !organizer.phoneNumber && !organizer.email && !organizer.website && (
            <Text style={[styles.noInfoText, { color: colors.textMuted }]}>İletişim bilgisi eklenmemiş</Text>
          )}
        </View>

        {/* Social Media */}
        {(socialMedia.instagram || socialMedia.twitter || socialMedia.facebook) && (
          <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginBottom: insets.bottom + 20 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
            <View style={styles.socialRow}>
              {socialMedia.instagram && (
                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                  <Ionicons name="logo-instagram" size={22} color="#E4405F" />
                  <Text style={[styles.socialHandle, { color: colors.textSecondary }]}>{socialMedia.instagram}</Text>
                </TouchableOpacity>
              )}
              {socialMedia.twitter && (
                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                  <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
                  <Text style={[styles.socialHandle, { color: colors.textSecondary }]}>{socialMedia.twitter}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
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
  noInfoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  verifiedBadge: {
    marginTop: 2,
  },
  profileTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  companyUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  companyUserImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  companyUserName: {
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsGridItem: {
    width: (SCREEN_WIDTH - 32 - 32 - 10) / 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsGridValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statsGridLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  eventsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  eventCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  eventDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  socialHandle: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default OrganizerProfileScreen;

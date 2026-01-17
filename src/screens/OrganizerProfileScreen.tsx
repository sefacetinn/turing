import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample organizer data
const organizersData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Pasion Türk',
    title: 'Etkinlik Organizasyonu',
    image: 'https://i.pravatar.cc/200?img=68',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    verified: true,
    rating: 4.8,
    reviewCount: 127,
    eventCount: 89,
    memberSince: '2019',
    location: 'İstanbul, Türkiye',
    phone: '+90 532 123 4567',
    email: 'info@pasionturk.com',
    website: 'www.pasionturk.com',
    about: 'Türkiye\'nin önde gelen etkinlik organizasyon şirketlerinden biri. 2019\'dan bu yana konserler, festivaller ve kurumsal etkinlikler düzenliyoruz. Müzik ve eğlence sektöründe güvenilir iş ortağınız.',
    stats: {
      totalEvents: 89,
      thisYear: 24,
      totalArtists: 156,
      totalAttendees: '2.5M+',
    },
    recentEvents: [
      { id: 'e1', title: 'Harbiye Açıkhava - Sıla', date: '20 Ağustos 2026', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400' },
      { id: 'e2', title: 'Zeytinli Rock Festivali', date: '15-17 Temmuz 2026', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400' },
      { id: 'e3', title: 'İstanbul Jazz Festival', date: '1-10 Temmuz 2026', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400' },
    ],
    socialMedia: {
      instagram: '@pasionturk',
      twitter: '@pasionturk',
      facebook: 'PasionTurkEvents',
    },
  },
  '2': {
    id: '2',
    name: 'Live Nation Turkey',
    title: 'Konser & Festival Organizasyonu',
    image: 'https://i.pravatar.cc/200?img=50',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    verified: true,
    rating: 4.9,
    reviewCount: 312,
    eventCount: 245,
    memberSince: '2015',
    location: 'İstanbul, Türkiye',
    phone: '+90 212 555 1234',
    email: 'turkey@livenation.com',
    website: 'www.livenation.com.tr',
    about: 'Dünyanın en büyük canlı eğlence şirketi Live Nation\'ın Türkiye operasyonu. Uluslararası ve yerli sanatçıların konserlerini düzenliyoruz.',
    stats: {
      totalEvents: 245,
      thisYear: 52,
      totalArtists: 420,
      totalAttendees: '8M+',
    },
    recentEvents: [
      { id: 'e1', title: 'Coldplay İstanbul', date: '10 Eylül 2026', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400' },
      { id: 'e2', title: 'Ed Sheeran Concert', date: '5 Ağustos 2026', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400' },
    ],
    socialMedia: {
      instagram: '@livenationtr',
      twitter: '@livenationtr',
      facebook: 'LiveNationTurkey',
    },
  },
};

type OrganizerProfileParams = {
  organizerId: string;
};

export function OrganizerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: OrganizerProfileParams }, 'params'>>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const organizerId = route.params?.organizerId || '1';
  const organizer = organizersData[organizerId] || organizersData['1'];

  const handleCall = () => {
    Linking.openURL(`tel:${organizer.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${organizer.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(`https://${organizer.website}`);
  };

  const handleMessage = () => {
    navigation.navigate('Chat', {
      chatId: `org_${organizer.id}`,
      recipientName: organizer.name
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: organizer.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
        </View>

        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: organizer.image }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: colors.text }]}>{organizer.name}</Text>
                {organizer.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                  </View>
                )}
              </View>
              <Text style={[styles.profileTitle, { color: colors.textSecondary }]}>{organizer.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.locationText, { color: colors.textMuted }]}>{organizer.location}</Text>
              </View>
            </View>
          </View>

          {/* Rating & Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{organizer.rating}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{organizer.reviewCount} değerlendirme</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{organizer.eventCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>etkinlik</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{organizer.memberSince}</Text>
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
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>{organizer.about}</Text>
        </View>

        {/* Stats Grid */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: colors.brand[400] }]}>{organizer.stats.totalEvents}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Toplam Etkinlik</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#10B981' }]}>{organizer.stats.thisYear}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Bu Yıl</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#F59E0B' }]}>{organizer.stats.totalArtists}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Sanatçı</Text>
            </View>
            <View style={[styles.statsGridItem, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
              <Text style={[styles.statsGridValue, { color: '#3B82F6' }]}>{organizer.stats.totalAttendees}</Text>
              <Text style={[styles.statsGridLabel, { color: colors.textMuted }]}>Katılımcı</Text>
            </View>
          </View>
        </View>

        {/* Recent Events */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Etkinlikler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
            {organizer.recentEvents.map((event: any) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <Image source={{ uri: event.image }} style={styles.eventImage} />
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

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İletişim</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <View style={[styles.contactIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)' }]}>
              <Ionicons name="call-outline" size={18} color="#10B981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textMuted }]}>Telefon</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>{organizer.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

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
        </View>

        {/* Social Media */}
        <View style={[styles.section, { backgroundColor: isDark ? '#18181B' : '#FFFFFF', marginBottom: insets.bottom + 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
              <Ionicons name="logo-instagram" size={22} color="#E4405F" />
              <Text style={[styles.socialHandle, { color: colors.textSecondary }]}>{organizer.socialMedia.instagram}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
              <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
              <Text style={[styles.socialHandle, { color: colors.textSecondary }]}>{organizer.socialMedia.twitter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
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

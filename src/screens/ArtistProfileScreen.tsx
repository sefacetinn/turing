import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  RefreshControl,
  FlatList,
} from 'react-native';
import { OptimizedImage } from '../components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';
import {
  getArtistById,
  Artist,
  CrewMember,
  crewRoleLabels,
  roleCategoryLabels,
  groupCrewByCategory,
  riderTypeLabels,
  getArtistRiderStatus,
  RoleCategory,
} from '../data/provider/artistData';
import { RiderStatusBadge } from '../components/artist';

const { width } = Dimensions.get('window');

type RouteParams = {
  ArtistProfile: { artistId: string };
};

type ArtistProfileTab = 'general' | 'team' | 'riders' | 'shows';

interface TabItem {
  id: ArtistProfileTab;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'general', label: 'Genel', icon: 'person-outline' },
  { id: 'team', label: 'Ekip', icon: 'people-outline' },
  { id: 'riders', label: "Rider'lar", icon: 'document-text-outline' },
  { id: 'shows', label: 'Gösteriler', icon: 'calendar-outline' },
];

export function ArtistProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ArtistProfile'>>();
  const { colors, isDark } = useTheme();
  const { artistId } = route.params;

  const artist = useMemo(() => getArtistById(artistId), [artistId]);
  const riderStatus = useMemo(() => artist ? getArtistRiderStatus(artist) : null, [artist]);
  const groupedCrew = useMemo<Partial<Record<RoleCategory, CrewMember[]>>>(() => artist ? groupCrewByCategory(artist.crew) : {}, [artist]);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ArtistProfileTab>('general');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Sanatçı bulunamadı</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.errorLink, { color: colors.brand[400] }]}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRequestQuote = () => {
    navigation.navigate('CategoryRequest', {
      category: 'booking',
      provider: {
        id: artist.bookingAgency?.id || 'booking1',
        name: artist.bookingAgency?.name || 'Booking Agency',
        artistId: artist.id,
        artistName: artist.stageName || artist.name,
      },
    });
  };

  const handleContactAgency = () => {
    navigation.navigate('Chat', {
      providerId: artist.bookingAgency?.id || 'booking1',
      providerName: artist.bookingAgency?.name || 'Booking Agency',
      providerImage: artist.bookingAgency?.logo,
    });
  };

  const openSocialMedia = (platform: string, handle?: string) => {
    if (!handle) return;
    let url = '';
    switch (platform) {
      case 'instagram':
        url = `https://instagram.com/${handle.replace('@', '')}`;
        break;
      case 'spotify':
        url = `https://open.spotify.com/artist/${handle}`;
        break;
      case 'youtube':
        url = `https://youtube.com/@${handle}`;
        break;
    }
    if (url) Linking.openURL(url);
  };

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
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
          <OptimizedImage source={artist.coverImage} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />

          {/* Back Button */}
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerActionButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                <Ionicons name="heart-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerActionButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                <Ionicons name="share-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Profile Info on Cover */}
          <View style={styles.profileOverlay}>
            <OptimizedImage source={artist.image} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.artistName}>{artist.stageName || artist.name}</Text>
              <Text style={styles.artistGenre}>{artist.genre.join(' • ')}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>{artist.rating}</Text>
                <Text style={styles.reviewCount}>({artist.reviewCount} değerlendirme)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  isActive && { borderBottomColor: colors.brand[400], borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? colors.brand[400] : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? colors.brand[400] : colors.textMuted },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              {/* Price Range */}
              <View style={[styles.priceCard, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.08)' }]}>
                <View style={styles.priceInfo}>
                  <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Fiyat Aralığı</Text>
                  <Text style={[styles.priceValue, { color: colors.brand[400] }]}>{artist.priceRange}</Text>
                </View>
                <View style={[styles.availabilityBadge, {
                  backgroundColor: artist.availability === 'available' ? 'rgba(16, 185, 129, 0.15)' :
                    artist.availability === 'limited' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                }]}>
                  <View style={[styles.availabilityDot, {
                    backgroundColor: artist.availability === 'available' ? '#10B981' :
                      artist.availability === 'limited' ? '#f59e0b' : '#ef4444'
                  }]} />
                  <Text style={[styles.availabilityText, {
                    color: artist.availability === 'available' ? '#10B981' :
                      artist.availability === 'limited' ? '#f59e0b' : '#ef4444'
                  }]}>
                    {artist.availability === 'available' ? 'Müsait' :
                      artist.availability === 'limited' ? 'Sınırlı' : 'Meşgul'}
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="musical-notes"
                  label="Spotify Dinleyici"
                  value={artist.stats.spotifyMonthly || artist.stats.monthlyListeners}
                  color="#1DB954"
                />
                <StatCard
                  icon="logo-youtube"
                  label="YouTube Abone"
                  value={artist.stats.youtubeSubscribers || '-'}
                  color="#FF0000"
                />
                <StatCard
                  icon="logo-instagram"
                  label="Instagram"
                  value={artist.stats.instagramFollowers || artist.stats.followers}
                  color="#E4405F"
                />
                <StatCard
                  icon="mic"
                  label="Toplam Gösteri"
                  value={artist.stats.totalShows.toString()}
                  color="#8b5cf6"
                />
              </View>

              {/* Total Streams */}
              {artist.stats.totalStreams && (
                <View style={[styles.totalStreamsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                  <Ionicons name="play-circle" size={24} color={colors.brand[400]} />
                  <View style={styles.totalStreamsInfo}>
                    <Text style={[styles.totalStreamsLabel, { color: colors.textMuted }]}>Toplam Dinlenme</Text>
                    <Text style={[styles.totalStreamsValue, { color: colors.text }]}>{artist.stats.totalStreams}</Text>
                  </View>
                </View>
              )}

              {/* Bio */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
              <View style={[styles.bioCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <Text style={[styles.bioText, { color: colors.textSecondary }]}>{artist.bio}</Text>
              </View>

              {/* Social Media */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
              <View style={styles.socialRow}>
                {artist.socialMedia.instagram && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                    onPress={() => openSocialMedia('instagram', artist.socialMedia.instagram)}
                  >
                    <Ionicons name="logo-instagram" size={20} color="white" />
                    <Text style={styles.socialButtonText}>Instagram</Text>
                  </TouchableOpacity>
                )}
                {artist.socialMedia.spotify && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#1DB954' }]}
                    onPress={() => openSocialMedia('spotify', artist.socialMedia.spotify)}
                  >
                    <Ionicons name="musical-notes" size={20} color="white" />
                    <Text style={styles.socialButtonText}>Spotify</Text>
                  </TouchableOpacity>
                )}
                {artist.socialMedia.youtube && (
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
                    onPress={() => openSocialMedia('youtube', artist.socialMedia.youtube)}
                  >
                    <Ionicons name="logo-youtube" size={20} color="white" />
                    <Text style={styles.socialButtonText}>YouTube</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Booking Agency */}
              {artist.bookingAgency && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Yönetimi</Text>
                  <View style={[styles.agencyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
                    {artist.bookingAgency.logo && (
                      <OptimizedImage source={artist.bookingAgency.logo} style={styles.agencyLogo} />
                    )}
                    <View style={styles.agencyInfo}>
                      <Text style={[styles.agencyName, { color: colors.text }]}>{artist.bookingAgency.name}</Text>
                      <Text style={[styles.agencyLabel, { color: colors.textMuted }]}>Resmi Booking Temsilcisi</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.agencyContactButton, { backgroundColor: colors.brand[400] + '20' }]}
                      onPress={handleContactAgency}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={colors.brand[400]} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <>
              {/* Team Management Button */}
              <TouchableOpacity
                style={[styles.manageTeamButton, { backgroundColor: colors.brand[400] }]}
                onPress={() => navigation.navigate('ArtistTeamManagement', { artistId })}
              >
                <Ionicons name="settings-outline" size={20} color="white" />
                <Text style={styles.manageTeamButtonText}>Ekip Yönetimi</Text>
              </TouchableOpacity>

              {/* Crew Summary */}
              <View style={[styles.crewSummary, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <View style={styles.crewSummaryItem}>
                  <Text style={[styles.crewSummaryValue, { color: colors.text }]}>{artist.crew.length}</Text>
                  <Text style={[styles.crewSummaryLabel, { color: colors.textMuted }]}>Toplam Üye</Text>
                </View>
                <View style={[styles.crewSummaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.crewSummaryItem}>
                  <Text style={[styles.crewSummaryValue, { color: colors.text }]}>
                    {artist.crew.filter(c => c.status === 'active').length}
                  </Text>
                  <Text style={[styles.crewSummaryLabel, { color: colors.textMuted }]}>Aktif</Text>
                </View>
              </View>

              {/* Crew by Category */}
              {(Object.keys(groupedCrew) as RoleCategory[]).map((category) => {
                const members = groupedCrew[category];
                if (!members || members.length === 0) return null;
                return (
                  <View key={category} style={styles.crewCategory}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {roleCategoryLabels[category]} ({members.length})
                    </Text>
                    {members.map((member) => (
                      <View
                        key={member.id}
                        style={[styles.crewMemberCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}
                      >
                        <View style={[styles.crewMemberAvatar, { backgroundColor: colors.brand[400] + '20' }]}>
                          <Text style={[styles.crewMemberAvatarText, { color: colors.brand[400] }]}>
                            {member.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.crewMemberInfo}>
                          <Text style={[styles.crewMemberName, { color: colors.text }]}>{member.name}</Text>
                          <Text style={[styles.crewMemberRole, { color: colors.textMuted }]}>
                            {crewRoleLabels[member.role]}
                          </Text>
                        </View>
                        <View style={[styles.crewMemberFee, { backgroundColor: colors.success + '15' }]}>
                          <Text style={[styles.crewMemberFeeText, { color: colors.success }]}>
                            ₺{member.defaultFee.toLocaleString('tr-TR')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </>
          )}

          {/* RIDERS TAB */}
          {activeTab === 'riders' && (
            <>
              {/* Rider Completion Status */}
              {riderStatus && (
                <View style={[styles.riderStatusCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                  <View style={styles.riderStatusHeader}>
                    <Text style={[styles.riderStatusTitle, { color: colors.text }]}>Rider Durumu</Text>
                    <View style={[styles.riderCompletionBadge, { backgroundColor: colors.brand[400] + '20' }]}>
                      <Text style={[styles.riderCompletionText, { color: colors.brand[400] }]}>
                        %{riderStatus.completionRate} Tamamlandı
                      </Text>
                    </View>
                  </View>
                  <View style={styles.riderStatusGrid}>
                    <RiderStatusBadge type="technical" isComplete={riderStatus.technical} />
                    <RiderStatusBadge type="transport" isComplete={riderStatus.transport} />
                    <RiderStatusBadge type="accommodation" isComplete={riderStatus.accommodation} />
                    <RiderStatusBadge type="backstage" isComplete={riderStatus.backstage} />
                  </View>
                </View>
              )}

              {/* Rider Documents */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Rider Dokümanları</Text>
              {artist.riderDocuments.length > 0 ? (
                artist.riderDocuments.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={[styles.documentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}
                  >
                    <View style={[styles.documentIcon, { backgroundColor: colors.brand[400] + '15' }]}>
                      <Ionicons name="document-text" size={24} color={colors.brand[400]} />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={[styles.documentName, { color: colors.text }]} numberOfLines={1}>
                        {doc.fileName}
                      </Text>
                      <Text style={[styles.documentMeta, { color: colors.textMuted }]}>
                        {riderTypeLabels[doc.type]} • v{doc.version} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                  <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                    Henüz rider dokümanı yüklenmemiş
                  </Text>
                </View>
              )}
            </>
          )}

          {/* SHOWS TAB */}
          {activeTab === 'shows' && (
            <>
              {/* Upcoming Shows */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Yaklaşan Gösteriler ({artist.upcomingShows.length})
              </Text>
              {artist.upcomingShows.length > 0 ? (
                artist.upcomingShows.map((show) => (
                  <View
                    key={show.id}
                    style={[styles.showCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}
                  >
                    <View style={styles.showDate}>
                      <Text style={[styles.showDateText, { color: colors.brand[400] }]}>{show.date}</Text>
                    </View>
                    <View style={styles.showInfo}>
                      <Text style={[styles.showName, { color: colors.text }]}>{show.eventName}</Text>
                      <Text style={[styles.showVenue, { color: colors.textMuted }]}>
                        {show.venue} • {show.city}
                      </Text>
                    </View>
                    <View style={[
                      styles.showStatusBadge,
                      {
                        backgroundColor: show.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' :
                          show.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'
                      }
                    ]}>
                      <Text style={[
                        styles.showStatusText,
                        {
                          color: show.status === 'confirmed' ? '#10B981' :
                            show.status === 'pending' ? '#f59e0b' : '#ef4444'
                        }
                      ]}>
                        {show.status === 'confirmed' ? 'Onaylı' :
                          show.status === 'pending' ? 'Bekliyor' : 'İptal'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                  <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                    Yaklaşan gösteri bulunmuyor
                  </Text>
                </View>
              )}

              {/* Past Shows */}
              {artist.pastShows.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                    Geçmiş Gösteriler ({artist.pastShows.length})
                  </Text>
                  {artist.pastShows.map((show) => (
                    <View
                      key={show.id}
                      style={[styles.showCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border, opacity: 0.7 }]}
                    >
                      <View style={styles.showDate}>
                        <Text style={[styles.showDateText, { color: colors.textMuted }]}>{show.date}</Text>
                      </View>
                      <View style={styles.showInfo}>
                        <Text style={[styles.showName, { color: colors.text }]}>{show.eventName}</Text>
                        <Text style={[styles.showVenue, { color: colors.textMuted }]}>
                          {show.venue} • {show.city}
                        </Text>
                      </View>
                      <View style={[styles.showStatusBadge, { backgroundColor: 'rgba(107, 114, 128, 0.15)' }]}>
                        <Text style={[styles.showStatusText, { color: '#6B7280' }]}>Tamamlandı</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}

          {/* Spacer for bottom button */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.brand[400] }]}
          onPress={handleContactAgency}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.brand[400]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callButton, { borderColor: colors.success }]}
        >
          <Ionicons name="call-outline" size={20} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestQuote}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.requestButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.requestButtonText}>Teklif İste</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorLink: {
    fontSize: 16,
    fontWeight: '500',
  },
  coverContainer: {
    height: 320,
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
    height: 200,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  artistGenre: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
  },
  reviewCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  priceInfo: {},
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  totalStreamsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  totalStreamsInfo: {
    flex: 1,
  },
  totalStreamsLabel: {
    fontSize: 12,
  },
  totalStreamsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  bioCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  agencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  agencyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  agencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  agencyLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  agencyContactButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    gap: 10,
  },
  contactButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  requestButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Team Tab Styles
  manageTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  manageTeamButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  crewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  crewSummaryItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  crewSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  crewSummaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  crewSummaryDivider: {
    width: 1,
    height: 40,
  },
  crewCategory: {
    marginBottom: 8,
  },
  crewMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  crewMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewMemberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  crewMemberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  crewMemberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  crewMemberRole: {
    fontSize: 13,
    marginTop: 2,
  },
  crewMemberFee: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  crewMemberFeeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Riders Tab Styles
  riderStatusCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  riderStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riderStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  riderCompletionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riderCompletionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  riderStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  // Shows Tab Styles
  showCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  showDate: {
    marginRight: 12,
  },
  showDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  showInfo: {
    flex: 1,
  },
  showName: {
    fontSize: 15,
    fontWeight: '600',
  },
  showVenue: {
    fontSize: 13,
    marginTop: 2,
  },
  showStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  showStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});

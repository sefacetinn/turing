import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  Artist,
  getArtistById,
  getArtistRiderStatus,
  getArtistContracts,
  crewRoleLabels,
  riderTypeLabels,
} from '../../../data/provider/artistData';
import { RiderCard, CrewMemberItem, RiderStatusBadge } from '../../../components/artist';

type TabType = 'general' | 'crew' | 'riders' | 'shows' | 'contracts';

type RouteParams = {
  ArtistDetailManage: { artistId: string };
};

export function ArtistDetailManageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ArtistDetailManage'>>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const artistId = route.params?.artistId;
  const artist = useMemo(() => getArtistById(artistId), [artistId]);
  const riderStatus = useMemo(
    () => (artist ? getArtistRiderStatus(artist) : null),
    [artist]
  );
  const contracts = useMemo(
    () => (artist ? getArtistContracts(artist.id) : []),
    [artist]
  );

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Sanatci bulunamadi
          </Text>
          <TouchableOpacity
            style={[styles.backButtonError, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Geri Don</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'general' as TabType, label: 'Genel', icon: 'person-outline' },
    { key: 'crew' as TabType, label: 'Ekip', icon: 'people-outline' },
    { key: 'riders' as TabType, label: "Rider'lar", icon: 'document-text-outline' },
    { key: 'shows' as TabType, label: 'Gosteriler', icon: 'calendar-outline' },
    { key: 'contracts' as TabType, label: 'Sozlesmeler', icon: 'document-outline' },
  ];

  const handleSocialLink = (type: string, handle?: string) => {
    if (!handle) return;
    let url = '';
    switch (type) {
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

  const getStatusColor = () => {
    switch (artist.status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#9CA3AF';
      case 'on_tour':
        return '#6366F1';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (artist.status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'on_tour':
        return 'Turda';
      default:
        return artist.status;
    }
  };

  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      {/* Bio Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Biyografi</Text>
        <Text style={[styles.bioText, { color: colors.textSecondary }]}>{artist.bio}</Text>
      </View>

      {/* Stats Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Istatistikler</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{artist.stats.followers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Takipci</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="headset" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{artist.stats.monthlyListeners}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aylik Dinleyici</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{artist.stats.totalShows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Gosteri</Text>
          </View>
        </View>
      </View>

      {/* Price Range */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fiyat Araligi</Text>
        <Text style={[styles.priceText, { color: colors.text }]}>{artist.priceRange}</Text>
      </View>

      {/* Social Media */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
        <View style={styles.socialLinks}>
          {artist.socialMedia.instagram && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E4405F20' }]}
              onPress={() => handleSocialLink('instagram', artist.socialMedia.instagram)}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={[styles.socialText, { color: '#E4405F' }]}>
                {artist.socialMedia.instagram}
              </Text>
            </TouchableOpacity>
          )}
          {artist.socialMedia.spotify && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DB95420' }]}
              onPress={() => handleSocialLink('spotify', artist.socialMedia.spotify)}
            >
              <Ionicons name="logo-tiktok" size={24} color="#1DB954" />
              <Text style={[styles.socialText, { color: '#1DB954' }]}>Spotify</Text>
            </TouchableOpacity>
          )}
          {artist.socialMedia.youtube && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FF000020' }]}
              onPress={() => handleSocialLink('youtube', artist.socialMedia.youtube)}
            >
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              <Text style={[styles.socialText, { color: '#FF0000' }]}>YouTube</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderCrewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
          Ekip Uyeleri ({artist.crew.length})
        </Text>
        <TouchableOpacity
          style={[styles.addButtonSmall, { backgroundColor: colors.primary + '20' }]}
          onPress={() => navigation.navigate('CrewManagement', { artistId: artist.id })}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Ekle</Text>
        </TouchableOpacity>
      </View>

      {artist.crew.length > 0 ? (
        artist.crew.map((member) => (
          <CrewMemberItem
            key={member.id}
            member={member}
            onEdit={() => navigation.navigate('CrewManagement', { artistId: artist.id, memberId: member.id })}
            onDelete={() => Alert.alert('Sil', `${member.name} silinsin mi?`)}
          />
        ))
      ) : (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Henuz ekip uyesi eklenmemis
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CrewManagement', { artistId: artist.id })}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.emptyAddButtonText}>Ekip Uyesi Ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRidersTab = () => {
    const riderTypes: Array<'technical' | 'transport' | 'accommodation' | 'backstage'> = [
      'technical',
      'transport',
      'accommodation',
      'backstage',
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.riderSummary}>
          <View style={styles.riderSummaryLeft}>
            <Text style={[styles.riderSummaryTitle, { color: colors.text }]}>
              Rider Durumu
            </Text>
            <Text style={[styles.riderSummarySubtitle, { color: colors.textSecondary }]}>
              {riderStatus?.completionRate}% tamamlandi
            </Text>
          </View>
          <View style={styles.riderBadgesRow}>
            {riderTypes.map((type) => (
              <RiderStatusBadge
                key={type}
                type={type}
                isComplete={riderStatus?.[type] || false}
                showLabel={false}
                size="medium"
              />
            ))}
          </View>
        </View>

        {riderTypes.map((type) => {
          const rider = artist.riders[type];
          const document = artist.riderDocuments.find((d) => d.type === type);

          return (
            <RiderCard
              key={type}
              type={type}
              rider={rider}
              document={document}
              onPress={() => navigation.navigate('EditRider', { artistId: artist.id, riderType: type })}
              onEdit={() => navigation.navigate('EditRider', { artistId: artist.id, riderType: type })}
            />
          );
        })}
      </View>
    );
  };

  const renderShowsTab = () => (
    <View style={styles.tabContent}>
      {/* Upcoming Shows */}
      <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 12 }]}>
        Yaklasan Gosteriler ({artist.upcomingShows.length})
      </Text>
      {artist.upcomingShows.length > 0 ? (
        artist.upcomingShows.map((show) => (
          <View
            key={show.id}
            style={[styles.showCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.showHeader}>
              <View
                style={[
                  styles.showStatusBadge,
                  {
                    backgroundColor:
                      show.status === 'confirmed' ? '#10B98120' : '#F59E0B20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.showStatusText,
                    { color: show.status === 'confirmed' ? '#10B981' : '#F59E0B' },
                  ]}
                >
                  {show.status === 'confirmed' ? 'Onaylandi' : 'Bekliyor'}
                </Text>
              </View>
              <Text style={[styles.showFee, { color: colors.text }]}>
                {show.fee.toLocaleString('tr-TR')} TL
              </Text>
            </View>
            <Text style={[styles.showName, { color: colors.text }]}>{show.eventName}</Text>
            <View style={styles.showDetails}>
              <View style={styles.showDetailItem}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.showDetailText, { color: colors.textSecondary }]}>
                  {show.venue}, {show.city}
                </Text>
              </View>
              <View style={styles.showDetailItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.showDetailText, { color: colors.textSecondary }]}>
                  {show.date}
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Yaklasan gosteri yok
          </Text>
        </View>
      )}

      {/* Past Shows */}
      {artist.pastShows.length > 0 && (
        <>
          <Text
            style={[styles.sectionHeaderTitle, { color: colors.text, marginTop: 24, marginBottom: 12 }]}
          >
            Gecmis Gosteriler ({artist.pastShows.length})
          </Text>
          {artist.pastShows.map((show) => (
            <View
              key={show.id}
              style={[
                styles.showCard,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.7 },
              ]}
            >
              <Text style={[styles.showName, { color: colors.text }]}>{show.eventName}</Text>
              <View style={styles.showDetails}>
                <View style={styles.showDetailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.showDetailText, { color: colors.textSecondary }]}>
                    {show.venue}, {show.city}
                  </Text>
                </View>
                <View style={styles.showDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.showDetailText, { color: colors.textSecondary }]}>
                    {show.date}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderContractsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 12 }]}>
        Sozlesmeler ({contracts.length})
      </Text>
      {contracts.length > 0 ? (
        contracts.map((contract) => {
          const getContractStatusInfo = () => {
            switch (contract.status) {
              case 'draft':
                return { label: 'Taslak', color: '#9CA3AF' };
              case 'sent':
                return { label: 'Gonderildi', color: '#F59E0B' };
              case 'signed':
                return { label: 'Imzalandi', color: '#10B981' };
              case 'completed':
                return { label: 'Tamamlandi', color: '#6366F1' };
              default:
                return { label: contract.status, color: colors.textSecondary };
            }
          };

          const statusInfo = getContractStatusInfo();

          return (
            <View
              key={contract.id}
              style={[styles.contractCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.contractHeader}>
                <View
                  style={[styles.contractStatusBadge, { backgroundColor: statusInfo.color + '20' }]}
                >
                  <Text style={[styles.contractStatusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
                <Text style={[styles.contractFee, { color: colors.text }]}>
                  {contract.fee.toLocaleString('tr-TR')} TL
                </Text>
              </View>
              <Text style={[styles.contractName, { color: colors.text }]}>{contract.eventName}</Text>
              <View style={styles.contractDetails}>
                <View style={styles.contractDetailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.contractDetailText, { color: colors.textSecondary }]}>
                    {contract.venue}
                  </Text>
                </View>
                <View style={styles.contractDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.contractDetailText, { color: colors.textSecondary }]}>
                    {contract.eventDate}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <Ionicons name="document-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Henuz sozlesme yok
          </Text>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'crew':
        return renderCrewTab();
      case 'riders':
        return renderRidersTab();
      case 'shows':
        return renderShowsTab();
      case 'contracts':
        return renderContractsTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header with Cover Image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: artist.coverImage }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.coverGradient}
        />

        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButtonHeader}
          onPress={() => navigation.navigate('AddEditArtist', { artistId: artist.id })}
        >
          <Ionicons name="create-outline" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.artistInfoOverlay}>
          <Image source={{ uri: artist.image }} style={styles.artistImageLarge} />
          <View style={styles.artistInfoText}>
            <Text style={styles.artistNameLarge}>{artist.stageName || artist.name}</Text>
            {artist.stageName && (
              <Text style={styles.artistRealNameLarge}>{artist.name}</Text>
            )}
            <View style={styles.artistMetaRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{artist.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.genreTextLarge}>{artist.genre.join(' / ')}</Text>
            </View>
            <View
              style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor() + '30' }]}
            >
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusTextLarge, { color: getStatusColor() }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 24 },
  backButtonError: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: 'white', fontWeight: '600' },

  headerContainer: { height: 260, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  backButtonHeader: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonHeader: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInfoOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  artistImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'white',
    marginRight: 16,
  },
  artistInfoText: { flex: 1 },
  artistNameLarge: { fontSize: 24, fontWeight: '700', color: 'white' },
  artistRealNameLarge: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  artistMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: { color: 'white', fontSize: 13, fontWeight: '600' },
  genreTextLarge: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTextLarge: { fontSize: 12, fontWeight: '600' },

  tabBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tabLabel: { fontSize: 14, fontWeight: '500' },

  scrollContent: { flex: 1 },
  tabContent: { padding: 16 },

  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '600' },
  addButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { fontSize: 14, fontWeight: '500' },

  bioText: { fontSize: 14, lineHeight: 22 },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4 },

  priceText: { fontSize: 20, fontWeight: '700' },

  socialLinks: { gap: 10 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
  },
  socialText: { fontSize: 14, fontWeight: '500' },

  riderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
  },
  riderSummaryLeft: {},
  riderSummaryTitle: { fontSize: 16, fontWeight: '600' },
  riderSummarySubtitle: { fontSize: 13, marginTop: 4 },
  riderBadgesRow: { flexDirection: 'row', gap: 6 },

  emptySection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptySectionText: { fontSize: 14, marginTop: 12, marginBottom: 16 },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },

  showCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  showHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  showStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  showStatusText: { fontSize: 12, fontWeight: '600' },
  showFee: { fontSize: 16, fontWeight: '700' },
  showName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  showDetails: { gap: 6 },
  showDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  showDetailText: { fontSize: 13 },

  contractCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contractStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  contractStatusText: { fontSize: 12, fontWeight: '600' },
  contractFee: { fontSize: 16, fontWeight: '700' },
  contractName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  contractDetails: { gap: 6 },
  contractDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contractDetailText: { fontSize: 13 },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { useArtist, useArtistTeam, useArtistRiders, useArtistShows, addArtistTeamMember, removeArtistTeamMember, uploadArtistRider, deleteArtistRider, type ArtistShow } from '../../../hooks';
import { CrewRole, RoleCategory, crewRoleLabels, roleCategoryLabels, roleCategoryIcons, getRolesForCategory } from '../../../data/provider/artistData';

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
  const { artist, loading: artistLoading } = useArtist(artistId);
  const { teamMembers, loading: teamLoading, refetch: refetchTeam } = useArtistTeam(artistId);
  const { riders, loading: ridersLoading, refetch: refetchRiders } = useArtistRiders(artistId);
  const { shows, loading: showsLoading } = useArtistShows(artistId);

  // Team management state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRoleCategory, setMemberRoleCategory] = useState<RoleCategory>('musician');
  const [memberRole, setMemberRole] = useState<CrewRole>('lead_vocal');
  const [memberNote, setMemberNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rider upload state
  const [isUploading, setIsUploading] = useState(false);

  const resetMemberForm = useCallback(() => {
    setMemberName('');
    setMemberEmail('');
    setMemberPhone('');
    setMemberRoleCategory('musician');
    setMemberRole('lead_vocal');
    setMemberNote('');
  }, []);

  const handleAddMember = async () => {
    if (!memberName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Lütfen isim girin');
      return;
    }
    if (!artistId) return;

    setIsSubmitting(true);
    try {
      await addArtistTeamMember(artistId, {
        name: memberName.trim(),
        email: memberEmail.trim() || undefined,
        phone: memberPhone.trim() || undefined,
        role: memberRole,
        roleCategory: memberRoleCategory,
        notes: memberNote.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Ekip üyesi eklendi');
      setShowAddMemberModal(false);
      resetMemberForm();
      refetchTeam();
    } catch (error) {
      console.error('Error adding team member:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Ekip üyesi eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberNameStr: string) => {
    if (!artistId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Ekip Üyesini Kaldır',
      `${memberNameStr} ekipten kaldırılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeArtistTeamMember(artistId, memberId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              refetchTeam();
            } catch (error) {
              console.error('Error removing team member:', error);
              Alert.alert('Hata', 'Ekip üyesi kaldırılamadı');
            }
          },
        },
      ]
    );
  };

  const handleUploadRider = async (type: 'technical' | 'hospitality' | 'general') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      if (!artistId) return;

      setIsUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await uploadArtistRider(artistId, {
        type,
        fileName: file.name,
        fileUri: file.uri,
        fileSize: file.size || 0,
        mimeType: file.mimeType || 'application/pdf',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Rider yüklendi');
      refetchRiders();
    } catch (error) {
      console.error('Error uploading rider:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Rider yüklenemedi');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRider = (riderId: string, riderName: string) => {
    if (!artistId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Rider Sil',
      `"${riderName}" silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArtistRider(artistId, riderId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              refetchRiders();
            } catch (error) {
              console.error('Error deleting rider:', error);
              Alert.alert('Hata', 'Rider silinemedi');
            }
          },
        },
      ]
    );
  };


  if (artistLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.textMuted, marginTop: 16 }]}>
            Yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Sanatçı bulunamadı
          </Text>
          <TouchableOpacity
            style={[styles.backButtonError, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
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
        <Text style={[styles.bioText, { color: colors.textSecondary }]}>{artist.bio || 'Henüz biyografi eklenmemiş'}</Text>
      </View>

      {/* Stats Section */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{artist.rating || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Puan</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{artist.reviewCount || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Değerlendirme</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{shows.length || artist.totalShows || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Gösteri</Text>
          </View>
        </View>
      </View>

      {/* Price Range */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fiyat Araligi</Text>
        <Text style={[styles.priceText, { color: colors.text }]}>{artist.priceRange || 'Belirtilmemiş'}</Text>
      </View>

      {/* Social Media */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
        <View style={styles.socialLinks}>
          {artist.socialMedia?.instagram && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E4405F20' }]}
              onPress={() => handleSocialLink('instagram', artist.socialMedia?.instagram)}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={[styles.socialText, { color: '#E4405F' }]}>
                {artist.socialMedia?.instagram}
              </Text>
            </TouchableOpacity>
          )}
          {artist.socialMedia?.spotify && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DB95420' }]}
              onPress={() => handleSocialLink('spotify', artist.socialMedia?.spotify)}
            >
              <Ionicons name="logo-tiktok" size={24} color="#1DB954" />
              <Text style={[styles.socialText, { color: '#1DB954' }]}>Spotify</Text>
            </TouchableOpacity>
          )}
          {artist.socialMedia?.youtube && (
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FF000020' }]}
              onPress={() => handleSocialLink('youtube', artist.socialMedia?.youtube)}
            >
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
              <Text style={[styles.socialText, { color: '#FF0000' }]}>YouTube</Text>
            </TouchableOpacity>
          )}
          {!artist.socialMedia?.instagram && !artist.socialMedia?.spotify && !artist.socialMedia?.youtube && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Sosyal medya bilgisi eklenmemiş
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderCrewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
          Ekip Üyeleri {teamMembers.length > 0 && `(${teamMembers.length})`}
        </Text>
        <TouchableOpacity
          style={[styles.addButtonSmall, { backgroundColor: colors.brand[400] + '15' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddMemberModal(true);
          }}
        >
          <Ionicons name="add" size={18} color={colors.brand[400]} />
          <Text style={[styles.addButtonText, { color: colors.brand[400] }]}>Ekle</Text>
        </TouchableOpacity>
      </View>

      {teamLoading ? (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.brand[400]} />
          <Text style={[styles.emptySectionText, { color: colors.textMuted, marginTop: 12 }]}>
            Yükleniyor...
          </Text>
        </View>
      ) : teamMembers.length > 0 ? (
        <View style={styles.membersList}>
          {teamMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onLongPress={() => handleRemoveMember(member.id, member.name)}
            >
              <View style={[styles.memberAvatar, { backgroundColor: colors.brand[400] + '20' }]}>
                <Text style={[styles.memberAvatarText, { color: colors.brand[400] }]}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: colors.textMuted }]}>
                  {crewRoleLabels[member.role as CrewRole] || member.role}
                </Text>
                {member.phone && (
                  <View style={styles.memberContactRow}>
                    <Ionicons name="call-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.memberContactText, { color: colors.textMuted }]}>{member.phone}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.memberActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                onPress={() => handleRemoveMember(member.id, member.name)}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Henüz ekip üyesi eklenmemiş
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Sanatçının ekip üyelerini ekleyin
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddButton, { backgroundColor: colors.brand[400], marginTop: 16 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddMemberModal(true);
            }}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.emptyAddButtonText}>Ekip Üyesi Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Team Management Link */}
      {teamMembers.length > 0 && (
        <TouchableOpacity
          style={[styles.fullManageButton, { borderColor: colors.brand[400] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('ArtistTeamManagement', { artistId });
          }}
        >
          <Ionicons name="settings-outline" size={18} color={colors.brand[400]} />
          <Text style={[styles.fullManageText, { color: colors.brand[400] }]}>
            Ekip Yönetimi
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.brand[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const getRiderTypeLabel = (type: string) => {
    switch (type) {
      case 'technical': return 'Teknik Rider';
      case 'hospitality': return 'Hospitality Rider';
      case 'general': return 'Genel Rider';
      default: return type;
    }
  };

  const getRiderTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'technical': return 'hardware-chip-outline';
      case 'hospitality': return 'restaurant-outline';
      case 'general': return 'document-text-outline';
      default: return 'document-outline';
    }
  };

  const getRiderTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return '#6366F1';
      case 'hospitality': return '#EC4899';
      case 'general': return '#10B981';
      default: return colors.brand[400];
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderRidersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
          Rider Dosyaları {riders.length > 0 && `(${riders.length})`}
        </Text>
      </View>

      {/* Upload Buttons */}
      <View style={styles.riderUploadButtons}>
        <TouchableOpacity
          style={[styles.riderUploadButton, { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }]}
          onPress={() => handleUploadRider('technical')}
          disabled={isUploading}
        >
          <Ionicons name="hardware-chip-outline" size={24} color="#6366F1" />
          <Text style={[styles.riderUploadLabel, { color: '#6366F1' }]}>Teknik Rider</Text>
          <Ionicons name="cloud-upload-outline" size={16} color="#6366F1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.riderUploadButton, { backgroundColor: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.3)' }]}
          onPress={() => handleUploadRider('hospitality')}
          disabled={isUploading}
        >
          <Ionicons name="restaurant-outline" size={24} color="#EC4899" />
          <Text style={[styles.riderUploadLabel, { color: '#EC4899' }]}>Hospitality</Text>
          <Ionicons name="cloud-upload-outline" size={16} color="#EC4899" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.riderUploadButton, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}
          onPress={() => handleUploadRider('general')}
          disabled={isUploading}
        >
          <Ionicons name="document-text-outline" size={24} color="#10B981" />
          <Text style={[styles.riderUploadLabel, { color: '#10B981' }]}>Genel Rider</Text>
          <Ionicons name="cloud-upload-outline" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      {isUploading && (
        <View style={[styles.uploadingIndicator, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.brand[400]} />
          <Text style={[styles.uploadingText, { color: colors.textMuted }]}>Yükleniyor...</Text>
        </View>
      )}

      {/* Uploaded Riders List */}
      {ridersLoading ? (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.brand[400]} />
          <Text style={[styles.emptySectionText, { color: colors.textMuted, marginTop: 12 }]}>
            Yükleniyor...
          </Text>
        </View>
      ) : riders.length > 0 ? (
        <View style={styles.ridersList}>
          {riders.map((rider) => (
            <View
              key={rider.id}
              style={[styles.riderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.riderIconBox, { backgroundColor: getRiderTypeColor(rider.type) + '15' }]}>
                <Ionicons name={getRiderTypeIcon(rider.type)} size={22} color={getRiderTypeColor(rider.type)} />
              </View>
              <View style={styles.riderInfo}>
                <Text style={[styles.riderName, { color: colors.text }]} numberOfLines={1}>
                  {rider.fileName}
                </Text>
                <View style={styles.riderMeta}>
                  <Text style={[styles.riderType, { color: getRiderTypeColor(rider.type) }]}>
                    {getRiderTypeLabel(rider.type)}
                  </Text>
                  <Text style={[styles.riderSize, { color: colors.textMuted }]}>
                    • {formatFileSize(rider.fileSize)}
                  </Text>
                </View>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity
                  style={[styles.riderActionBtn, { backgroundColor: colors.brand[400] + '15' }]}
                  onPress={() => {
                    if (rider.url) Linking.openURL(rider.url);
                  }}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.brand[400]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.riderActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                  onPress={() => handleDeleteRider(rider.id, rider.fileName)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
          <Ionicons name="document-text-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
            Henüz rider yüklenmemiş
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            Yukarıdaki butonları kullanarak rider dosyalarınızı yükleyin
          </Text>
        </View>
      )}

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)' }]}>
        <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
        <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
          Yüklediğiniz rider dosyaları, organizatörlerle paylaşılacak ve etkinlik operasyonlarında kullanılacaktır.
        </Text>
      </View>
    </View>
  );

  const renderShowsTab = () => {
    // Separate shows into upcoming and past
    const upcomingShows = shows.filter(s => s.status === 'upcoming');
    const pastShows = shows.filter(s => s.status === 'completed');

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const renderShowCard = (show: ArtistShow) => (
      <TouchableOpacity
        key={show.id}
        style={[styles.showCard, { backgroundColor: colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}
        onPress={() => navigation.navigate('ProviderEventDetail', { eventId: show.eventId })}
        activeOpacity={0.7}
      >
        {/* Event Image */}
        {show.eventImage && (
          <OptimizedImage source={show.eventImage} style={styles.showImage} />
        )}
        <View style={styles.showContent}>
          {/* Status Badge */}
          <View style={[
            styles.showStatusBadge,
            { backgroundColor: show.status === 'upcoming' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)' }
          ]}>
            <Text style={[
              styles.showStatusText,
              { color: show.status === 'upcoming' ? '#10B981' : '#6B7280' }
            ]}>
              {show.status === 'upcoming' ? 'Yaklaşan' : 'Tamamlandı'}
            </Text>
          </View>

          {/* Event Title */}
          <Text style={[styles.showTitle, { color: colors.text }]} numberOfLines={1}>
            {show.eventTitle}
          </Text>

          {/* Date & Time */}
          <View style={styles.showInfoRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.showInfoText, { color: colors.textSecondary }]}>
              {formatDate(show.eventDate)}{show.eventTime ? ` • ${show.eventTime}` : ''}
            </Text>
          </View>

          {/* Venue & City */}
          <View style={styles.showInfoRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.showInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
              {show.venue}{show.city ? `, ${show.city}` : ''}
            </Text>
          </View>

          {/* Organizer */}
          <View style={styles.showInfoRow}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.showInfoText, { color: colors.textSecondary }]}>
              {show.organizerName}
            </Text>
          </View>

          {/* Contract Amount */}
          {show.contractAmount > 0 && (
            <View style={[styles.showAmountContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
              <Text style={styles.showAmountText}>₺{show.contractAmount.toLocaleString('tr-TR')}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );

    if (showsLoading) {
      return (
        <View style={styles.tabContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Stats Summary */}
        <View style={[styles.showsStats, { backgroundColor: colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border }]}>
          <View style={styles.showsStatItem}>
            <Text style={[styles.showsStatValue, { color: colors.text }]}>{shows.length}</Text>
            <Text style={[styles.showsStatLabel, { color: colors.textSecondary }]}>Toplam</Text>
          </View>
          <View style={[styles.showsStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
          <View style={styles.showsStatItem}>
            <Text style={[styles.showsStatValue, { color: '#10B981' }]}>{upcomingShows.length}</Text>
            <Text style={[styles.showsStatLabel, { color: colors.textSecondary }]}>Yaklaşan</Text>
          </View>
          <View style={[styles.showsStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]} />
          <View style={styles.showsStatItem}>
            <Text style={[styles.showsStatValue, { color: colors.textMuted }]}>{pastShows.length}</Text>
            <Text style={[styles.showsStatLabel, { color: colors.textSecondary }]}>Tamamlanan</Text>
          </View>
        </View>

        {shows.length === 0 ? (
          <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
              Henüz gösteri kaydı yok
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Kabul edilen teklifler burada görünecek
            </Text>
          </View>
        ) : (
          <>
            {/* Upcoming Shows */}
            {upcomingShows.length > 0 && (
              <View style={styles.showsSection}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 12 }]}>
                  Yaklaşan Gösteriler ({upcomingShows.length})
                </Text>
                {upcomingShows.map(renderShowCard)}
              </View>
            )}

            {/* Past Shows */}
            {pastShows.length > 0 && (
              <View style={styles.showsSection}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 12, marginTop: upcomingShows.length > 0 ? 16 : 0 }]}>
                  Geçmiş Gösteriler ({pastShows.length})
                </Text>
                {pastShows.map(renderShowCard)}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const renderContractsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionHeaderTitle, { color: colors.text, marginBottom: 16 }]}>
        Sözleşmeler
      </Text>
      <View style={[styles.emptySection, { backgroundColor: colors.surface }]}>
        <Ionicons name="document-outline" size={40} color={colors.textSecondary} />
        <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
          Henüz sözleşme yok
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
          Sözleşme yönetimi yakında eklenecek
        </Text>
      </View>
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
        <OptimizedImage source={artist.coverImage || artist.image || 'https://via.placeholder.com/400x300'} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.coverGradient}
        />

        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButtonHeader}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('AddEditArtist', { artistId: artist.id });
          }}
        >
          <Ionicons name="create-outline" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.artistInfoOverlay}>
          <OptimizedImage source={artist.image || 'https://via.placeholder.com/100x100'} style={styles.artistImageLarge} />
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
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

      {/* Add Team Member Modal */}
      <Modal visible={showAddMemberModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => { setShowAddMemberModal(false); resetMemberForm(); }}>
              <Text style={[styles.modalCancel, { color: colors.brand[400] }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ekip Üyesi Ekle</Text>
            <TouchableOpacity onPress={handleAddMember} disabled={isSubmitting}>
              <Text style={[styles.modalSave, { color: isSubmitting ? colors.textMuted : colors.brand[400] }]}>
                {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>İsim *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={memberName}
                  onChangeText={setMemberName}
                  placeholder="Ahmet Yılmaz"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Role Category */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Kategori *</Text>
                <View style={styles.categoryGrid}>
                  {(Object.keys(roleCategoryLabels) as RoleCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor: memberRoleCategory === cat ? colors.brand[400] + '20' : colors.surface,
                          borderColor: memberRoleCategory === cat ? colors.brand[400] : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setMemberRoleCategory(cat);
                        const roles = getRolesForCategory(cat);
                        if (roles.length > 0) setMemberRole(roles[0]);
                      }}
                    >
                      <Ionicons
                        name={roleCategoryIcons[cat] as any}
                        size={18}
                        color={memberRoleCategory === cat ? colors.brand[400] : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          { color: memberRoleCategory === cat ? colors.brand[400] : colors.textMuted },
                        ]}
                      >
                        {roleCategoryLabels[cat]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Role */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Rol *</Text>
                <View style={styles.roleGrid}>
                  {getRolesForCategory(memberRoleCategory).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: memberRole === role ? colors.brand[400] + '20' : colors.surface,
                          borderColor: memberRole === role ? colors.brand[400] : colors.border,
                        },
                      ]}
                      onPress={() => setMemberRole(role)}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          { color: memberRole === role ? colors.brand[400] : colors.textMuted },
                        ]}
                      >
                        {crewRoleLabels[role]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Contact Info */}
              <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.formSectionTitle, { color: colors.text }]}>İletişim Bilgileri</Text>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Telefon</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={memberPhone}
                    onChangeText={setMemberPhone}
                    placeholder="+90 532 123 4567"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>E-posta</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    placeholder="ornek@email.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Not</Text>
                <TextInput
                  style={[styles.formTextArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={memberNote}
                  onChangeText={setMemberNote}
                  placeholder="Ek bilgiler..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  emptyText: { fontSize: 14, textAlign: 'center' as const },

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
  emptySectionText: { fontSize: 14, marginTop: 12 },
  emptySubtext: { fontSize: 12, marginTop: 4, textAlign: 'center' as const },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },

  // Team Members
  membersList: { gap: 10 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 18, fontWeight: '600' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 15, fontWeight: '600' },
  memberRole: { fontSize: 13, marginTop: 2 },
  memberContactRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  memberContactText: { fontSize: 12 },
  memberActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullManageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  fullManageText: { fontSize: 15, fontWeight: '600' },

  // Riders
  riderUploadButtons: { gap: 10, marginBottom: 20 },
  riderUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  riderUploadLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  uploadingText: { fontSize: 14 },
  ridersList: { gap: 10 },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  riderIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInfo: { flex: 1, marginLeft: 12 },
  riderName: { fontSize: 14, fontWeight: '600' },
  riderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  riderType: { fontSize: 12, fontWeight: '500' },
  riderSize: { fontSize: 12, marginLeft: 4 },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    gap: 10,
  },
  infoBoxText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1 },
  modalContentContainer: { padding: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, marginBottom: 8 },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  formTextArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
  },
  formSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  formSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  categoryOptionText: { fontSize: 13, fontWeight: '500' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleOptionText: { fontSize: 13, fontWeight: '500' },

  showCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  showImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  showContent: {
    flex: 1,
  },
  showStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  showStatusText: { fontSize: 11, fontWeight: '600' },
  showTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  showInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  showInfoText: { fontSize: 12, flex: 1 },
  showAmountContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  showAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  showsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  showsStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  showsStatValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  showsStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  showsStatDivider: {
    width: 1,
    height: 32,
  },
  showsSection: {
    marginBottom: 8,
  },
  showHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
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

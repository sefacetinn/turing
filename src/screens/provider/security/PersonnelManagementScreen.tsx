import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  SecurityPersonnel,
  Shift,
  PersonnelRole,
  mockPersonnel,
  mockShifts,
  mockIncidentReports,
  getPersonnelStats,
  roleDisplayNames,
  getPersonnelDocumentsExpiringSoon,
} from '../../../data/provider/personnelData';

type TabType = 'personnel' | 'shifts' | 'incidents';

const roleIcons: Record<PersonnelRole, string> = {
  security_guard: 'shield',
  bodyguard: 'body',
  supervisor: 'star',
  k9_handler: 'paw',
  vip_protection: 'diamond',
  crowd_control: 'people',
};

const roleColors: Record<PersonnelRole, [string, string]> = {
  security_guard: ['#3B82F6', '#60A5FA'],
  bodyguard: ['#EF4444', '#F87171'],
  supervisor: ['#F59E0B', '#FBBF24'],
  k9_handler: ['#10B981', '#34D399'],
  vip_protection: ['#9333EA', '#C084FC'],
  crowd_control: ['#6366F1', '#818CF8'],
};

export function PersonnelManagementScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('personnel');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = useMemo(() => getPersonnelStats(), []);
  const expiringDocuments = useMemo(() => getPersonnelDocumentsExpiringSoon(), []);

  const filteredPersonnel = useMemo(() => {
    if (!searchQuery) return mockPersonnel;
    const query = searchQuery.toLowerCase();
    return mockPersonnel.filter(p =>
      p.firstName.toLowerCase().includes(query) ||
      p.lastName.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  }, [searchQuery]);

  const getPersonnelStatusInfo = (status: SecurityPersonnel['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Aktif', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'on_duty':
        return { label: 'Gorevde', color: '#3B82F6', icon: 'shield' as const };
      case 'off_duty':
        return { label: 'Izinli', color: '#F59E0B', icon: 'moon' as const };
      case 'on_leave':
        return { label: 'Tatilde', color: '#9333EA', icon: 'airplane' as const };
      case 'terminated':
        return { label: 'Ayrildi', color: '#EF4444', icon: 'close-circle' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const getShiftStatusInfo = (status: Shift['status']) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Planli', color: '#9333EA', icon: 'time' as const };
      case 'in_progress':
        return { label: 'Aktif', color: '#3B82F6', icon: 'shield' as const };
      case 'completed':
        return { label: 'Tamamlandi', color: '#10B981', icon: 'checkmark-circle' as const };
      case 'cancelled':
        return { label: 'Iptal', color: '#EF4444', icon: 'close-circle' as const };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted, icon: 'help-circle' as const };
    }
  };

  const getIncidentTypeInfo = (type: string) => {
    switch (type) {
      case 'minor':
        return { label: 'Kucuk', color: '#F59E0B' };
      case 'major':
        return { label: 'Orta', color: '#EF4444' };
      case 'critical':
        return { label: 'Kritik', color: '#DC2626' };
      default:
        return { label: 'Bilinmiyor', color: colors.textMuted };
    }
  };

  const renderPersonnelCard = (personnel: SecurityPersonnel) => {
    const statusInfo = getPersonnelStatusInfo(personnel.status);
    const roleGradient = roleColors[personnel.role];
    const hasExpiringDoc = personnel.documents.some(d => d.status === 'expiring_soon' || d.status === 'expired');

    return (
      <TouchableOpacity
        key={personnel.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Detay', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.cardHeader}>
          <View style={styles.personnelImageContainer}>
            <Image source={{ uri: personnel.image }} style={styles.personnelImage} />
            <LinearGradient
              colors={roleGradient}
              style={styles.roleBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={roleIcons[personnel.role] as any} size={12} color="white" />
            </LinearGradient>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {personnel.firstName} {personnel.lastName}
            </Text>
            <Text style={[styles.roleText, { color: colors.textMuted }]}>
              {roleDisplayNames[personnel.role]}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{personnel.rating}</Text>
              <Text style={[styles.shiftCount, { color: colors.textMuted }]}>
                ({personnel.completedShifts} vardiya)
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            </View>
            {hasExpiringDoc && (
              <View style={styles.warningBadge}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
              </View>
            )}
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBody}>
          <View style={styles.qualificationsRow}>
            {personnel.qualifications.armedLicense && (
              <View style={[styles.qualBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="flash" size={12} color="#EF4444" />
                <Text style={[styles.qualText, { color: '#EF4444' }]}>Silahli</Text>
              </View>
            )}
            {personnel.qualifications.vipProtection && (
              <View style={[styles.qualBadge, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
                <Ionicons name="diamond" size={12} color="#9333EA" />
                <Text style={[styles.qualText, { color: '#9333EA' }]}>VIP</Text>
              </View>
            )}
            {personnel.qualifications.firstAid && (
              <View style={[styles.qualBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="medkit" size={12} color="#10B981" />
                <Text style={[styles.qualText, { color: '#10B981' }]}>Ilk Yardim</Text>
              </View>
            )}
            {personnel.qualifications.k9Certified && (
              <View style={[styles.qualBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="paw" size={12} color="#3B82F6" />
                <Text style={[styles.qualText, { color: '#3B82F6' }]}>K9</Text>
              </View>
            )}
            {personnel.qualifications.crowdManagement && (
              <View style={[styles.qualBadge, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Ionicons name="people" size={12} color="#6366F1" />
                <Text style={[styles.qualText, { color: '#6366F1' }]}>Kalabalik</Text>
              </View>
            )}
          </View>

          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.contactText, { color: colors.text }]}>{personnel.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.contactText, { color: colors.textMuted }]} numberOfLines={1}>
                {personnel.email}
              </Text>
            </View>
          </View>

          <View style={[styles.physicalInfoRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
            <View style={styles.physicalItem}>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Boy</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{personnel.physicalInfo.height} cm</Text>
            </View>
            <View style={[styles.physicalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.physicalItem}>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Kilo</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{personnel.physicalInfo.weight} kg</Text>
            </View>
            <View style={[styles.physicalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.physicalItem}>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Kan</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{personnel.physicalInfo.bloodType}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderShiftCard = (shift: Shift) => {
    const statusInfo = getShiftStatusInfo(shift.status);
    const assignmentProgress = (shift.personnelAssigned.length / shift.personnelRequired) * 100;

    return (
      <TouchableOpacity
        key={shift.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Detay', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.shiftHeader}>
          <View style={styles.shiftInfo}>
            <Text style={[styles.shiftTitle, { color: colors.text }]}>{shift.eventName}</Text>
            <Text style={[styles.shiftVenue, { color: colors.textMuted }]}>
              {shift.venue}, {shift.city}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={[styles.shiftTimeRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.shiftTimeItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.shiftTimeText, { color: colors.text }]}>{shift.date}</Text>
          </View>
          <View style={styles.shiftTimeItem}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.shiftTimeText, { color: colors.text }]}>
              {shift.startTime} - {shift.endTime}
            </Text>
          </View>
          <View style={styles.shiftTimeItem}>
            <Ionicons name="cash-outline" size={14} color={colors.brand[400]} />
            <Text style={[styles.shiftTimeText, { color: colors.brand[400] }]}>
              {shift.hourlyRate} TL/saat
            </Text>
          </View>
        </View>

        <View style={styles.assignmentSection}>
          <View style={styles.assignmentHeader}>
            <Text style={[styles.assignmentLabel, { color: colors.textMuted }]}>
              Personel Atamasi
            </Text>
            <Text style={[styles.assignmentCount, { color: colors.text }]}>
              {shift.personnelAssigned.length}/{shift.personnelRequired}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${assignmentProgress}%`,
                  backgroundColor: assignmentProgress === 100 ? '#10B981' : colors.brand[400],
                },
              ]}
            />
          </View>

          {shift.personnelAssigned.length > 0 && (
            <View style={styles.assignedPersonnelRow}>
              {shift.personnelAssigned.slice(0, 4).map((assignment, i) => {
                const person = mockPersonnel.find(p => p.id === assignment.personnelId);
                if (!person) return null;
                return (
                  <Image
                    key={i}
                    source={{ uri: person.image }}
                    style={[styles.assignedPersonImage, { marginLeft: i > 0 ? -10 : 0 }]}
                  />
                );
              })}
              {shift.personnelAssigned.length > 4 && (
                <View style={[styles.moreAssigned, { backgroundColor: colors.brand[400] }]}>
                  <Text style={styles.moreAssignedText}>+{shift.personnelAssigned.length - 4}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {shift.briefing && (
          <View style={[styles.briefingRow, { borderTopColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.briefingText, { color: colors.textMuted }]} numberOfLines={2}>
              {shift.briefing}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderIncidentCard = (incident: typeof mockIncidentReports[0]) => {
    const typeInfo = getIncidentTypeInfo(incident.type);

    return (
      <TouchableOpacity
        key={incident.id}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Detay', 'Bu ozellik yakinda aktif olacak.')}
      >
        <View style={styles.incidentHeader}>
          <View style={styles.incidentInfo}>
            <View style={styles.incidentTitleRow}>
              <View style={[styles.typeBadge, { backgroundColor: `${typeInfo.color}20` }]}>
                <Text style={[styles.typeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
              </View>
              <Text style={[styles.incidentCategory, { color: colors.textMuted }]}>
                {incident.category === 'unauthorized_access' ? 'Izinsiz Giris' :
                 incident.category === 'crowd_control' ? 'Kalabalik' :
                 incident.category === 'theft' ? 'Hirsizlik' :
                 incident.category === 'assault' ? 'Saldiri' :
                 incident.category === 'medical' ? 'Saglik' :
                 incident.category === 'property_damage' ? 'Hasar' : 'Diger'}
              </Text>
            </View>
            <Text style={[styles.incidentEvent, { color: colors.text }]}>{incident.eventName}</Text>
          </View>
          <View style={[
            styles.incidentStatus,
            { backgroundColor: incident.status === 'closed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }
          ]}>
            <Text style={[
              styles.incidentStatusText,
              { color: incident.status === 'closed' ? '#10B981' : '#F59E0B' }
            ]}>
              {incident.status === 'closed' ? 'Kapali' :
               incident.status === 'resolved' ? 'Cozuldu' :
               incident.status === 'investigating' ? 'Inceleniyor' : 'Acik'}
            </Text>
          </View>
        </View>

        <Text style={[styles.incidentDescription, { color: colors.text }]} numberOfLines={3}>
          {incident.description}
        </Text>

        <View style={[styles.incidentMeta, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.incidentMetaItem}>
            <Ionicons name="person-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.incidentMetaText, { color: colors.textMuted }]}>{incident.reportedBy}</Text>
          </View>
          <View style={styles.incidentMetaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.incidentMetaText, { color: colors.textMuted }]}>
              {new Date(incident.incidentTime).toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.actionTakenRow, { borderTopColor: colors.border }]}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
          <Text style={[styles.actionTakenText, { color: colors.textMuted }]} numberOfLines={1}>
            {incident.actionTaken}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Personel Yonetimi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {stats.totalPersonnel} personel, {stats.upcomingShifts} planli vardiya
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.1)',
              borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)',
            },
          ]}
          onPress={() => Alert.alert('Detay', 'Bu ozellik yakinda aktif olacak.')}
        >
          <Ionicons name="add" size={22} color={colors.brand[400]} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }]}>
          <Ionicons name="shield" size={18} color="#10B981" />
          <Text style={[styles.statCardValue, { color: '#10B981' }]}>{stats.activePersonnel}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Aktif</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}>
          <Ionicons name="radio" size={18} color="#3B82F6" />
          <Text style={[styles.statCardValue, { color: '#3B82F6' }]}>{stats.onDuty}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Gorevde</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)' }]}>
          <Ionicons name="flash" size={18} color="#EF4444" />
          <Text style={[styles.statCardValue, { color: '#EF4444' }]}>{stats.armedPersonnel}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Silahli</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
          <Ionicons name="warning" size={18} color="#F59E0B" />
          <Text style={[styles.statCardValue, { color: '#F59E0B' }]}>{stats.expiringDocuments}</Text>
          <Text style={[styles.statCardLabel, { color: colors.textMuted }]}>Belge Uyari</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('personnel')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="people"
              size={16}
              color={activeTab === 'personnel' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'personnel' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Personel
            </Text>
          </View>
          {activeTab === 'personnel' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('shifts')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="calendar"
              size={16}
              color={activeTab === 'shifts' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'shifts' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Vardiyalar
            </Text>
          </View>
          {activeTab === 'shifts' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('incidents')}>
          <View style={styles.tabContent}>
            <Ionicons
              name="alert-circle"
              size={16}
              color={activeTab === 'incidents' ? colors.brand[400] : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'incidents' ? colors.brand[400] : colors.textMuted },
              ]}
            >
              Olaylar
            </Text>
            {stats.totalIncidents > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
                <Text style={[styles.tabBadgeText, { color: '#EF4444' }]}>{stats.totalIncidents}</Text>
              </View>
            )}
          </View>
          {activeTab === 'incidents' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={
              activeTab === 'personnel'
                ? 'Personel ara...'
                : activeTab === 'shifts'
                ? 'Vardiya ara...'
                : 'Olay ara...'
            }
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[400]} />}
      >
        {activeTab === 'personnel' && (
          filteredPersonnel.length > 0 ? (
            filteredPersonnel.map(renderPersonnelCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Personel bulunamadi</Text>
            </View>
          )
        )}

        {activeTab === 'shifts' && (
          mockShifts.length > 0 ? (
            mockShifts.map(renderShiftCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Vardiya bulunamadi</Text>
            </View>
          )
        )}

        {activeTab === 'incidents' && (
          mockIncidentReports.length > 0 ? (
            mockIncidentReports.map(renderIncidentCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Olay raporu bulunamadi</Text>
            </View>
          )
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 2,
  },
  statCardValue: { fontSize: 16, fontWeight: '700' },
  statCardLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: { fontSize: 13, fontWeight: '500' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tabBadgeText: { fontSize: 10, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  contentList: { flex: 1 },
  contentListContainer: { paddingHorizontal: 20, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  personnelImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  personnelImage: { width: '100%', height: '100%' },
  roleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  roleText: { fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '600' },
  shiftCount: { fontSize: 11 },
  rightSection: { alignItems: 'flex-end', gap: 6 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  warningBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: { height: 1, marginHorizontal: 14 },
  cardBody: { padding: 14, paddingTop: 12 },
  qualificationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  qualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  qualText: { fontSize: 10, fontWeight: '600' },
  contactRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  contactText: { fontSize: 11 },
  physicalInfoRow: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
  },
  physicalItem: { flex: 1, alignItems: 'center' },
  physicalLabel: { fontSize: 9, marginBottom: 2 },
  physicalValue: { fontSize: 13, fontWeight: '600' },
  physicalDivider: { width: 1, marginHorizontal: 8 },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 12,
  },
  shiftInfo: { flex: 1 },
  shiftTitle: { fontSize: 15, fontWeight: '600' },
  shiftVenue: { fontSize: 12, marginTop: 2 },
  shiftTimeRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    padding: 10,
    borderRadius: 10,
    gap: 12,
    marginBottom: 12,
  },
  shiftTimeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shiftTimeText: { fontSize: 12 },
  assignmentSection: { paddingHorizontal: 14, paddingBottom: 14 },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentLabel: { fontSize: 11 },
  assignmentCount: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 3 },
  assignedPersonnelRow: { flexDirection: 'row', alignItems: 'center' },
  assignedPersonImage: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white' },
  moreAssigned: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  moreAssignedText: { color: 'white', fontSize: 10, fontWeight: '600' },
  briefingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  briefingText: { flex: 1, fontSize: 11, lineHeight: 16 },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
  },
  incidentInfo: { flex: 1 },
  incidentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '600' },
  incidentCategory: { fontSize: 11 },
  incidentEvent: { fontSize: 14, fontWeight: '600' },
  incidentStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  incidentStatusText: { fontSize: 10, fontWeight: '600' },
  incidentDescription: { fontSize: 12, lineHeight: 18, paddingHorizontal: 14, marginBottom: 10 },
  incidentMeta: {
    flexDirection: 'row',
    marginHorizontal: 14,
    padding: 10,
    borderRadius: 10,
    gap: 16,
    marginBottom: 10,
  },
  incidentMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  incidentMetaText: { fontSize: 11 },
  actionTakenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  actionTakenText: { flex: 1, fontSize: 11 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
});

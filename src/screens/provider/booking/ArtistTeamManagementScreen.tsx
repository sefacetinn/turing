import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  getArtistById,
  CrewMember,
  CrewAssignment,
  CrewRole,
  RoleCategory,
  crewRoleLabels,
  roleCategoryLabels,
  roleCategoryIcons,
  feeTypeLabels,
  paymentStatusLabels,
  crewMemberStatusLabels,
  getRolesForCategory,
  groupCrewByCategory,
  mockCrewAssignments,
  formatCurrency,
  getCrewPaymentSummary,
} from '../../../data/provider/artistData';

const { width } = Dimensions.get('window');

type RouteParams = {
  ArtistTeamManagement: { artistId: string };
};

type TeamTab = 'members' | 'assignments' | 'payments';

interface TabItem {
  id: TeamTab;
  label: string;
  icon: string;
}

const teamTabs: TabItem[] = [
  { id: 'members', label: 'Ekip Üyeleri', icon: 'people-outline' },
  { id: 'assignments', label: 'Atamalar', icon: 'calendar-outline' },
  { id: 'payments', label: 'Ödemeler', icon: 'wallet-outline' },
];

type PaymentFilter = 'all' | 'paid' | 'pending' | 'overdue';

export function ArtistTeamManagementScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'ArtistTeamManagement'>>();
  const { colors, isDark } = useTheme();
  const { artistId } = route.params;

  const artist = useMemo(() => getArtistById(artistId), [artistId]);
  const groupedCrew = useMemo(() => artist ? groupCrewByCategory(artist.crew) : {}, [artist]);
  const paymentSummary = useMemo(() => getCrewPaymentSummary(artistId), [artistId]);

  // Get crew assignments for this artist
  const crewAssignments = useMemo(() => {
    if (!artist) return [];
    const crewIds = artist.crew.map(c => c.id);
    return mockCrewAssignments.filter(a => crewIds.includes(a.crewMemberId));
  }, [artist]);

  const [activeTab, setActiveTab] = useState<TeamTab>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRoleCategory, setFormRoleCategory] = useState<RoleCategory>('musician');
  const [formRole, setFormRole] = useState<CrewRole>('lead_vocal');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formFee, setFormFee] = useState('');
  const [formFeeType, setFormFeeType] = useState<CrewMember['feeType']>('per_show');
  const [formNotes, setFormNotes] = useState('');

  const resetForm = useCallback(() => {
    setFormName('');
    setFormRoleCategory('musician');
    setFormRole('lead_vocal');
    setFormPhone('');
    setFormEmail('');
    setFormFee('');
    setFormFeeType('per_show');
    setFormNotes('');
    setEditingMember(null);
  }, []);

  const openEditModal = useCallback((member: CrewMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRoleCategory(member.roleCategory);
    setFormRole(member.role);
    setFormPhone(member.phone || '');
    setFormEmail(member.email || '');
    setFormFee(member.defaultFee.toString());
    setFormFeeType(member.feeType);
    setFormNotes(member.notes || '');
    setShowAddMemberModal(true);
  }, []);

  const handleSaveMember = useCallback(() => {
    if (!formName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'İsim gereklidir.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Başarılı',
      editingMember ? 'Ekip üyesi güncellendi.' : 'Yeni ekip üyesi eklendi.',
      [{ text: 'Tamam', onPress: () => { resetForm(); setShowAddMemberModal(false); } }]
    );
  }, [formName, editingMember, resetForm]);

  const handleDeleteMember = useCallback((member: CrewMember) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Silme Onayı',
      `${member.name} ekipten çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => Alert.alert('Başarılı', 'Ekip üyesi silindi.'),
        },
      ]
    );
  }, []);

  const handleMarkAsPaid = useCallback((assignment: CrewAssignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Ödeme Onayla',
      `${formatCurrency(assignment.totalAmount - assignment.paidAmount)} tutarındaki ödeme tamamlandı olarak işaretlensin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Başarılı', 'Ödeme tamamlandı olarak işaretlendi.');
          },
        },
      ]
    );
  }, []);

  // Filter crew members by search
  const filteredCrew = useMemo(() => {
    if (!artist) return [];
    if (!searchQuery.trim()) return artist.crew;
    const query = searchQuery.toLowerCase();
    return artist.crew.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        crewRoleLabels[m.role].toLowerCase().includes(query)
    );
  }, [artist, searchQuery]);

  // Filter assignments by payment status
  const filteredAssignments = useMemo(() => {
    if (paymentFilter === 'all') return crewAssignments;
    return crewAssignments.filter((a) => a.paymentStatus === paymentFilter);
  }, [crewAssignments, paymentFilter]);

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.text }]}>Sanatçı bulunamadı</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.errorLink, { color: colors.brand[400] }]}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getCrewMemberName = (crewMemberId: string) => {
    const member = artist.crew.find((c) => c.id === crewMemberId);
    return member?.name || 'Bilinmeyen';
  };

  const getPaymentStatusColor = (status: CrewAssignment['paymentStatus']) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'partial': return '#6366F1';
      default: return colors.textMuted;
    }
  };

  const renderMembersTab = () => (
    <>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Ekip üyesi ara..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Member Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.brand[400] }]}
        onPress={() => { resetForm(); setShowAddMemberModal(true); }}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>Yeni Ekip Üyesi Ekle</Text>
      </TouchableOpacity>

      {/* Crew by Category */}
      {filteredCrew.length > 0 ? (
        (Object.keys(roleCategoryLabels) as RoleCategory[]).map((category) => {
          const members = filteredCrew.filter((m) => m.roleCategory === category);
          if (members.length === 0) return null;
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIconContainer, { backgroundColor: colors.brand[400] + '15' }]}>
                  <Ionicons name={roleCategoryIcons[category] as any} size={18} color={colors.brand[400]} />
                </View>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                  {roleCategoryLabels[category]} ({members.length})
                </Text>
              </View>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}
                  onPress={() => openEditModal(member)}
                  onLongPress={() => handleDeleteMember(member)}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: colors.brand[400] + '20' }]}>
                    <Text style={[styles.memberAvatarText, { color: colors.brand[400] }]}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                      <View style={[
                        styles.memberStatusDot,
                        { backgroundColor: member.status === 'active' ? '#10B981' : member.status === 'on_leave' ? '#F59E0B' : '#6B7280' }
                      ]} />
                    </View>
                    <Text style={[styles.memberRole, { color: colors.textMuted }]}>{crewRoleLabels[member.role]}</Text>
                    {member.notes && (
                      <Text style={[styles.memberNotes, { color: colors.textSecondary }]} numberOfLines={1}>
                        {member.notes}
                      </Text>
                    )}
                  </View>
                  <View style={styles.memberFeeContainer}>
                    <Text style={[styles.memberFee, { color: colors.success }]}>
                      {formatCurrency(member.defaultFee)}
                    </Text>
                    <Text style={[styles.memberFeeType, { color: colors.textMuted }]}>
                      {feeTypeLabels[member.feeType]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })
      ) : (
        <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface }]}>
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz ekip üyesi yok'}
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            {searchQuery ? 'Farklı bir arama terimi deneyin' : 'Sanatçının ekip üyelerini ekleyin'}
          </Text>
        </View>
      )}
    </>
  );

  const renderAssignmentsTab = () => (
    <>
      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{crewAssignments.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Toplam Atama</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {crewAssignments.filter((a) => a.assignmentStatus === 'confirmed').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Onaylı</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.brand[400] }]}>
            {formatCurrency(crewAssignments.reduce((acc, a) => acc + a.totalAmount, 0))}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Toplam Maliyet</Text>
        </View>
      </View>

      {/* Assignments List */}
      {crewAssignments.length > 0 ? (
        crewAssignments.map((assignment) => (
          <View
            key={assignment.id}
            style={[styles.assignmentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.assignmentHeader}>
              <View>
                <Text style={[styles.assignmentEvent, { color: colors.text }]}>{assignment.eventName}</Text>
                <Text style={[styles.assignmentVenue, { color: colors.textMuted }]}>
                  {assignment.venue} • {assignment.city}
                </Text>
              </View>
              <View style={[styles.assignmentStatusBadge, { backgroundColor: getPaymentStatusColor(assignment.paymentStatus) + '15' }]}>
                <Text style={[styles.assignmentStatusText, { color: getPaymentStatusColor(assignment.paymentStatus) }]}>
                  {paymentStatusLabels[assignment.paymentStatus]}
                </Text>
              </View>
            </View>
            <View style={[styles.assignmentDivider, { backgroundColor: colors.border }]} />
            <View style={styles.assignmentDetails}>
              <View style={styles.assignmentDetail}>
                <Ionicons name="person-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.assignmentDetailText, { color: colors.text }]}>
                  {getCrewMemberName(assignment.crewMemberId)}
                </Text>
              </View>
              <View style={styles.assignmentDetail}>
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.assignmentDetailText, { color: colors.text }]}>{assignment.eventDate}</Text>
              </View>
              <View style={styles.assignmentDetail}>
                <Ionicons name="cash-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.assignmentDetailText, { color: colors.success }]}>
                  {formatCurrency(assignment.fee)}
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface }]}>
          <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz atama yok</Text>
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            Ekip üyelerini etkinliklere atayın
          </Text>
        </View>
      )}
    </>
  );

  const renderPaymentsTab = () => (
    <>
      {/* Payment Summary */}
      <View style={[styles.paymentSummaryCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface }]}>
        <View style={styles.paymentSummaryRow}>
          <View style={styles.paymentSummaryItem}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.textMuted }]}>Toplam</Text>
            <Text style={[styles.paymentSummaryValue, { color: colors.text }]}>
              {formatCurrency(paymentSummary.totalDue)}
            </Text>
          </View>
          <View style={styles.paymentSummaryItem}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.textMuted }]}>Ödenen</Text>
            <Text style={[styles.paymentSummaryValue, { color: '#10B981' }]}>
              {formatCurrency(paymentSummary.totalPaid)}
            </Text>
          </View>
        </View>
        <View style={styles.paymentSummaryRow}>
          <View style={styles.paymentSummaryItem}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.textMuted }]}>Bekleyen</Text>
            <Text style={[styles.paymentSummaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(paymentSummary.totalPending)}
            </Text>
          </View>
          <View style={styles.paymentSummaryItem}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.textMuted }]}>Gecikmiş</Text>
            <Text style={[styles.paymentSummaryValue, { color: '#EF4444' }]}>
              {formatCurrency(paymentSummary.totalOverdue)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {(['all', 'paid', 'pending', 'overdue'] as PaymentFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor: paymentFilter === filter ? colors.brand[400] : colors.surface,
                borderColor: paymentFilter === filter ? colors.brand[400] : colors.border,
              },
            ]}
            onPress={() => setPaymentFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: paymentFilter === filter ? 'white' : colors.textMuted },
              ]}
            >
              {filter === 'all' ? 'Tümü' : paymentStatusLabels[filter]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment List */}
      {filteredAssignments.length > 0 ? (
        filteredAssignments.map((assignment) => (
          <View
            key={assignment.id}
            style={[styles.paymentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.paymentHeader}>
              <View style={[styles.paymentAvatar, { backgroundColor: colors.brand[400] + '20' }]}>
                <Text style={[styles.paymentAvatarText, { color: colors.brand[400] }]}>
                  {getCrewMemberName(assignment.crewMemberId).charAt(0)}
                </Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentName, { color: colors.text }]}>
                  {getCrewMemberName(assignment.crewMemberId)}
                </Text>
                <Text style={[styles.paymentEvent, { color: colors.textMuted }]}>{assignment.eventName}</Text>
              </View>
              <View style={[
                styles.paymentStatusBadge,
                { backgroundColor: getPaymentStatusColor(assignment.paymentStatus) + '15' }
              ]}>
                <View style={[styles.paymentStatusDot, { backgroundColor: getPaymentStatusColor(assignment.paymentStatus) }]} />
                <Text style={[styles.paymentStatusText, { color: getPaymentStatusColor(assignment.paymentStatus) }]}>
                  {paymentStatusLabels[assignment.paymentStatus]}
                </Text>
              </View>
            </View>
            <View style={[styles.paymentDivider, { backgroundColor: colors.border }]} />
            <View style={styles.paymentFooter}>
              <View>
                <Text style={[styles.paymentAmountLabel, { color: colors.textMuted }]}>Toplam</Text>
                <Text style={[styles.paymentAmount, { color: colors.text }]}>
                  {formatCurrency(assignment.totalAmount)}
                </Text>
              </View>
              <View>
                <Text style={[styles.paymentAmountLabel, { color: colors.textMuted }]}>Ödenen</Text>
                <Text style={[styles.paymentAmount, { color: '#10B981' }]}>
                  {formatCurrency(assignment.paidAmount)}
                </Text>
              </View>
              <View>
                <Text style={[styles.paymentAmountLabel, { color: colors.textMuted }]}>Kalan</Text>
                <Text style={[styles.paymentAmount, { color: assignment.totalAmount - assignment.paidAmount > 0 ? '#F59E0B' : colors.text }]}>
                  {formatCurrency(assignment.totalAmount - assignment.paidAmount)}
                </Text>
              </View>
              {assignment.paymentStatus !== 'paid' && (
                <TouchableOpacity
                  style={[styles.markPaidButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleMarkAsPaid(assignment)}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface }]}>
          <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            {paymentFilter === 'all' ? 'Henüz ödeme kaydı yok' : 'Bu kategoride ödeme yok'}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ekip Yönetimi</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {artist.stageName || artist.name}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {teamTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && { borderBottomColor: colors.brand[400], borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as any} size={18} color={isActive ? colors.brand[400] : colors.textMuted} />
              <Text style={[styles.tabLabel, { color: isActive ? colors.brand[400] : colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'assignments' && renderAssignmentsTab()}
        {activeTab === 'payments' && renderPaymentsTab()}
      </ScrollView>

      {/* Add/Edit Member Modal */}
      <Modal visible={showAddMemberModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => { setShowAddMemberModal(false); resetForm(); }}>
              <Text style={[styles.modalCancel, { color: colors.brand[400] }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingMember ? 'Üyeyi Düzenle' : 'Yeni Ekip Üyesi'}
            </Text>
            <TouchableOpacity onPress={handleSaveMember}>
              <Text style={[styles.modalSave, { color: colors.brand[400] }]}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              {/* Name Input */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Ad Soyad *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={formName}
                  onChangeText={setFormName}
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
                          backgroundColor: formRoleCategory === cat ? colors.brand[400] + '20' : colors.surface,
                          borderColor: formRoleCategory === cat ? colors.brand[400] : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setFormRoleCategory(cat);
                        const roles = getRolesForCategory(cat);
                        if (roles.length > 0) setFormRole(roles[0]);
                      }}
                    >
                      <Ionicons
                        name={roleCategoryIcons[cat] as any}
                        size={18}
                        color={formRoleCategory === cat ? colors.brand[400] : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          { color: formRoleCategory === cat ? colors.brand[400] : colors.textMuted },
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
                  {getRolesForCategory(formRoleCategory).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor: formRole === role ? colors.brand[400] + '20' : colors.surface,
                          borderColor: formRole === role ? colors.brand[400] : colors.border,
                        },
                      ]}
                      onPress={() => setFormRole(role)}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          { color: formRole === role ? colors.brand[400] : colors.textMuted },
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
                    value={formPhone}
                    onChangeText={setFormPhone}
                    placeholder="+90 532 123 4567"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>E-posta</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    placeholder="ornek@email.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Fee Info */}
              <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.formSectionTitle, { color: colors.text }]}>Ücret Bilgileri</Text>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Varsayılan Ücret (TRY)</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={formFee}
                    onChangeText={setFormFee}
                    placeholder="5000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Ücret Tipi</Text>
                  <View style={styles.feeTypeGrid}>
                    {(['per_show', 'per_day', 'monthly'] as CrewMember['feeType'][]).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.feeTypeOption,
                          {
                            backgroundColor: formFeeType === type ? colors.brand[400] + '20' : colors.background,
                            borderColor: formFeeType === type ? colors.brand[400] : colors.border,
                          },
                        ]}
                        onPress={() => setFormFeeType(type)}
                      >
                        <Text
                          style={[
                            styles.feeTypeOptionText,
                            { color: formFeeType === type ? colors.brand[400] : colors.textMuted },
                          ]}
                        >
                          {feeTypeLabels[type]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Notlar</Text>
                <TextInput
                  style={[styles.formTextArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  placeholder="Ek bilgiler..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
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
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 18, fontWeight: '600' },
  errorLink: { fontSize: 16, fontWeight: '500' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  // Content
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 100 },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },

  // Add Button
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8, marginBottom: 20 },
  addButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },

  // Category Section
  categorySection: { marginBottom: 16 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  categoryIconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  categoryTitle: { fontSize: 16, fontWeight: '600' },

  // Member Card
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 18, fontWeight: '600' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 15, fontWeight: '600' },
  memberStatusDot: { width: 8, height: 8, borderRadius: 4 },
  memberRole: { fontSize: 13, marginTop: 2 },
  memberNotes: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  memberFeeContainer: { alignItems: 'flex-end' },
  memberFee: { fontSize: 14, fontWeight: '600' },
  memberFeeType: { fontSize: 11, marginTop: 2 },

  // Summary Card
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginBottom: 20 },
  summaryItem: { alignItems: 'center', paddingHorizontal: 16 },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 12, marginTop: 4 },
  summaryDivider: { width: 1, height: 40 },

  // Assignment Card
  assignmentCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  assignmentEvent: { fontSize: 15, fontWeight: '600' },
  assignmentVenue: { fontSize: 13, marginTop: 2 },
  assignmentStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  assignmentStatusText: { fontSize: 12, fontWeight: '600' },
  assignmentDivider: { height: 1, marginVertical: 12 },
  assignmentDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  assignmentDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  assignmentDetailText: { fontSize: 13 },

  // Payment Summary
  paymentSummaryCard: { padding: 16, borderRadius: 16, marginBottom: 16 },
  paymentSummaryRow: { flexDirection: 'row', marginBottom: 12 },
  paymentSummaryItem: { flex: 1 },
  paymentSummaryLabel: { fontSize: 12, marginBottom: 4 },
  paymentSummaryValue: { fontSize: 18, fontWeight: '700' },

  // Filter
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterButtonText: { fontSize: 13, fontWeight: '600' },

  // Payment Card
  paymentCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center' },
  paymentAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  paymentAvatarText: { fontSize: 16, fontWeight: '600' },
  paymentInfo: { flex: 1, marginLeft: 10 },
  paymentName: { fontSize: 15, fontWeight: '600' },
  paymentEvent: { fontSize: 12, marginTop: 2 },
  paymentStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  paymentStatusDot: { width: 6, height: 6, borderRadius: 3 },
  paymentStatusText: { fontSize: 12, fontWeight: '600' },
  paymentDivider: { height: 1, marginVertical: 12 },
  paymentFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paymentAmountLabel: { fontSize: 11, marginBottom: 2 },
  paymentAmount: { fontSize: 14, fontWeight: '600' },
  markPaidButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Empty State
  emptyState: { alignItems: 'center', padding: 32, borderRadius: 16 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyStateText: { fontSize: 14, marginTop: 4, textAlign: 'center' },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1 },
  modalContentContainer: { padding: 16 },

  // Form
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, marginBottom: 8 },
  formInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  formTextArea: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 100 },
  formSection: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  formSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8 },
  categoryOptionText: { fontSize: 13, fontWeight: '500' },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  roleOptionText: { fontSize: 13, fontWeight: '500' },
  feeTypeGrid: { flexDirection: 'row', gap: 8 },
  feeTypeOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  feeTypeOptionText: { fontSize: 13, fontWeight: '500' },
});

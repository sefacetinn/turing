import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useRBAC } from '../context/RBACContext';
import { usePermissions } from '../hooks/usePermissions';
import { TeamMemberCard, InvitationCard } from '../components/team';
import type { ProfileStackNavigationProp } from '../types';

export default function TeamScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigationProp>();
  const {
    currentOrganization,
    currentUser,
    isLoading,
    cancelInvitation,
    resendInvitation,
    refreshOrganization,
  } = useRBAC();
  const { canManageTeam } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrganization();
    setRefreshing(false);
  }, [refreshOrganization]);

  const handleCancelInvitation = useCallback(
    async (invitationId: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Daveti İptal Et',
        'Bu daveti iptal etmek istediğinize emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'İptal Et',
            style: 'destructive',
            onPress: async () => {
              setCancellingId(invitationId);
              try {
                await cancelInvitation(invitationId);
              } catch (error) {
                Alert.alert('Hata', 'Davet iptal edilemedi.');
              }
              setCancellingId(null);
            },
          },
        ]
      );
    },
    [cancelInvitation]
  );

  const handleResendInvitation = useCallback(
    async (invitationId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        await resendInvitation(invitationId);
        Alert.alert('Başarılı', 'Davet tekrar gönderildi.');
      } catch (error) {
        Alert.alert('Hata', 'Davet gönderilemedi.');
      }
    },
    [resendInvitation]
  );

  const handleMemberPress = useCallback(
    (memberId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (memberId !== currentUser?.id) {
        navigation.navigate('MemberDetail', { memberId });
      }
    },
    [navigation, currentUser]
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.brand[400]} />
      </View>
    );
  }

  const activeMembers = currentOrganization?.members.filter(
    (m) => m.status === 'active'
  ) || [];
  const pendingInvitations = currentOrganization?.pendingInvitations || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Ekip Yönetimi
        </Text>
        {canManageTeam && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brand[400] }]}
            onPress={() => navigation.navigate('InviteMember')}
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
          />
        }
      >
        {/* Organization Info */}
        <View
          style={[
            styles.orgCard,
            {
              backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.05)',
              borderColor: isDark ? 'rgba(75, 48, 184, 0.3)' : 'rgba(75, 48, 184, 0.2)',
            },
          ]}
        >
          <Ionicons name="business" size={24} color={colors.brand[400]} />
          <View style={styles.orgInfo}>
            <Text style={[styles.orgName, { color: colors.text }]}>
              {currentOrganization?.name}
            </Text>
            <Text style={[styles.orgType, { color: colors.textMuted }]}>
              {currentOrganization?.type === 'organizer'
                ? 'Organizatör'
                : 'Hizmet Sağlayıcı'}
            </Text>
          </View>
        </View>

        {/* Active Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Aktif Üyeler
            </Text>
            <View style={[styles.countBadge, { backgroundColor: '#10b981' }]}>
              <Text style={styles.countText}>{activeMembers.length}</Text>
            </View>
          </View>

          {activeMembers.length === 0 ? (
            <View style={styles.emptyMembersContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyMembersTitle, { color: colors.text }]}>
                Henüz ekip üyesi yok
              </Text>
              <Text style={[styles.emptyMembersSubtitle, { color: colors.textMuted }]}>
                Ekibinize üye ekleyerek birlikte çalışmaya başlayın
              </Text>
              {canManageTeam && (
                <TouchableOpacity
                  style={[styles.inviteButton, { backgroundColor: colors.brand[400] }]}
                  onPress={() => navigation.navigate('InviteMember')}
                >
                  <Ionicons name="person-add" size={18} color="#ffffff" />
                  <Text style={styles.inviteButtonText}>Üye Davet Et</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            activeMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.id === currentUser?.id}
                onPress={
                  member.id !== currentUser?.id && canManageTeam
                    ? () => handleMemberPress(member.id)
                    : undefined
                }
                showChevron={canManageTeam}
              />
            ))
          )}
        </View>

        {/* Pending Invitations Section */}
        {canManageTeam && pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bekleyen Davetler
              </Text>
              <View style={[styles.countBadge, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.countText}>{pendingInvitations.length}</Text>
              </View>
            </View>

            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onCancel={() => handleCancelInvitation(invitation.id)}
                onResend={() => handleResendInvitation(invitation.id)}
              />
            ))}
          </View>
        )}

        {/* Empty State for Invitations */}
        {canManageTeam && pendingInvitations.length === 0 && (
          <View style={styles.emptySection}>
            <Ionicons name="mail-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Bekleyen davet yok
            </Text>
            <TouchableOpacity
              style={styles.inviteLink}
              onPress={() => navigation.navigate('InviteMember')}
            >
              <Text style={styles.inviteLinkText}>Yeni üye davet et</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  orgInfo: {
    marginLeft: 12,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orgType: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  inviteLink: {
    marginTop: 8,
  },
  inviteLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b30b8',
  },
  emptyMembersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    gap: 8,
  },
  emptyMembersTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyMembersSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

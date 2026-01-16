/**
 * TeamModule - Ekip Modülü
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { TeamModuleData, ModuleConfig } from '../../../types/modules';

interface TeamModuleProps {
  data?: TeamModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: TeamModuleData) => void;
}

export const TeamModule: React.FC<TeamModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.members || data.members.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ekip bilgisi yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.totalCount && (
        <View style={[styles.totalBadge, { backgroundColor: isDark ? '#27272A' : '#F0F9FF' }]}>
          <Ionicons name="people" size={14} color="#3B82F6" />
          <Text style={[styles.totalText, { color: '#3B82F6' }]}>Toplam {data.totalCount} Kişi</Text>
        </View>
      )}
      <View style={styles.membersList}>
        {data.members.slice(0, 5).map((member) => (
          <View key={member.id} style={[styles.memberCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
            {member.image ? (
              <Image source={{ uri: member.image }} style={styles.memberImage} />
            ) : (
              <View style={[styles.memberAvatar, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
            </View>
            {member.isLead && (
              <View style={styles.leadBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
              </View>
            )}
          </View>
        ))}
        {data.members.length > 5 && (
          <Text style={[styles.moreText, { color: colors.textSecondary }]}>
            +{data.members.length - 5} kişi daha
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  totalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  totalText: { fontSize: 12, fontWeight: '600' },
  membersList: { gap: 8 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10 },
  memberImage: { width: 40, height: 40, borderRadius: 10 },
  memberAvatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  memberInfo: { flex: 1, marginLeft: 10 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRole: { fontSize: 12, marginTop: 2 },
  leadBadge: { padding: 4 },
  moreText: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});

export default TeamModule;

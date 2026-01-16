/**
 * ParticipantModule - Katılımcı Modülü
 *
 * Kapasite, yaş sınırı ve katılımcı türü bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { ParticipantModuleData, ModuleConfig } from '../../../types/modules';
import { DetailRow } from '../shared/DetailRow';

interface ParticipantModuleProps {
  data?: ParticipantModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: ParticipantModuleData) => void;
}

export const ParticipantModule: React.FC<ParticipantModuleProps> = ({
  data,
  config,
  mode = 'view',
  onDataChange,
}) => {
  const { colors, isDark } = useTheme();

  if (!data) {
    return null;
  }

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('tr-TR');
  };

  return (
    <View style={styles.container}>
      {data.expectedCount && (
        <DetailRow
          icon="people-outline"
          iconColor="#3B82F6"
          label="Beklenen Katılımcı"
          value={formatNumber(data.expectedCount)}
        />
      )}
      {(data.minCount || data.maxCount) && (
        <DetailRow
          icon="analytics-outline"
          iconColor="#6366F1"
          label="Katılımcı Aralığı"
          value={`${formatNumber(data.minCount)} - ${formatNumber(data.maxCount)}`}
        />
      )}
      {data.ageLimit && (
        <DetailRow
          icon="alert-circle-outline"
          iconColor="#F59E0B"
          label="Yaş Sınırı"
          value={data.ageLimit}
        />
      )}
      {data.participantType && (
        <DetailRow
          icon="person-outline"
          iconColor="#8B5CF6"
          label="Katılımcı Türü"
          value={data.participantType}
        />
      )}
      {data.hasVipArea && (
        <View style={[styles.vipBox, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.06)' }]}>
          <View style={styles.vipHeader}>
            <Ionicons name="star" size={16} color="#8B5CF6" />
            <Text style={[styles.vipTitle, { color: '#8B5CF6' }]}>VIP Alan Mevcut</Text>
          </View>
          {data.vipCapacity && (
            <Text style={[styles.vipCapacity, { color: colors.textSecondary }]}>
              Kapasite: {formatNumber(data.vipCapacity)} kişi
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  vipBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vipTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  vipCapacity: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 22,
  },
});

export default ParticipantModule;

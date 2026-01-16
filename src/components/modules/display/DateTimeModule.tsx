/**
 * DateTimeModule - Tarih/Saat Modülü
 *
 * Etkinlik tarihi, saati ve süresi bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { DateTimeModuleData, ModuleConfig } from '../../../types/modules';
import { DetailRow } from '../shared/DetailRow';

interface DateTimeModuleProps {
  data?: DateTimeModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: DateTimeModuleData) => void;
}

export const DateTimeModule: React.FC<DateTimeModuleProps> = ({
  data,
  config,
  mode = 'view',
  onDataChange,
}) => {
  const { colors, isDark } = useTheme();

  if (!data) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Tarih bilgisi bulunamadı
        </Text>
      </View>
    );
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '-';
    return timeStr;
  };

  return (
    <View style={styles.container}>
      <DetailRow
        icon="calendar-outline"
        iconColor="#6366F1"
        label="Etkinlik Tarihi"
        value={formatDate(data.eventDate)}
      />
      {data.eventTime && (
        <DetailRow
          icon="time-outline"
          iconColor="#10B981"
          label="Başlangıç Saati"
          value={formatTime(data.eventTime)}
        />
      )}
      {data.duration && (
        <DetailRow
          icon="hourglass-outline"
          iconColor="#F59E0B"
          label="Süre"
          value={data.duration}
        />
      )}
      {data.doorsOpenTime && (
        <DetailRow
          icon="enter-outline"
          iconColor="#8B5CF6"
          label="Kapı Açılış"
          value={formatTime(data.doorsOpenTime)}
        />
      )}
      {data.soundcheckTime && (
        <DetailRow
          icon="mic-outline"
          iconColor="#EC4899"
          label="Ses Kontrolü"
          value={formatTime(data.soundcheckTime)}
        />
      )}
      {data.loadInTime && (
        <DetailRow
          icon="cube-outline"
          iconColor="#14B8A6"
          label="Yükleme Saati"
          value={formatTime(data.loadInTime)}
          borderBottom={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default DateTimeModule;

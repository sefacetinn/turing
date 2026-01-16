/**
 * TimelineModule - Zaman Çizelgesi Modülü
 *
 * Etkinlik programı ve aşamalarını gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { TimelineModuleData, ModuleConfig } from '../../../types/modules';

interface TimelineModuleProps {
  data?: TimelineModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: TimelineModuleData) => void;
}

export const TimelineModule: React.FC<TimelineModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.items || data.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Program bilgisi yok</Text>
      </View>
    );
  }

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'pending': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status?: string): string => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'play-circle';
      case 'pending': return 'time';
      default: return 'ellipse-outline';
    }
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      {data.items.map((item, index) => {
        const isLast = index === data.items.length - 1;
        const statusColor = getStatusColor(item.status);

        return (
          <View key={item.id || index} style={styles.timelineItem}>
            {/* Time Column */}
            <View style={styles.timeColumn}>
              <Text style={[styles.timeText, { color: statusColor }]}>
                {item.time || '--:--'}
              </Text>
            </View>

            {/* Timeline Indicator */}
            <View style={styles.indicator}>
              <View style={[styles.indicatorDot, { backgroundColor: statusColor }]}>
                <Ionicons
                  name={getStatusIcon(item.status) as any}
                  size={14}
                  color="#FFFFFF"
                />
              </View>
              {!isLast && (
                <View style={[styles.indicatorLine, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]} />
              )}
            </View>

            {/* Content */}
            <View style={[
              styles.eventCard,
              { backgroundColor: isDark ? '#27272A' : '#F8FAFC' },
              item.status === 'in_progress' && { borderColor: '#3B82F6', borderWidth: 1 }
            ]}>
              <View style={styles.eventHeader}>
                <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.status && (
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                )}
              </View>
              {item.description && (
                <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.assignee && (
                <View style={styles.assigneeRow}>
                  <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.assigneeText, { color: colors.textSecondary }]}>
                    {item.assignee}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Summary */}
      <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
        <Ionicons name="list" size={16} color="#6366F1" />
        <Text style={[styles.summaryText, { color: '#6366F1' }]}>
          {data.items.length} Etkinlik
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 8,
  },
  timeText: { fontSize: 13, fontWeight: '700' },
  indicator: {
    width: 30,
    alignItems: 'center',
  },
  indicatorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  indicatorLine: {
    width: 2,
    flex: 1,
    marginTop: -4,
  },
  eventCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: '600' },
  eventDescription: { fontSize: 12, marginTop: 8, lineHeight: 18 },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  assigneeText: { fontSize: 11 },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  summaryText: { fontSize: 13, fontWeight: '600' },
});

export default TimelineModule;

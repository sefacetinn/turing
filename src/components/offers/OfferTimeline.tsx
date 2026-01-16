import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import type { OfferHistoryItem } from '../../data/offersData';

interface OfferTimelineProps {
  history: OfferHistoryItem[];
}

export function OfferTimeline({ history }: OfferTimelineProps) {
  const { colors, isDark } = useTheme();

  const getIcon = (type: OfferHistoryItem['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'submitted':
        return 'paper-plane';
      case 'viewed':
        return 'eye';
      case 'counter':
        return 'swap-horizontal';
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'message':
        return 'chatbubble';
      default:
        return 'ellipse';
    }
  };

  const getColor = (type: OfferHistoryItem['type']): string => {
    switch (type) {
      case 'submitted':
        return '#6366F1'; // Purple
      case 'viewed':
        return '#8B5CF6'; // Violet
      case 'counter':
        return '#F59E0B'; // Amber
      case 'accepted':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      case 'message':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const getLabel = (type: OfferHistoryItem['type']): string => {
    switch (type) {
      case 'submitted':
        return 'Teklif Gönderildi';
      case 'viewed':
        return 'Teklif Görüntülendi';
      case 'counter':
        return 'Karşı Teklif';
      case 'accepted':
        return 'Teklif Kabul Edildi';
      case 'rejected':
        return 'Teklif Reddedildi';
      case 'message':
        return 'Mesaj Gönderildi';
      default:
        return type;
    }
  };

  const getByLabel = (by: OfferHistoryItem['by']): string => {
    return by === 'provider' ? 'Siz' : 'Organizatör';
  };

  return (
    <View style={styles.container}>
      {history.map((item, index) => {
        const color = getColor(item.type);
        const isLast = index === history.length - 1;

        return (
          <View key={item.id} style={styles.timelineItem}>
            {/* Line connector */}
            {!isLast && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
              />
            )}

            {/* Icon circle */}
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: `${color}15`,
                  borderColor: `${color}30`,
                },
              ]}
            >
              <Ionicons name={getIcon(item.type)} size={16} color={color} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={[styles.byLabel, { color: colors.textSecondary }]}>
                  {getByLabel(item.by)}
                </Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>{item.date}</Text>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>{getLabel(item.type)}</Text>

              {item.amount && (
                <Text style={[styles.amount, { color }]}>
                  ₺{item.amount.toLocaleString('tr-TR')}
                </Text>
              )}

              {item.message && (
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                  "{item.message}"
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 20,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 17,
    top: 40,
    bottom: 0,
    width: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  byLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
  },
});

export default OfferTimeline;

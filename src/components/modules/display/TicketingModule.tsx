/**
 * TicketingModule - Biletleme Modülü
 *
 * Bilet satış ve kapasite bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { TicketingModuleData, ModuleConfig } from '../../../types/modules';

interface TicketingModuleProps {
  data?: TicketingModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: TicketingModuleData) => void;
}

export const TicketingModule: React.FC<TicketingModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bilet bilgisi yok</Text>
      </View>
    );
  }

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '-';
    return `₺${amount.toLocaleString('tr-TR')}`;
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('tr-TR');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const soldPercentage = data.totalCapacity && data.soldCount
    ? Math.round((data.soldCount / data.totalCapacity) * 100)
    : 0;

  const remainingTickets = data.availableCount ?? (data.totalCapacity - (data.soldCount || 0));

  return (
    <View style={styles.container}>
      {/* Capacity Progress */}
      <View style={[styles.capacityBox, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
        <View style={styles.capacityHeader}>
          <Text style={[styles.capacityLabel, { color: colors.textSecondary }]}>Kapasite</Text>
          <Text style={[styles.capacityValue, { color: colors.text }]}>
            {formatNumber(data.soldCount || 0)} / {formatNumber(data.totalCapacity)}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${soldPercentage}%`,
                backgroundColor: soldPercentage >= 90 ? '#EF4444' : soldPercentage >= 70 ? '#F59E0B' : '#10B981'
              }
            ]}
          />
        </View>
        <View style={styles.capacityFooter}>
          <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
            %{soldPercentage} Dolu
          </Text>
          <Text style={[styles.remainingText, { color: '#10B981' }]}>
            {formatNumber(remainingTickets)} kaldı
          </Text>
        </View>
      </View>

      {/* Ticket Types */}
      {data.ticketTypes && data.ticketTypes.length > 0 && (
        <View style={styles.ticketTypesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bilet Türleri</Text>
          {data.ticketTypes.map((ticketType, index) => {
            const typeSoldPercentage = ticketType.quantity && ticketType.soldCount
              ? Math.round((ticketType.soldCount / ticketType.quantity) * 100)
              : 0;
            const isSoldOut = typeSoldPercentage >= 100;

            return (
              <View
                key={ticketType.id || index}
                style={[styles.ticketTypeCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
              >
                <View style={styles.ticketTypeHeader}>
                  <View style={styles.ticketTypeInfo}>
                    <Text style={[styles.ticketTypeName, { color: colors.text }]}>{ticketType.name}</Text>
                    {ticketType.description && (
                      <Text style={[styles.ticketTypeDesc, { color: colors.textSecondary }]}>
                        {ticketType.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.ticketTypePrice}>
                    <Text style={[styles.priceText, { color: colors.primary }]}>
                      {formatCurrency(ticketType.price)}
                    </Text>
                  </View>
                </View>
                <View style={styles.ticketTypeMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="ticket-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {formatNumber(ticketType.soldCount || 0)} / {formatNumber(ticketType.quantity)}
                    </Text>
                  </View>
                  {isSoldOut && (
                    <View style={[styles.soldOutBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                      <Text style={styles.soldOutBadgeText}>TÜKENDİ</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Sale Dates */}
      {(data.salesStartDate || data.salesEndDate) && (
        <View style={styles.saleDatesSection}>
          {data.salesStartDate && (
            <View style={[styles.infoRow, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
              <Ionicons name="calendar-outline" size={16} color="#10B981" />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Satış Başlangıç:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(data.salesStartDate)}</Text>
            </View>
          )}
          {data.salesEndDate && (
            <View style={[styles.infoRow, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
              <Ionicons name="calendar-outline" size={16} color="#EF4444" />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Satış Bitiş:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(data.salesEndDate)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
          <Ionicons name="ticket" size={18} color="#10B981" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {data.ticketTypes?.length || 0}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Bilet Türü</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: isDark ? '#27272A' : '#EFF6FF' }]}>
          <Ionicons name="people" size={18} color="#3B82F6" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatNumber(data.totalCapacity)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Toplam Kapasite</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  capacityBox: {
    padding: 14,
    borderRadius: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  capacityLabel: { fontSize: 13 },
  capacityValue: { fontSize: 15, fontWeight: '700' },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  capacityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  percentageText: { fontSize: 12 },
  remainingText: { fontSize: 12, fontWeight: '600' },
  ticketTypesSection: {},
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  ticketTypeCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketTypeInfo: { flex: 1, marginRight: 12 },
  ticketTypeName: { fontSize: 15, fontWeight: '600' },
  ticketTypeDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  ticketTypePrice: {},
  priceText: { fontSize: 18, fontWeight: '700' },
  ticketTypeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: { fontSize: 12 },
  soldOutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  soldOutBadgeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  saleDatesSection: { gap: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 11 },
});

export default TicketingModule;

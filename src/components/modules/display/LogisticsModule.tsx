/**
 * LogisticsModule - Lojistik Modülü
 *
 * Ulaşım bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { LogisticsModuleData, ModuleConfig } from '../../../types/modules';

interface LogisticsModuleProps {
  data?: LogisticsModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: LogisticsModuleData) => void;
}

export const LogisticsModule: React.FC<LogisticsModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data) {
    return null;
  }

  const handleOpenMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const hasTransport = data.departureCity || data.arrivalCity;

  if (!hasTransport) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Lojistik bilgisi yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Transport Route */}
      <View style={[styles.section, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="car" size={18} color="#3B82F6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ulaşım</Text>
        </View>
        <View style={styles.transportRoute}>
          {/* Departure */}
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <View style={styles.routeInfo}>
              <Text style={[styles.routeCity, { color: colors.text }]}>{data.departureCity || '-'}</Text>
              {data.departureAddress && (
                <TouchableOpacity onPress={() => handleOpenMaps(data.departureAddress!)}>
                  <Text style={[styles.routeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {data.departureAddress}
                  </Text>
                </TouchableOpacity>
              )}
              {data.departureTime && (
                <Text style={[styles.routeDate, { color: colors.textSecondary }]}>{data.departureTime}</Text>
              )}
            </View>
          </View>

          {/* Route Line */}
          <View style={styles.routeLine}>
            {data.passengerCount && (
              <View style={[styles.passengerBadge, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
                <Ionicons name="people" size={12} color={colors.textSecondary} />
                <Text style={[styles.passengerText, { color: colors.textSecondary }]}>
                  {data.passengerCount} Yolcu
                </Text>
                {data.luggageCount && (
                  <>
                    <Text style={[styles.dotSeparator, { color: colors.textSecondary }]}>•</Text>
                    <Ionicons name="briefcase" size={12} color={colors.textSecondary} />
                    <Text style={[styles.passengerText, { color: colors.textSecondary }]}>
                      {data.luggageCount} Bagaj
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Arrival */}
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.routeInfo}>
              <Text style={[styles.routeCity, { color: colors.text }]}>{data.arrivalCity || '-'}</Text>
              {data.arrivalAddress && (
                <TouchableOpacity onPress={() => handleOpenMaps(data.arrivalAddress!)}>
                  <Text style={[styles.routeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {data.arrivalAddress}
                  </Text>
                </TouchableOpacity>
              )}
              {data.arrivalTime && (
                <Text style={[styles.routeDate, { color: colors.textSecondary }]}>{data.arrivalTime}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Return Trip Badge */}
        {data.returnTrip && (
          <View style={[styles.returnBadge, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Ionicons name="swap-horizontal" size={14} color="#8B5CF6" />
            <Text style={styles.returnText}>Gidiş-Dönüş</Text>
            {data.returnTime && (
              <Text style={[styles.returnTime, { color: colors.textSecondary }]}>
                Dönüş: {data.returnTime}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Special Requests */}
      {data.specialRequests && (
        <View style={[styles.notesBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)' }]}>
          <Ionicons name="information-circle" size={16} color="#6366F1" />
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>{data.specialRequests}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  section: {
    padding: 14,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600' },
  transportRoute: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  },
  routeInfo: { flex: 1 },
  routeCity: { fontSize: 14, fontWeight: '600' },
  routeAddress: { fontSize: 12, marginTop: 2 },
  routeDate: { fontSize: 12, marginTop: 2 },
  routeLine: {
    marginLeft: 4,
    minHeight: 40,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    paddingLeft: 16,
    paddingVertical: 8,
  },
  passengerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  passengerText: { fontSize: 11, fontWeight: '500' },
  dotSeparator: { fontSize: 8 },
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  returnText: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  returnTime: { fontSize: 11, marginLeft: 4 },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  notesText: { flex: 1, fontSize: 12, lineHeight: 18 },
});

export default LogisticsModule;

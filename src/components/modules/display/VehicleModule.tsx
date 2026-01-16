/**
 * VehicleModule - Araç Modülü
 *
 * Araç bilgileri ve kapasite detaylarını gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { VehicleModuleData, ModuleConfig } from '../../../types/modules';

interface VehicleModuleProps {
  data?: VehicleModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: VehicleModuleData) => void;
}

export const VehicleModule: React.FC<VehicleModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Araç bilgisi yok</Text>
      </View>
    );
  }

  const getVehicleIcon = (type?: string): string => {
    switch (type) {
      case 'sedan': return 'car';
      case 'suv': return 'car-sport';
      case 'van': return 'bus';
      case 'minibus': return 'bus';
      case 'bus': return 'bus';
      case 'limousine': return 'car';
      default: return 'car';
    }
  };

  const getVehicleTypeName = (type?: string): string => {
    switch (type) {
      case 'sedan': return 'Sedan';
      case 'suv': return 'SUV';
      case 'van': return 'Van';
      case 'minibus': return 'Minibüs';
      case 'bus': return 'Otobüs';
      case 'limousine': return 'Limuzin';
      case 'other': return 'Diğer';
      default: return 'Araç';
    }
  };

  const getAmenityLabel = (amenity: string): string => {
    const labels: Record<string, string> = {
      'wifi': 'Wi-Fi',
      'ac': 'Klima',
      'tv': 'TV',
      'usb': 'USB',
      'minibar': 'Minibar',
      'gps': 'GPS',
      'bluetooth': 'Bluetooth',
    };
    return labels[amenity.toLowerCase()] || amenity;
  };

  return (
    <View style={styles.container}>
      {/* Main Vehicle Card */}
      <View style={[styles.vehicleCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
        {/* Vehicle Icon */}
        <View style={styles.vehicleVisual}>
          <View style={[styles.vehicleIconBox, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
            <Ionicons name={getVehicleIcon(data.vehicleType) as any} size={40} color={colors.textSecondary} />
          </View>
          <View style={[styles.typeBadge, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.typeBadgeText}>{getVehicleTypeName(data.vehicleType)}</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleInfo}>
          {(data.brand || data.model) && (
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {data.brand} {data.model}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
              <Ionicons name="car" size={16} color="#3B82F6" />
              <Text style={[styles.statValue, { color: colors.text }]}>{data.vehicleCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Araç</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
              <Ionicons name="people" size={16} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>{data.passengerCapacity}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kişi</Text>
            </View>
          </View>

          {/* License Plate */}
          {data.licensePlate && (
            <View style={[styles.plateBox, { backgroundColor: isDark ? '#3F3F46' : '#F1F5F9' }]}>
              <Text style={[styles.plateText, { color: colors.text }]}>{data.licensePlate}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Driver Info */}
      {data.driverInfo && (
        <View style={[styles.driverSection, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
          <View style={styles.driverHeader}>
            <View style={[styles.driverIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="person" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.driverName, { color: colors.text }]}>{data.driverInfo.name}</Text>
              <Text style={[styles.driverRole, { color: colors.textSecondary }]}>Şoför</Text>
            </View>
          </View>
          {data.driverInfo.phone && (
            <View style={styles.driverContact}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.driverPhone, { color: colors.textSecondary }]}>{data.driverInfo.phone}</Text>
            </View>
          )}
        </View>
      )}

      {/* Amenities */}
      {data.amenities && data.amenities.length > 0 && (
        <View style={styles.amenitiesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Olanaklar</Text>
          <View style={styles.amenitiesRow}>
            {data.amenities.map((amenity, idx) => (
              <View
                key={idx}
                style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}
              >
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={[styles.amenityText, { color: colors.text }]}>
                  {getAmenityLabel(amenity)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  vehicleCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  vehicleVisual: {
    height: 100,
    position: 'relative',
  },
  vehicleIconBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  vehicleInfo: {
    padding: 14,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  plateBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  plateText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  driverSection: {
    padding: 14,
    borderRadius: 12,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverRole: {
    fontSize: 12,
    marginTop: 2,
  },
  driverContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingLeft: 52,
  },
  driverPhone: { fontSize: 13 },
  amenitiesSection: {},
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: { fontSize: 12 },
});

export default VehicleModule;

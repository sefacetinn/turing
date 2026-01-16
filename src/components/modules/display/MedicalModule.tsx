/**
 * MedicalModule - Medikal Modül
 *
 * Tıbbi hizmetler ve sağlık ekibi bilgilerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { MedicalModuleData, ModuleConfig } from '../../../types/modules';

interface MedicalModuleProps {
  data?: MedicalModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: MedicalModuleData) => void;
}

export const MedicalModule: React.FC<MedicalModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();

  if (!data || !data.serviceTypes || data.serviceTypes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Medikal bilgi yok</Text>
      </View>
    );
  }

  const getServiceIcon = (type: string): string => {
    switch (type) {
      case 'first_aid': return 'medkit';
      case 'ambulance': return 'car';
      case 'doctor': return 'person';
      case 'nurse': return 'person-outline';
      case 'paramedic': return 'fitness';
      default: return 'medical';
    }
  };

  const getServiceLabel = (type: string): string => {
    switch (type) {
      case 'first_aid': return 'İlk Yardım';
      case 'ambulance': return 'Ambulans';
      case 'doctor': return 'Doktor';
      case 'nurse': return 'Hemşire';
      case 'paramedic': return 'Paramedik';
      default: return type;
    }
  };

  const getServiceColor = (type: string): string => {
    switch (type) {
      case 'first_aid': return '#10B981';
      case 'ambulance': return '#EF4444';
      case 'doctor': return '#3B82F6';
      case 'nurse': return '#8B5CF6';
      case 'paramedic': return '#F59E0B';
      default: return '#6366F1';
    }
  };

  return (
    <View style={styles.container}>
      {/* Service Types Grid */}
      <View style={styles.servicesGrid}>
        {data.serviceTypes.map((serviceType, index) => (
          <View
            key={index}
            style={[styles.serviceCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
          >
            <View style={[styles.serviceIcon, { backgroundColor: `${getServiceColor(serviceType)}15` }]}>
              <Ionicons name={getServiceIcon(serviceType) as any} size={20} color={getServiceColor(serviceType)} />
            </View>
            <Text style={[styles.serviceName, { color: colors.text }]}>
              {getServiceLabel(serviceType)}
            </Text>
          </View>
        ))}
      </View>

      {/* Personnel & Ambulance Count */}
      {(data.personnelCount || data.ambulanceCount) && (
        <View style={styles.statsRow}>
          {data.personnelCount && (
            <View style={[styles.statCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
              <Ionicons name="people" size={18} color="#3B82F6" />
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.personnelCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Personel</Text>
              </View>
            </View>
          )}
          {data.ambulanceCount && (
            <View style={[styles.statCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
              <Ionicons name="car" size={18} color="#EF4444" />
              <View>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.ambulanceCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ambulans</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Equipment List */}
      {data.equipmentList && data.equipmentList.length > 0 && (
        <View style={[styles.section, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit" size={16} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ekipman</Text>
          </View>
          <View style={styles.equipmentList}>
            {data.equipmentList.map((item, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={[styles.equipmentText, { color: colors.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Station Locations */}
      {data.stationLocations && data.stationLocations.length > 0 && (
        <View style={[styles.section, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={16} color="#6366F1" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>İstasyon Konumları</Text>
          </View>
          <View style={styles.locationsList}>
            {data.stationLocations.map((location, index) => (
              <View key={index} style={styles.locationItem}>
                <View style={[styles.locationDot, { backgroundColor: '#6366F1' }]} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>{location}</Text>
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: { fontSize: 13, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  section: {
    padding: 12,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  equipmentList: { gap: 6 },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentText: { fontSize: 13 },
  locationsList: { gap: 8 },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationText: { fontSize: 13 },
});

export default MedicalModule;

/**
 * VenueModule - Mekan Modülü
 *
 * Mekan bilgileri, salon detayları, sahne ölçüleri ve kulis bilgilerini gösterir.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { VenueModuleData, ModuleConfig } from '../../../types/modules';
import { DetailRow, DetailStat, DetailGrid } from '../shared/DetailRow';

interface VenueModuleProps {
  data?: VenueModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: VenueModuleData) => void;
}

export const VenueModule: React.FC<VenueModuleProps> = ({
  data,
  config,
  mode = 'view',
  onDataChange,
}) => {
  const { colors, isDark } = useTheme();
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!data) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Mekan bilgisi bulunamadı
        </Text>
      </View>
    );
  }

  const getIndoorOutdoorLabel = (type?: string): string => {
    switch (type) {
      case 'indoor': return 'Kapalı Alan';
      case 'outdoor': return 'Açık Alan';
      case 'mixed': return 'Karma';
      default: return '-';
    }
  };

  const getSeatingTypeLabel = (type?: string): string => {
    switch (type) {
      case 'standing': return 'Ayakta';
      case 'seated': return 'Oturma';
      case 'mixed': return 'Karma';
      default: return '-';
    }
  };

  const getVenueTypeLabel = (type?: string): string => {
    const types: Record<string, string> = {
      concert_hall: 'Konser Salonu',
      arena: 'Arena',
      stadium: 'Stadyum',
      hotel_ballroom: 'Otel Balo Salonu',
      open_air: 'Açık Hava',
      club: 'Kulüp',
      theater: 'Tiyatro',
      other: 'Diğer',
    };
    return types[type || ''] || '-';
  };

  const selectedHall = data.halls?.find(h => h.id === data.selectedHallId) || data.halls?.[0];

  return (
    <View style={styles.container}>
      {/* Summary Row */}
      <TouchableOpacity
        style={styles.summaryRow}
        onPress={() => setShowDetailModal(true)}
        activeOpacity={0.7}
      >
        {data.images?.[0] && (
          <Image source={{ uri: data.images[0] }} style={styles.thumbnail} />
        )}
        <View style={styles.summaryInfo}>
          <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>
            {data.name}
          </Text>
          <Text style={[styles.venueAddress, { color: colors.textSecondary }]} numberOfLines={1}>
            {data.district ? `${data.district}, ` : ''}{data.city}
          </Text>
          {data.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{data.rating}</Text>
              {data.reviewCount && (
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                  ({data.reviewCount})
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.detailBtn}>
          <Text style={styles.detailBtnText}>Detay</Text>
          <Ionicons name="chevron-forward" size={14} color="#6366F1" />
        </View>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={[styles.quickStats, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
        <View style={styles.quickItem}>
          <Ionicons name="people-outline" size={14} color="#6366F1" />
          <Text style={[styles.quickText, { color: colors.text }]}>
            {data.capacity?.toLocaleString('tr-TR') || '-'}
          </Text>
        </View>
        <View style={styles.quickItem}>
          <Ionicons
            name={data.indoorOutdoor === 'outdoor' ? 'sunny-outline' : 'home-outline'}
            size={14}
            color="#10B981"
          />
          <Text style={[styles.quickText, { color: colors.text }]}>
            {getIndoorOutdoorLabel(data.indoorOutdoor)}
          </Text>
        </View>
        {data.backstage?.hasBackstage && (
          <View style={styles.quickItem}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={[styles.quickText, { color: colors.text }]}>Kulis</Text>
          </View>
        )}
        {data.halls && data.halls.length > 1 && (
          <View style={styles.quickItem}>
            <Ionicons name="grid-outline" size={14} color="#F59E0B" />
            <Text style={[styles.quickText, { color: colors.text }]}>{data.halls.length} Salon</Text>
          </View>
        )}
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#18181B' : '#FFFFFF' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Mekan Detayları</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Images */}
              {data.images && data.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesScroll}
                >
                  {data.images.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.modalImage} />
                  ))}
                </ScrollView>
              )}

              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GENEL BİLGİLER</Text>
                <DetailRow
                  icon="business-outline"
                  iconColor="#F59E0B"
                  label="Mekan Adı"
                  value={data.name}
                />
                <DetailRow
                  icon="location-outline"
                  iconColor="#EF4444"
                  label="Adres"
                  value={`${data.address}, ${data.district ? data.district + ', ' : ''}${data.city}`}
                />
                <DetailRow
                  icon="home-outline"
                  iconColor="#10B981"
                  label="Mekan Tipi"
                  value={getVenueTypeLabel(data.venueType)}
                />
                <DetailRow
                  icon="sunny-outline"
                  iconColor="#6366F1"
                  label="Alan Tipi"
                  value={getIndoorOutdoorLabel(data.indoorOutdoor)}
                  borderBottom={false}
                />
              </View>

              {/* Capacity & Seating */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>KAPASİTE</Text>
                <DetailRow
                  icon="people-outline"
                  iconColor="#3B82F6"
                  label="Toplam Kapasite"
                  value={data.capacity?.toLocaleString('tr-TR') || '-'}
                />
                {data.seatingType && (
                  <DetailRow
                    icon="grid-outline"
                    iconColor="#8B5CF6"
                    label="Oturma Düzeni"
                    value={getSeatingTypeLabel(data.seatingType)}
                    borderBottom={false}
                  />
                )}
              </View>

              {/* Stage Dimensions */}
              {(data.stageWidth || data.stageDepth || data.stageHeight || selectedHall) && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SAHNE ÖLÇÜLERİ</Text>
                  <View style={styles.stageGrid}>
                    <View style={[styles.stageItem, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
                      <Text style={[styles.stageValue, { color: colors.text }]}>
                        {selectedHall?.stageWidth || data.stageWidth || '-'}
                      </Text>
                      <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>Genişlik (m)</Text>
                    </View>
                    <View style={[styles.stageItem, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
                      <Text style={[styles.stageValue, { color: colors.text }]}>
                        {selectedHall?.stageDepth || data.stageDepth || '-'}
                      </Text>
                      <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>Derinlik (m)</Text>
                    </View>
                    <View style={[styles.stageItem, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}>
                      <Text style={[styles.stageValue, { color: colors.text }]}>
                        {selectedHall?.stageHeight || data.stageHeight || '-'}
                      </Text>
                      <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>Yükseklik (m)</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Backstage */}
              {data.backstage?.hasBackstage && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>KULİS</Text>
                  {data.backstage.roomCount && (
                    <DetailRow
                      icon="bed-outline"
                      iconColor="#8B5CF6"
                      label="Oda Sayısı"
                      value={data.backstage.roomCount}
                    />
                  )}
                  <View style={styles.amenitiesRow}>
                    {data.backstage.hasMirror && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Ayna</Text>
                      </View>
                    )}
                    {data.backstage.hasShower && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Duş</Text>
                      </View>
                    )}
                    {data.backstage.hasPrivateToilet && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Özel WC</Text>
                      </View>
                    )}
                    {data.backstage.cateringAvailable && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F0FDF4' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Catering</Text>
                      </View>
                    )}
                  </View>
                  {data.backstage.notes && (
                    <Text style={[styles.backstageNotes, { color: colors.textSecondary }]}>
                      {data.backstage.notes}
                    </Text>
                  )}
                </View>
              )}

              {/* Technical Facilities */}
              {(data.hasSoundSystem || data.hasLightingSystem || data.hasParkingArea) && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TEKNİK İMKANLAR</Text>
                  <View style={styles.amenitiesRow}>
                    {data.hasSoundSystem && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#EFF6FF' }]}>
                        <Ionicons name="volume-high-outline" size={12} color="#3B82F6" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Ses Sistemi</Text>
                      </View>
                    )}
                    {data.hasLightingSystem && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#FEF3C7' }]}>
                        <Ionicons name="bulb-outline" size={12} color="#F59E0B" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>Işık Sistemi</Text>
                      </View>
                    )}
                    {data.hasParkingArea && (
                      <View style={[styles.amenityBadge, { backgroundColor: isDark ? '#27272A' : '#F3E8FF' }]}>
                        <Ionicons name="car-outline" size={12} color="#8B5CF6" />
                        <Text style={[styles.amenityText, { color: colors.text }]}>
                          Otopark {data.parkingCapacity ? `(${data.parkingCapacity})` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Contact */}
              {(data.contactName || data.contactPhone) && (
                <View style={[styles.section, { marginBottom: 40 }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>İLETİŞİM</Text>
                  {data.contactName && (
                    <DetailRow
                      icon="person-outline"
                      iconColor="#6366F1"
                      label="İletişim Kişisi"
                      value={data.contactName}
                    />
                  )}
                  {data.contactPhone && (
                    <DetailRow
                      icon="call-outline"
                      iconColor="#10B981"
                      label="Telefon"
                      value={data.contactPhone}
                      borderBottom={false}
                    />
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  venueAddress: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 11,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  imagesScroll: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  modalImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  stageGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  stageItem: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  stageValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 11,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  backstageNotes: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default VenueModule;

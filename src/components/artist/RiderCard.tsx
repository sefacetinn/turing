import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import {
  TechnicalRider,
  TransportRider,
  AccommodationRider,
  BackstageRider,
  RiderDocument,
} from '../../data/provider/artistData';

type RiderType = 'technical' | 'transport' | 'accommodation' | 'backstage';

interface RiderCardProps {
  type: RiderType;
  rider?: TechnicalRider | TransportRider | AccommodationRider | BackstageRider;
  document?: RiderDocument;
  onPress?: () => void;
  onEdit?: () => void;
}

const riderConfig: Record<
  RiderType,
  { icon: string; label: string; color: string }
> = {
  technical: {
    icon: 'hardware-chip-outline',
    label: 'Teknik Rider',
    color: '#6366F1',
  },
  transport: {
    icon: 'car-outline',
    label: 'Ulaşım Rider',
    color: '#F59E0B',
  },
  accommodation: {
    icon: 'bed-outline',
    label: 'Konaklama Rider',
    color: '#10B981',
  },
  backstage: {
    icon: 'cafe-outline',
    label: 'Backstage Rider',
    color: '#EC4899',
  },
};

function getRiderSummary(
  type: RiderType,
  rider?: TechnicalRider | TransportRider | AccommodationRider | BackstageRider
): string[] {
  if (!rider) return ['Henüz eklenmedi'];

  switch (type) {
    case 'technical': {
      const tech = rider as TechnicalRider;
      const items: string[] = [];
      if (tech.stage) {
        items.push(`Sahne: ${tech.stage.minWidth}x${tech.stage.minDepth}m`);
      }
      if (tech.sound) {
        items.push(`Ses: ${(tech.sound.minPower / 1000).toFixed(0)}kW`);
      }
      if (tech.lighting) {
        items.push(`Işık: ${tech.lighting.movingHeadCount} MH`);
      }
      return items.length > 0 ? items : ['Detaylar mevcut'];
    }
    case 'transport': {
      const trans = rider as TransportRider;
      const items: string[] = [];
      if (trans.airportTransfer?.required) {
        items.push(`${trans.airportTransfer.vehicleType} - ${trans.airportTransfer.passengerCount} kişi`);
      }
      if (trans.localTransport?.required) {
        items.push(`Şehir içi: ${trans.localTransport.availableHours}`);
      }
      return items.length > 0 ? items : ['Detaylar mevcut'];
    }
    case 'accommodation': {
      const acc = rider as AccommodationRider;
      const items: string[] = [];
      if (acc.artistRooms) {
        items.push(`${acc.artistRooms.minStarRating}★ ${acc.artistRooms.count} ${acc.artistRooms.type}`);
      }
      if (acc.crewRooms) {
        items.push(`Ekip: ${acc.crewRooms.count} oda`);
      }
      if (acc.meals?.breakfast) {
        items.push('Kahvaltı dahil');
      }
      return items.length > 0 ? items : ['Detaylar mevcut'];
    }
    case 'backstage': {
      const back = rider as BackstageRider;
      const items: string[] = [];
      if (back.dressingRoom) {
        items.push(`${back.dressingRoom.count} soyunma odası`);
      }
      if (back.catering?.hotMeals) {
        items.push('Sıcak yemek');
      }
      return items.length > 0 ? items : ['Detaylar mevcut'];
    }
    default:
      return ['Detaylar mevcut'];
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function RiderCard({
  type,
  rider,
  document,
  onPress,
  onEdit,
}: RiderCardProps) {
  const { colors } = useTheme();
  const config = riderConfig[type];
  const isComplete = !!rider;
  const summary = getRiderSummary(type, rider);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isComplete ? config.color + '40' : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.color + '20' },
          ]}
        >
          <Ionicons
            name={config.icon as any}
            size={24}
            color={config.color}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {config.label}
          </Text>
          <View style={styles.statusContainer}>
            {isComplete ? (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10B981"
                />
                <Text style={[styles.statusText, { color: '#10B981' }]}>
                  Tamamlandı
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color="#F59E0B"
                />
                <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                  Eksik
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        {summary.map((item, index) => (
          <Text
            key={index}
            style={[styles.summaryText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item}
          </Text>
        ))}
      </View>

      {document && (
        <View
          style={[
            styles.documentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.documentName, { color: colors.text }]}
            numberOfLines={1}
          >
            {document.fileName}
          </Text>
          <Text style={[styles.documentSize, { color: colors.textSecondary }]}>
            ({formatFileSize(document.fileSize)})
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onPress}
        >
          <Ionicons
            name="eye-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Görüntüle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onEdit}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {isComplete ? 'Düzenle' : 'Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    marginBottom: 2,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 13,
  },
  documentSize: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

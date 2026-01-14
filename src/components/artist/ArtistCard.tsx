import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Artist, getArtistRiderStatus } from '../../data/provider/artistData';
import RiderStatusBadge from './RiderStatusBadge';

interface ArtistCardProps {
  artist: Artist;
  onPress?: () => void;
  onEdit?: () => void;
  onRiders?: () => void;
}

export default function ArtistCard({
  artist,
  onPress,
  onEdit,
  onRiders,
}: ArtistCardProps) {
  const { colors } = useTheme();
  const riderStatus = getArtistRiderStatus(artist);

  const getStatusColor = () => {
    switch (artist.status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#9CA3AF';
      case 'on_tour':
        return '#6366F1';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (artist.status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'on_tour':
        return 'Turda';
      default:
        return artist.status;
    }
  };

  const getAvailabilityLabel = () => {
    switch (artist.availability) {
      case 'available':
        return 'Müsait';
      case 'busy':
        return 'Meşgul';
      case 'limited':
        return 'Sınırlı';
      default:
        return artist.availability;
    }
  };

  const completedRiders = [
    riderStatus.technical,
    riderStatus.transport,
    riderStatus.accommodation,
    riderStatus.backstage,
  ].filter(Boolean).length;

  const missingRiders: string[] = [];
  if (!riderStatus.technical) missingRiders.push('Teknik');
  if (!riderStatus.transport) missingRiders.push('Ulaşım');
  if (!riderStatus.accommodation) missingRiders.push('Konaklama');
  if (!riderStatus.backstage) missingRiders.push('Backstage');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with image and basic info */}
      <View style={styles.header}>
        <Image source={{ uri: artist.image }} style={styles.image} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              {artist.stageName || artist.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.rating, { color: colors.text }]}>
                {artist.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text style={[styles.genre, { color: colors.textSecondary }]}>
            {artist.genre.join(', ')}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() + '20' },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
              />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusLabel()}
              </Text>
            </View>
            <Text style={[styles.availability, { color: colors.textSecondary }]}>
              {getAvailabilityLabel()}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Crew and Rider info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons
            name="people-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {artist.crew.length} ekip üyesi
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {completedRiders}/4 rider yüklü
          </Text>
          {completedRiders > 0 && (
            <View style={styles.riderBadges}>
              {riderStatus.technical && (
                <RiderStatusBadge
                  type="technical"
                  isComplete={true}
                  showLabel={false}
                  size="small"
                />
              )}
              {riderStatus.transport && (
                <RiderStatusBadge
                  type="transport"
                  isComplete={true}
                  showLabel={false}
                  size="small"
                />
              )}
              {riderStatus.accommodation && (
                <RiderStatusBadge
                  type="accommodation"
                  isComplete={true}
                  showLabel={false}
                  size="small"
                />
              )}
              {riderStatus.backstage && (
                <RiderStatusBadge
                  type="backstage"
                  isComplete={true}
                  showLabel={false}
                  size="small"
                />
              )}
            </View>
          )}
        </View>

        {missingRiders.length > 0 && missingRiders.length < 4 && (
          <View style={styles.warningRow}>
            <Ionicons name="alert-circle" size={16} color="#F59E0B" />
            <Text style={[styles.warningText, { color: '#F59E0B' }]}>
              {missingRiders.join(', ')} rider eksik
            </Text>
          </View>
        )}

        {artist.upcomingShows.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {artist.upcomingShows.length} yaklaşan gösteri
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onPress}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Detay
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Düzenle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor:
                completedRiders < 4 ? '#F59E0B' + '20' : colors.background,
            },
          ]}
          onPress={onRiders}
        >
          <Ionicons
            name="document-attach-outline"
            size={18}
            color={completedRiders < 4 ? '#F59E0B' : colors.primary}
          />
          <Text
            style={[
              styles.actionText,
              { color: completedRiders < 4 ? '#F59E0B' : colors.primary },
            ]}
          >
            Rider'lar
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  genre: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availability: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  riderBadges: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingLeft: 26,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
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

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import { OrganizerOffer } from '../../data/offersData';
import { OptimizedImage } from '../OptimizedImage';
import {
  getCategoryGradient,
  getCategoryIcon,
  getCategoryShortLabel,
} from '../../utils/categoryHelpers';

const needsOrganizerResponse = (offer: OrganizerOffer): boolean => {
  if (offer.status === 'quoted') return true;
  if (offer.status === 'counter_offered' && offer.counterOffer?.by === 'provider') return true;
  return false;
};

interface OrganizerOfferCardProps {
  offer: OrganizerOffer;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: () => void;
}

export function OrganizerOfferCard({ offer, onPress, onAccept, onReject, onCounterOffer }: OrganizerOfferCardProps) {
  const { colors, isDark } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted': return { label: 'Onaylandı', color: '#10B981', icon: 'checkmark-circle' };
      case 'pending': return { label: 'Bekleniyor', color: '#F59E0B', icon: 'time' };
      case 'quoted': return { label: 'Teklif Geldi', color: '#10B981', icon: 'document-text' };
      case 'counter_offered':
        return offer.counterOffer?.by === 'provider'
          ? { label: 'Yanıt Geldi', color: '#8B5CF6', icon: 'swap-horizontal' }
          : { label: 'Yanıt Bekleniyor', color: '#F59E0B', icon: 'time' };
      case 'rejected': return { label: 'Reddedildi', color: '#EF4444', icon: 'close-circle' };
      default: return { label: status, color: colors.textMuted, icon: 'help-circle' };
    }
  };

  const statusConfig = getStatusConfig(offer.status);
  const showActions = needsOrganizerResponse(offer);
  const currentAmount = offer.counterOffer?.amount ?? offer.amount ?? 0;
  const isCompleted = offer.status === 'accepted' || offer.status === 'rejected';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF' },
        showActions && { borderLeftWidth: 3, borderLeftColor: '#10B981' },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Main Content */}
      <View style={styles.content}>
        {/* Left: Provider Image */}
        <View style={styles.imageContainer}>
          <OptimizedImage source={offer.provider.image} style={styles.providerImage} />
          {offer.provider.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.brand[500] }]}>
              <Ionicons name="checkmark" size={8} color="white" />
            </View>
          )}
        </View>

        {/* Center: Info */}
        <View style={styles.info}>
          {/* Provider & Category */}
          <View style={styles.topRow}>
            <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
              {offer.provider.name}
            </Text>
            <LinearGradient
              colors={getCategoryGradient(offer.serviceCategory)}
              style={styles.categoryBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={getCategoryIcon(offer.serviceCategory) as keyof typeof Ionicons.glyphMap}
                size={10}
                color="white"
              />
              <Text style={styles.categoryText}>
                {getCategoryShortLabel(offer.serviceCategory)}
              </Text>
            </LinearGradient>
          </View>

          {/* Event Title or Artist */}
          <Text style={[styles.eventTitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {offer.artistName || offer.eventTitle}
          </Text>

          {/* Date & Location */}
          <View style={styles.metaRow}>
            {offer.eventDate && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{offer.eventDate}</Text>
              </View>
            )}
            {(offer.eventCity || offer.eventDistrict) && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {offer.eventDistrict ? `${offer.eventDistrict}, ${offer.eventCity}` : offer.eventCity}
                </Text>
              </View>
            )}
          </View>

          {/* Venue */}
          {offer.eventVenue && (
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>{offer.eventVenue}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Right: Amount & Status */}
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: colors.text }]}>
            ₺{currentAmount.toLocaleString('tr-TR')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons - Only when response needed */}
      {showActions && (
        <View style={[styles.actions, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={onReject}
          >
            <Ionicons name="close" size={16} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.counterBtn, { borderColor: colors.brand[400] }]}
            onPress={onCounterOffer}
          >
            <Ionicons name="swap-horizontal" size={14} color={colors.brand[400]} />
            <Text style={[styles.counterText, { color: colors.brand[400] }]}>Pazarlık</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.acceptGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark" size={14} color="white" />
              <Text style={styles.acceptText}>Kabul</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <View style={[styles.completedRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
          <Ionicons
            name={offer.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
            size={14}
            color={offer.status === 'accepted' ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.completedText, { color: colors.textMuted }]}>
            {offer.status === 'accepted' ? 'Anlaşma tamamlandı' : 'Teklif reddedildi'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingVertical: 18,
    gap: 14,
  },
  imageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  counterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  completedText: {
    flex: 1,
    fontSize: 12,
  },
});

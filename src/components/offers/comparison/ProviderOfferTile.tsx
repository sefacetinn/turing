import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import type { EnhancedOffer } from '../../../types/comparison';
import { formatPrice } from '../../../utils/offerUtils';

interface ProviderOfferTileProps {
  offer: EnhancedOffer;
  badge?: string | null;
  isRecommended?: boolean;
  onPress: () => void;
  onSelect: () => void;
}

export function ProviderOfferTile({
  offer,
  badge,
  isRecommended,
  onPress,
  onSelect,
}: ProviderOfferTileProps) {
  const { colors, isDark } = useTheme();

  const accentColor = '#6366f1';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8f9fa',
          borderColor: isRecommended ? accentColor : (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Badge */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {isRecommended && !badge && (
        <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
          <Ionicons name="sparkles" size={10} color="white" />
          <Text style={styles.badgeText}>Önerilen</Text>
        </View>
      )}

      {/* Provider Info */}
      <View style={styles.providerSection}>
        <Image source={{ uri: offer.provider.image }} style={styles.providerImage} />
        {offer.provider.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.background }]}>
            <Ionicons name="checkmark-circle" size={14} color={accentColor} />
          </View>
        )}
      </View>

      <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
        {offer.provider.name}
      </Text>

      {/* Price */}
      <Text style={[styles.price, { color: colors.text }]}>
        {formatPrice(offer.amount)}
      </Text>

      {/* Rating & Delivery */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={[styles.metricText, { color: colors.textMuted }]}>
            {offer.provider.rating} ({offer.provider.reviewCount})
          </Text>
        </View>
      </View>

      <View style={styles.deliveryRow}>
        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
        <Text style={[styles.deliveryText, { color: colors.textMuted }]}>
          {offer.deliveryTime}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.detailButton, { borderColor: accentColor }]}
          onPress={onPress}
        >
          <Text style={[styles.detailButtonText, { color: accentColor }]}>Detay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: accentColor }]}
          onPress={onSelect}
        >
          <Text style={styles.selectButtonText}>Seç</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
  },
  providerSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: 36,
    borderRadius: 10,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});

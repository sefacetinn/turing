import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ProviderCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  image: string;
  onPress: () => void;
}

export function ProviderCard({
  name,
  category,
  rating,
  reviews,
  location,
  verified,
  image,
  onPress,
}: ProviderCardProps) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {verified && (
          <View style={[styles.verifiedBadge, { borderColor: colors.background, backgroundColor: colors.brand[500] }]}>
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <View style={styles.meta}>
          <Text style={[styles.category, { color: colors.brand[400] }]}>{category}</Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
          <Ionicons name="location" size={10} color={colors.textMuted} />
          <Text style={[styles.location, { color: colors.textMuted }]}>{location}</Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={[styles.ratingText, { color: colors.text }]}>{rating}</Text>
        </View>
        <Text style={[styles.reviewCount, { color: colors.textMuted }]}>{reviews} yorum</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    fontSize: 10,
  },
  location: {
    fontSize: 12,
  },
  ratingContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 11,
  },
});

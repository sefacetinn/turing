import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ArtistCardProps {
  id: string;
  name: string;
  genre: string;
  image: string;
  rating: number;
  onPress: () => void;
}

export function ArtistCard({ name, genre, image, rating, onPress }: ArtistCardProps) {
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
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.genre, { color: colors.textMuted }]} numberOfLines={1}>
          {genre}
        </Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={[styles.ratingText, { color: colors.text }]}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 100,
  },
  info: {
    padding: 12,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  genre: {
    fontSize: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

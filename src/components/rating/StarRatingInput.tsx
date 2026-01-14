import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface StarRatingInputProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showLabel?: boolean;
  maxStars?: number;
}

const STAR_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
};

const getRatingLabel = (rating: number): string => {
  if (rating === 0) return 'Seçiniz';
  if (rating === 1) return 'Çok Kötü';
  if (rating === 2) return 'Kötü';
  if (rating === 3) return 'Orta';
  if (rating === 4) return 'İyi';
  if (rating === 5) return 'Mükemmel';
  return '';
};

export function StarRatingInput({
  rating,
  onRatingChange,
  size = 'medium',
  disabled = false,
  showLabel = false,
  maxStars = 5,
}: StarRatingInputProps) {
  const { colors, isDark } = useTheme();
  const starSize = STAR_SIZES[size];
  const gap = size === 'small' ? 2 : size === 'medium' ? 4 : 6;

  const handlePress = (selectedRating: number) => {
    if (!disabled && onRatingChange) {
      // Allow deselecting by pressing the same star
      onRatingChange(selectedRating === rating ? 0 : selectedRating);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= rating;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(starNumber)}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        style={{ padding: 2 }}
      >
        <Ionicons
          name={isFilled ? 'star' : 'star-outline'}
          size={starSize}
          color={isFilled ? '#fbbf24' : isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.starsContainer, { gap }]}>
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: rating > 0 ? '#fbbf24' : colors.textMuted,
              fontSize: size === 'small' ? 11 : size === 'medium' ? 13 : 15,
            },
          ]}
        >
          {getRatingLabel(rating)}
        </Text>
      )}
    </View>
  );
}

// Read-only star display component
interface StarRatingDisplayProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRatingDisplay({
  rating,
  size = 'small',
  showValue = true,
  reviewCount,
}: StarRatingDisplayProps) {
  const { colors, isDark } = useTheme();
  const starSize = STAR_SIZES[size];

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.displayContainer}>
      <View style={styles.starsRow}>
        {Array.from({ length: fullStars }, (_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={starSize} color="#fbbf24" />
        ))}
        {hasHalfStar && (
          <Ionicons name="star-half" size={starSize} color="#fbbf24" />
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Ionicons
            key={`empty-${i}`}
            name="star-outline"
            size={starSize}
            color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}
          />
        ))}
      </View>
      {showValue && (
        <Text
          style={[
            styles.ratingValue,
            {
              color: colors.text,
              fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
            },
          ]}
        >
          {rating.toFixed(1)}
        </Text>
      )}
      {reviewCount !== undefined && (
        <Text
          style={[
            styles.reviewCount,
            {
              color: colors.textMuted,
              fontSize: size === 'small' ? 11 : size === 'medium' ? 12 : 14,
            },
          ]}
        >
          ({reviewCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginTop: 6,
    fontWeight: '500',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewCount: {
    marginLeft: 4,
  },
});

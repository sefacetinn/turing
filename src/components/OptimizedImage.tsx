import React, { memo } from 'react';
import { StyleSheet, View, StyleProp, ImageStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';

// Blur hash placeholders for different colors
const BLUR_HASHES = {
  dark: 'L6PZfSi_.AyE_3t7t7R**0telepo', // Dark gray blur
  light: 'L5H2EC=PM+yV0g-mq.wG9c010J}I', // Light gray blur
  purple: 'L4TSUA-;fQ-;_3fQfQfQ?bfQfQfQ', // Purple tint blur
};

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  placeholder?: keyof typeof BLUR_HASHES | string;
  transition?: number;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  recyclingKey?: string;
  accessibilityLabel?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage - expo-image wrapper for better performance
 *
 * Features:
 * - Automatic caching (memory + disk)
 * - Blur placeholder during load
 * - Smooth fade-in transition
 * - Priority loading support
 * - Memory efficient recycling
 */
export const OptimizedImage = memo(function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  placeholder = 'dark',
  transition = 200,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  recyclingKey,
  accessibilityLabel,
  onLoad,
  onError,
}: OptimizedImageProps) {
  // Normalize source to URI string
  const uri = typeof source === 'string' ? source : source?.uri;

  // Get blur hash placeholder
  const blurHash = BLUR_HASHES[placeholder as keyof typeof BLUR_HASHES] || placeholder;

  if (!uri) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      placeholder={{ blurhash: blurHash }}
      transition={transition}
      priority={priority}
      cachePolicy={cachePolicy}
      recyclingKey={recyclingKey}
      accessibilityLabel={accessibilityLabel}
      onLoad={onLoad}
      onError={onError}
    />
  );
});

/**
 * Avatar component with circular styling
 */
interface AvatarProps extends Omit<OptimizedImageProps, 'contentFit'> {
  size?: number;
}

export const Avatar = memo(function Avatar({
  size = 48,
  style,
  ...props
}: AvatarProps) {
  return (
    <OptimizedImage
      {...props}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      contentFit="cover"
    />
  );
});

/**
 * Thumbnail component for list items
 */
interface ThumbnailProps extends Omit<OptimizedImageProps, 'contentFit' | 'priority'> {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export const Thumbnail = memo(function Thumbnail({
  width = 80,
  height = 80,
  borderRadius = 12,
  style,
  ...props
}: ThumbnailProps) {
  return (
    <OptimizedImage
      {...props}
      style={[{ width, height, borderRadius }, style]}
      contentFit="cover"
      priority="low"
      cachePolicy="memory-disk"
    />
  );
});

/**
 * Cover image component for cards and headers
 */
interface CoverImageProps extends Omit<OptimizedImageProps, 'contentFit'> {
  aspectRatio?: number;
  borderRadius?: number;
}

export const CoverImage = memo(function CoverImage({
  aspectRatio = 16 / 9,
  borderRadius = 16,
  style,
  ...props
}: CoverImageProps) {
  return (
    <OptimizedImage
      {...props}
      style={[{ width: '100%', aspectRatio, borderRadius }, style]}
      contentFit="cover"
      priority="normal"
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

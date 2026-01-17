import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { StarRatingDisplay } from './StarRatingInput';
import { TagDisplay, PROVIDER_REVIEW_TAGS, ORGANIZER_REVIEW_TAGS } from './TagSelector';

interface Review {
  id: string;
  reviewerName: string;
  reviewerImage: string;
  reviewerType: 'organizer' | 'provider';
  overallRating: number;
  comment?: string;
  tags: string[];
  wouldWorkAgain: boolean;
  createdAt: string;
  eventTitle?: string;
  serviceCategory?: string;
}

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const { colors, isDark, helpers } = useTheme();

  const tagList = review.reviewerType === 'organizer' ? PROVIDER_REVIEW_TAGS : ORGANIZER_REVIEW_TAGS;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        isDark ? {} : helpers.getShadow('sm'),
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.reviewerInfo}>
          {review.reviewerImage ? (
            <Image source={{ uri: review.reviewerImage }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.1)' },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.brand[400] }]}>
                {getInitials(review.reviewerName)}
              </Text>
            </View>
          )}
          <View style={styles.reviewerDetails}>
            <Text style={[styles.reviewerName, { color: colors.text }]}>
              {review.reviewerName}
            </Text>
            <Text style={[styles.reviewerMeta, { color: colors.textMuted }]}>
              {review.reviewerType === 'organizer' ? 'Organizatör' : 'Sağlayıcı'} • {review.createdAt}
            </Text>
          </View>
        </View>
        <StarRatingDisplay rating={review.overallRating} size="small" showValue={true} />
      </View>

      {/* Event/Service Badges */}
      {(review.eventTitle || review.serviceCategory) && (
        <View style={styles.badges}>
          {review.serviceCategory && (
            <View
              style={[
                styles.badge,
                { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.brand[400] }]}>
                {review.serviceCategory}
              </Text>
            </View>
          )}
          {review.eventTitle && (
            <View
              style={[
                styles.badge,
                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.info }]}>
                {review.eventTitle}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Comment */}
      {review.comment && !compact && (
        <Text
          style={[styles.comment, { color: colors.textSecondary }]}
          numberOfLines={compact ? 2 : undefined}
        >
          "{review.comment}"
        </Text>
      )}

      {/* Tags */}
      {review.tags.length > 0 && !compact && (
        <View style={styles.tagsContainer}>
          <TagDisplay tags={review.tags} tagList={tagList} size="small" />
        </View>
      )}

      {/* Would Work Again */}
      {review.wouldWorkAgain && (
        <View style={styles.wouldWorkAgain}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.wouldWorkAgainText, { color: colors.success }]}>
            Tekrar çalışır
          </Text>
        </View>
      )}
    </View>
  );
}

// Mini review card for list views
interface MiniReviewCardProps {
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  comment?: string;
  date: string;
}

export function MiniReviewCard({ reviewerName, reviewerImage, rating, comment, date }: MiniReviewCardProps) {
  const { colors, isDark } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[
        styles.miniContainer,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
      ]}
    >
      <View style={styles.miniHeader}>
        {reviewerImage ? (
          <Image source={{ uri: reviewerImage }} style={styles.miniAvatar} />
        ) : (
          <View
            style={[
              styles.miniAvatarPlaceholder,
              { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.1)' },
            ]}
          >
            <Text style={[styles.miniAvatarText, { color: colors.brand[400] }]}>
              {getInitials(reviewerName)}
            </Text>
          </View>
        )}
        <View style={styles.miniInfo}>
          <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>
            {reviewerName}
          </Text>
          <Text style={[styles.miniDate, { color: colors.textMuted }]}>{date}</Text>
        </View>
        <View style={styles.miniRating}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={[styles.miniRatingText, { color: colors.text }]}>{rating.toFixed(1)}</Text>
        </View>
      </View>
      {comment && (
        <Text style={[styles.miniComment, { color: colors.textSecondary }]} numberOfLines={2}>
          "{comment}"
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
  },
  tagsContainer: {
    marginTop: 12,
  },
  wouldWorkAgain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  wouldWorkAgainText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Mini card styles
  miniContainer: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  miniAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniInfo: {
    marginLeft: 10,
    flex: 1,
  },
  miniName: {
    fontSize: 13,
    fontWeight: '500',
  },
  miniDate: {
    fontSize: 11,
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  miniRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  miniComment: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

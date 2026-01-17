import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface RatingBreakdownItem {
  label: string;
  value: number;
}

interface RatingBreakdownProps {
  ratings: RatingBreakdownItem[];
  showTitle?: boolean;
  title?: string;
}

export function RatingBreakdown({
  ratings,
  showTitle = true,
  title = 'Değerlendirme Detayları',
}: RatingBreakdownProps) {
  const { colors, isDark, helpers } = useTheme();

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
      {showTitle && (
        <View style={styles.header}>
          <Ionicons name="analytics-outline" size={16} color={colors.brand[400]} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      )}

      <View style={styles.ratingsContainer}>
        {ratings.map((item, index) => (
          <View
            key={index}
            style={[
              styles.ratingRow,
              index < ratings.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border,
              },
            ]}
          >
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <View style={styles.ratingBarContainer}>
              <View
                style={[
                  styles.ratingBar,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
                ]}
              >
                <View
                  style={[
                    styles.ratingBarFill,
                    {
                      width: `${(item.value / 5) * 100}%`,
                      backgroundColor: getRatingColor(item.value),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.ratingValue, { color: colors.text }]}>
                {item.value.toFixed(1)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Inline version for compact display
interface InlineRatingBreakdownProps {
  ratings: RatingBreakdownItem[];
}

export function InlineRatingBreakdown({ ratings }: InlineRatingBreakdownProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.inlineContainer}>
      {ratings.map((item, index) => (
        <View key={index} style={styles.inlineItem}>
          <Text style={[styles.inlineLabel, { color: colors.textMuted }]}>{item.label}</Text>
          <View style={styles.inlineValueContainer}>
            <Ionicons name="star" size={10} color="#fbbf24" />
            <Text style={[styles.inlineValue, { color: colors.text }]}>
              {item.value.toFixed(1)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Summary stats component
interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  wouldWorkAgainPercent: number;
  topTags?: { tag: string; count: number }[];
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  wouldWorkAgainPercent,
  topTags,
}: ReviewSummaryProps) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View
      style={[
        styles.summaryContainer,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border,
        },
        isDark ? {} : helpers.getShadow('sm'),
      ]}
    >
      <View style={styles.summaryMain}>
        <View style={styles.summaryRating}>
          <Text style={[styles.summaryRatingValue, { color: colors.text }]}>
            {averageRating.toFixed(1)}
          </Text>
          <View style={styles.summaryStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons
                key={star}
                name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                size={14}
                color="#fbbf24"
              />
            ))}
          </View>
          <Text style={[styles.summaryReviewCount, { color: colors.textMuted }]}>
            {totalReviews} değerlendirme
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]} />

        <View style={styles.summaryWorkAgain}>
          <Ionicons name="thumbs-up" size={20} color={colors.success} />
          <Text style={[styles.summaryWorkAgainValue, { color: colors.text }]}>
            %{wouldWorkAgainPercent}
          </Text>
          <Text style={[styles.summaryWorkAgainLabel, { color: colors.textMuted }]}>
            Tekrar çalışır
          </Text>
        </View>
      </View>

      {topTags && topTags.length > 0 && (
        <View style={styles.summaryTags}>
          <Text style={[styles.summaryTagsTitle, { color: colors.textMuted }]}>
            En çok kullanılan etiketler:
          </Text>
          <View style={styles.summaryTagsList}>
            {topTags.slice(0, 3).map((item, index) => (
              <View
                key={index}
                style={[
                  styles.summaryTag,
                  { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.15)' : 'rgba(75, 48, 184, 0.08)' },
                ]}
              >
                <Text style={[styles.summaryTagText, { color: colors.brand[400] }]}>
                  {item.tag}
                </Text>
                <Text style={[styles.summaryTagCount, { color: colors.textMuted }]}>
                  ({item.count})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Helper function to get color based on rating
function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#10b981'; // Green
  if (rating >= 3.5) return '#22c55e'; // Light green
  if (rating >= 2.5) return '#fbbf24'; // Yellow
  if (rating >= 1.5) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingsContainer: {},
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inlineItem: {
    alignItems: 'center',
  },
  inlineLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  inlineValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inlineValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Summary styles
  summaryContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRating: {
    flex: 1,
    alignItems: 'center',
  },
  summaryRatingValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  summaryStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  summaryReviewCount: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  summaryWorkAgain: {
    flex: 1,
    alignItems: 'center',
  },
  summaryWorkAgainValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryWorkAgainLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryTags: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  summaryTagsTitle: {
    fontSize: 11,
    marginBottom: 8,
  },
  summaryTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  summaryTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryTagCount: {
    fontSize: 10,
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  eventType: string;
}

interface RouteParams {
  providerId: string;
  providerName: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export function ProviderReviewsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerName, reviews, rating, reviewCount } = route.params as RouteParams;
  const { colors, isDark, helpers } = useTheme();

  const renderStars = (starRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= starRating ? 'star' : 'star-outline'}
            size={14}
            color="#fbbf24"
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {providerName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Değerlendirmeler
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        <View style={[styles.summarySection, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground }]}>
          <View style={styles.summaryMain}>
            <Text style={[styles.ratingBig, { color: colors.text }]}>{rating.toFixed(1)}</Text>
            {renderStars(Math.round(rating))}
            <Text style={[styles.reviewCountText, { color: colors.textMuted }]}>
              {reviewCount} değerlendirme
            </Text>
          </View>

          {/* Rating Distribution */}
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <View key={star} style={styles.distributionRow}>
                  <Text style={[styles.distributionStar, { color: colors.textMuted }]}>{star}</Text>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <View style={[styles.distributionBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}>
                    <View
                      style={[
                        styles.distributionFill,
                        { width: `${percentage}%`, backgroundColor: colors.brand[400] },
                      ]}
                    />
                  </View>
                  <Text style={[styles.distributionCount, { color: colors.textMuted }]}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tüm Değerlendirmeler ({reviews.length})
          </Text>

          {reviews.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.cardBackground },
                ...(isDark ? [] : [helpers.getShadow('sm')]),
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={[styles.avatar, { backgroundColor: 'rgba(147, 51, 234, 0.2)' }]}>
                  <Text style={[styles.avatarText, { color: colors.brand[400] }]}>
                    {review.avatar || review.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>{review.name}</Text>
                  <View style={styles.reviewMeta}>
                    {renderStars(review.rating)}
                    <View style={[styles.eventTypeBadge, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
                      <Text style={[styles.eventTypeText, { color: colors.brand[400] }]}>
                        {review.eventType}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewText, { color: colors.textMuted }]}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  summarySection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 24,
  },
  summaryMain: {
    alignItems: 'center',
  },
  ratingBig: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewCountText: {
    fontSize: 13,
    marginTop: 8,
  },
  ratingDistribution: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distributionStar: {
    fontSize: 12,
    width: 12,
    textAlign: 'right',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    width: 20,
    textAlign: 'right',
  },
  reviewsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 21,
  },
});

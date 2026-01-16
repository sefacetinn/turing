/**
 * RatingModule - Değerlendirme Modülü
 *
 * Puanlama ve yorumları gösterir.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { RatingModuleData, ModuleConfig } from '../../../types/modules';

interface RatingModuleProps {
  data?: RatingModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: RatingModuleData) => void;
}

export const RatingModule: React.FC<RatingModuleProps> = ({ data, config, mode = 'view', onDataChange }) => {
  const { colors, isDark } = useTheme();
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Empty state for view mode
  if (!data || (mode === 'view' && !data.overallRating && (!data.reviews || data.reviews.length === 0))) {
    return (
      <View style={styles.empty}>
        <Ionicons name="star-outline" size={32} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Henüz değerlendirme yok
        </Text>
      </View>
    );
  }

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => {
            if (interactive && onDataChange) {
              onDataChange({ ...data, overallRating: i });
            }
          }}
        >
          <Ionicons
            name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
            size={size}
            color="#F59E0B"
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Mükemmel';
    if (rating >= 4) return 'Çok İyi';
    if (rating >= 3) return 'İyi';
    if (rating >= 2) return 'Orta';
    return 'Geliştirilebilir';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const displayReviews = data.reviews?.slice(0, 2) || [];

  return (
    <>
      <View style={styles.container}>
        {/* Overall Rating */}
        {data.overallRating && (
          <View style={[styles.ratingBox, { backgroundColor: isDark ? '#27272A' : '#FFFBEB' }]}>
            <View style={styles.ratingMain}>
              <Text style={[styles.ratingNumber, { color: colors.text }]}>
                {data.overallRating.toFixed(1)}
              </Text>
              <View style={styles.ratingDetails}>
                {renderStars(data.overallRating, 18)}
                <Text style={[styles.ratingLabel, { color: '#F59E0B' }]}>
                  {getRatingLabel(data.overallRating)}
                </Text>
              </View>
            </View>
            {data.reviewCount && (
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                {data.reviewCount} değerlendirme
              </Text>
            )}
          </View>
        )}

        {/* Reviews Preview */}
        {displayReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Yorumlar</Text>
            {displayReviews.map((review, index) => (
              <View
                key={review.id || index}
                style={[styles.reviewCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={[styles.reviewerAvatar, { backgroundColor: '#6366F1' }]}>
                      <Text style={styles.avatarText}>
                        {review.reviewerName?.charAt(0) || 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.reviewerName, { color: colors.text }]}>
                        {review.reviewerName || 'Anonim'}
                      </Text>
                      {review.createdAt && (
                        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                          {formatDate(review.createdAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                  {renderStars(review.rating, 14)}
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: colors.text }]} numberOfLines={3}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))}

            {data.reviews && data.reviews.length > 2 && (
              <TouchableOpacity
                style={[styles.showMoreBtn, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}
                onPress={() => setShowAllReviews(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  Tüm Yorumları Gör ({data.reviews.length})
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* All Reviews Modal */}
      <Modal visible={showAllReviews} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tüm Değerlendirmeler</Text>
            <TouchableOpacity onPress={() => setShowAllReviews(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {data.reviews?.map((review, index) => (
              <View
                key={review.id || index}
                style={[styles.modalReviewCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={[styles.reviewerAvatar, { backgroundColor: '#6366F1' }]}>
                      <Text style={styles.avatarText}>
                        {review.reviewerName?.charAt(0) || 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.reviewerName, { color: colors.text }]}>
                        {review.reviewerName || 'Anonim'}
                      </Text>
                      {review.createdAt && (
                        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                          {formatDate(review.createdAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                  {renderStars(review.rating, 16)}
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: colors.text }]}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  ratingBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  ratingDetails: {
    alignItems: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginTop: 8,
  },
  reviewsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 11,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalReviewCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
});

export default RatingModule;

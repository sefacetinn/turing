import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import {
  ReviewCard,
  PendingReviewCard,
  ReviewSummary,
  RatingBreakdown,
  RatingModal,
} from '../components/rating';
import {
  calculateRatingBreakdown,
  calculateTopTags,
  calculateAverageRating,
  calculateWouldWorkAgainPercent,
  Review,
} from '../data/reviewData';

// TODO: Fetch reviews from Firebase
// Empty arrays for production
const mockReceivedReviews: Review[] = [];
const mockGivenReviews: Review[] = [];
const mockPendingReviews: any[] = [];
const mockPendingProviderReviews: any[] = [];
const mockOrganizerReceivedReviews: Review[] = [];
const mockOrganizerGivenReviews: Review[] = [];
import { useApp } from '../../App';

type TabType = 'pending' | 'given' | 'received';

export function MyReviewsScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();
  const { isProviderMode } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [refreshing, setRefreshing] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string;
    name: string;
    image: string;
    type: 'provider' | 'organizer';
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    date: string;
    serviceCategory?: string;
  } | null>(null);

  // Use context to determine mode
  const pendingReviews = isProviderMode ? mockPendingReviews : mockPendingProviderReviews;
  const receivedReviews = isProviderMode ? mockReceivedReviews : mockOrganizerReceivedReviews;
  const givenReviews = isProviderMode ? mockGivenReviews : mockOrganizerGivenReviews;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const receivedStats = useMemo(() => {
    return {
      average: calculateAverageRating(receivedReviews),
      total: receivedReviews.length,
      wouldWorkAgain: calculateWouldWorkAgainPercent(receivedReviews),
      breakdown: calculateRatingBreakdown(receivedReviews),
      topTags: calculateTopTags(receivedReviews),
    };
  }, [receivedReviews]);

  const givenStats = useMemo(() => {
    return {
      average: calculateAverageRating(givenReviews),
      total: givenReviews.length,
    };
  }, [givenReviews]);

  const handleReview = (target: {
    id: string;
    name: string;
    image: string;
    type: 'provider' | 'organizer';
    serviceCategory?: string;
  }, eventId: string, eventTitle: string, eventDate: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTarget({
      id: target.id,
      name: target.name,
      image: target.image,
      type: target.type,
    });
    setSelectedEvent({
      id: eventId,
      title: eventTitle,
      date: eventDate,
      serviceCategory: target.serviceCategory,
    });
    setRatingModalVisible(true);
  };

  const handleSubmitReview = (review: any) => {
    setRatingModalVisible(false);
    setSelectedTarget(null);
    setSelectedEvent(null);
    Alert.alert('Basarili', 'Degerlendirmeniz kaydedildi. Tesekkurler!');
  };

  const renderPendingTab = () => (
    <View style={styles.tabContent}>
      {pendingReviews.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Bekleyen Değerlendirmeler
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Tamamlanan etkinlikler için değerlendirme yapın
          </Text>
          {pendingReviews.map(pending => (
            <PendingReviewCard
              key={pending.id}
              eventId={pending.eventId}
              eventTitle={pending.eventTitle}
              eventDate={pending.eventDate}
              eventImage={pending.eventImage}
              targets={pending.targets}
              dueDate={pending.dueDate}
              onReview={(target) => handleReview(target, pending.eventId, pending.eventTitle, pending.eventDate)}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.05)' }]}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Tamamlandı!
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            Bekleyen değerlendirmeniz bulunmuyor.
          </Text>
        </View>
      )}
    </View>
  );

  const renderGivenTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.statsCard, {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.border
      }, isDark ? {} : helpers.getShadow('sm')]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {givenStats.average.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Ortalama verdiğim
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="create-outline" size={20} color={colors.brand[400]} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {givenStats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Değerlendirme
            </Text>
          </View>
        </View>
      </View>

      {givenReviews.length > 0 ? (
        <>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Yazdığım Değerlendirmeler
          </Text>
          {givenReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.05)' }]}>
            <Ionicons name="create-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Henüz değerlendirme yazmadınız
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            Tamamlanan etkinliklerden sonra değerlendirme yazabilirsiniz.
          </Text>
        </View>
      )}
    </View>
  );

  const renderReceivedTab = () => (
    <View style={styles.tabContent}>
      <ReviewSummary
        averageRating={receivedStats.average}
        totalReviews={receivedStats.total}
        wouldWorkAgainPercent={receivedStats.wouldWorkAgain}
        topTags={receivedStats.topTags}
      />

      {receivedStats.breakdown && receivedStats.breakdown.length > 0 && (
        <RatingBreakdown ratings={receivedStats.breakdown} />
      )}

      {receivedReviews.length > 0 ? (
        <>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            Aldığım Değerlendirmeler
          </Text>
          {receivedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(75, 48, 184, 0.1)' : 'rgba(75, 48, 184, 0.05)' }]}>
            <Ionicons name="star-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Henüz değerlendirme almadınız
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
            Etkinliklerde çalıştıkça değerlendirmeleriniz burada görünecek.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Değerlendirmelerim</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {[
            { key: 'pending', label: 'Bekleyen', count: pendingReviews.length },
            { key: 'given', label: 'Yazdıklarım' },
            { key: 'received', label: 'Aldıklarım' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.brand[400] : colors.textMuted }]}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
              </Text>
              {activeTab === tab.key && <View style={[styles.tabIndicator, { backgroundColor: colors.brand[400] }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[400]}
            colors={[colors.brand[400]]}
          />
        }
      >
        {activeTab === 'pending' && renderPendingTab()}
        {activeTab === 'given' && renderGivenTab()}
        {activeTab === 'received' && renderReceivedTab()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Rating Modal */}
      {selectedTarget && selectedEvent && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => {
            setRatingModalVisible(false);
            setSelectedTarget(null);
            setSelectedEvent(null);
          }}
          target={selectedTarget}
          event={selectedEvent}
          reviewerType={isProviderMode ? 'provider' : 'organizer'}
          onSubmit={handleSubmitReview}
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tabContent: {
    flex: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';
import {
  HomeHeader,
  SearchBar,
  QuickCreateCard,
  SectionHeader,
  CategoryCard,
  ProviderCard,
  ArtistCard,
  StatsCard,
} from '../components/home';
import {
  artists,
  categories,
  recentProviders,
  organizerUser,
  homeStats,
  providerStats,
  upcomingJobs,
  recentRequests,
} from '../data/homeData';
import type { HomeStackNavigationProp } from '../types';

interface HomeScreenProps {
  isProviderMode: boolean;
}

export function HomeScreen({ isProviderMode }: HomeScreenProps) {
  if (isProviderMode) {
    return <ProviderHomeContent />;
  }
  return <OrganizerHomeContent />;
}

// ============================================
// Organizer Home Content
// ============================================
function OrganizerHomeContent() {
  const navigation = useNavigation<HomeStackNavigationProp>();
  const { colors, isDark, helpers } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader
          userName={organizerUser.name}
          userRole={organizerUser.role}
          userImage={organizerUser.image}
          notificationCount={3}
          onNotificationPress={() => navigation.navigate('Notifications')}
        />

        <SearchBar
          placeholder="Sanatçı, mekan veya hizmet ara..."
          onPress={() => navigation.navigate('Search')}
        />

        <QuickCreateCard onPress={() => navigation.navigate('CreateEvent')} />

        <SectionHeader title="Hizmetler" onViewAll={() => {}} />

        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              onPress={() => navigation.navigate('ServiceProviders', { category: category.id as any })}
            />
          ))}
        </View>

        {/* Operation Category */}
        <OperationCard onPress={() => navigation.navigate('OperationSubcategories')} />

        <SectionHeader title="Son Görüntülenenler" onViewAll={() => {}} />

        <View>
          {recentProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              {...provider}
              onPress={() => navigation.navigate('ProviderDetail', { providerId: provider.id })}
            />
          ))}
        </View>

        <SectionHeader
          title="Popüler Sanatçılar"
          onViewAll={() => navigation.navigate('Search')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistsScroll}
        >
          {artists.slice(0, 4).map((artist) => (
            <ArtistCard
              key={artist.id}
              {...artist}
              onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.id })}
            />
          ))}
        </ScrollView>

        <StatsCard stats={homeStats} />

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Provider Home Content
// ============================================
function ProviderHomeContent() {
  const navigation = useNavigation<HomeStackNavigationProp>();
  const { colors, isDark, helpers } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Provider Header */}
        <ProviderHeader
          greeting={getGreeting()}
          companyName="EventPro 360"
          messageCount={5}
          notificationCount={12}
          onMessagesPress={() => navigation.navigate('MessagesTab' as any)}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />

        {/* Status Bar */}
        <ProviderStatusBar
          profileViews={providerStats.profileViews}
          rating={providerStats.rating}
          reviewCount={providerStats.reviewCount}
        />

        {/* Earnings Card */}
        <EarningsCard
          monthlyEarnings={providerStats.monthlyEarnings}
          pendingPayments={providerStats.pendingPayments}
          completedJobs={providerStats.completedJobs}
        />

        {/* Quick Stats */}
        <QuickStatsRow
          upcomingJobs={providerStats.upcomingJobs}
          pendingOffers={providerStats.pendingOffers}
          onOffersPress={() => navigation.navigate('OffersTab' as any)}
          onJobsPress={() => navigation.navigate('EventsTab' as any)}
        />

        <SectionHeader title="Yaklaşan İşler" onViewAll={() => navigation.navigate('EventsTab' as any)} />

        {upcomingJobs.map((job) => (
          <UpcomingJobCard
            key={job.id}
            {...job}
            onPress={() => navigation.navigate('ProviderEventDetail' as any, { eventId: job.id })}
          />
        ))}

        <SectionHeader title="Yeni Talepler" onViewAll={() => navigation.navigate('OffersTab' as any)} />

        {recentRequests.map((request) => (
          <RequestCard
            key={request.id}
            {...request}
            onPress={() => navigation.navigate('OfferDetail' as any, { offerId: request.id })}
          />
        ))}

        {/* Performance Card */}
        <PerformanceCard responseRate={providerStats.responseRate} />

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Shared Components
// ============================================

function OperationCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.operationCard} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={gradients.operation}
        style={styles.operationGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.operationIconBox}>
          <Ionicons name="settings" size={24} color="white" />
        </View>
        <View style={styles.operationContent}>
          <Text style={styles.operationTitle}>Operasyon</Text>
          <Text style={styles.operationSubtitle}>Güvenlik, Catering, Jeneratör ve 9 hizmet daha</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// Provider-specific Components
// ============================================

interface ProviderHeaderProps {
  greeting: string;
  companyName: string;
  messageCount: number;
  notificationCount: number;
  onMessagesPress: () => void;
  onNotificationsPress: () => void;
}

function ProviderHeader({
  greeting,
  companyName,
  messageCount,
  notificationCount,
  onMessagesPress,
  onNotificationsPress,
}: ProviderHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.providerHeader}>
      <View style={styles.providerHeaderTop}>
        <View>
          <Text style={[styles.greetingText, { color: colors.textMuted }]}>{greeting}</Text>
          <Text style={[styles.companyName, { color: colors.text }]}>{companyName}</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="chatbubble-outline" count={messageCount} onPress={onMessagesPress} />
          <IconButton icon="notifications-outline" count={notificationCount} onPress={onNotificationsPress} />
        </View>
      </View>
    </View>
  );
}

function IconButton({ icon, count, onPress }: { icon: string; count: number; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.iconButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={20} color={colors.textMuted} />
      {count > 0 && (
        <View style={[styles.iconBadge, { borderColor: colors.background }]}>
          <Text style={styles.iconBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ProviderStatusBar({
  profileViews,
  rating,
  reviewCount,
}: {
  profileViews: number;
  rating: number;
  reviewCount: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statusBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      <View style={styles.statusItem}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>Çevrimiçi</Text>
      </View>
      <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statusItem}>
        <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>{profileViews} görüntülenme</Text>
      </View>
      <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statusItem}>
        <Ionicons name="star" size={14} color="#fbbf24" />
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {rating} ({reviewCount})
        </Text>
      </View>
    </View>
  );
}

function EarningsCard({
  monthlyEarnings,
  pendingPayments,
  completedJobs,
}: {
  monthlyEarnings: number;
  pendingPayments: number;
  completedJobs: number;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View style={styles.earningsSection}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(147, 51, 234, 0.15)', 'rgba(99, 102, 241, 0.1)']
            : ['rgba(147, 51, 234, 0.1)', 'rgba(99, 102, 241, 0.05)']
        }
        style={[
          styles.earningsCard,
          {
            borderColor: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.25)',
            ...(isDark ? {} : helpers.getShadow('md')),
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.earningsHeader}>
          <View>
            <View style={styles.earningsLabelRow}>
              <Ionicons name="wallet-outline" size={16} color={colors.brand[400]} />
              <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Bu Ay Kazanç</Text>
            </View>
            <Text style={[styles.earningsValue, { color: colors.text }]}>
              ₺{monthlyEarnings.toLocaleString('tr-TR')}
            </Text>
            <View style={styles.earningsChange}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.earningsChangeBadge}
              >
                <Ionicons name="trending-up" size={12} color={colors.success} />
                <Text style={[styles.earningsChangeText, { color: colors.success }]}>+23% geçen aya göre</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={[styles.earningsStatsRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
          <View style={styles.earningsStatItem}>
            <Text style={[styles.earningsStatValue, { color: colors.text }]}>
              ₺{pendingPayments.toLocaleString('tr-TR')}
            </Text>
            <Text style={[styles.earningsStatLabel, { color: colors.textMuted }]}>Bekleyen Ödeme</Text>
          </View>
          <View style={[styles.earningsStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.earningsStatItem}>
            <Text style={[styles.earningsStatValue, { color: colors.text }]}>{completedJobs}</Text>
            <Text style={[styles.earningsStatLabel, { color: colors.textMuted }]}>Tamamlanan İş</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function QuickStatsRow({
  upcomingJobs,
  pendingOffers,
  onOffersPress,
  onJobsPress,
}: {
  upcomingJobs: number;
  pendingOffers: number;
  onOffersPress: () => void;
  onJobsPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View style={styles.quickStatsRow}>
      <TouchableOpacity
        style={[
          styles.quickStatCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : helpers.getShadow('sm')),
          },
        ]}
        onPress={onJobsPress}
      >
        <View style={[styles.quickStatIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
          <Ionicons name="calendar" size={20} color={colors.info} />
        </View>
        <View>
          <Text style={[styles.quickStatValue, { color: colors.text }]}>{upcomingJobs}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Yaklaşan İş</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickStatCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            ...(isDark ? {} : helpers.getShadow('sm')),
          },
        ]}
        onPress={onOffersPress}
      >
        <View style={[styles.quickStatIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
          <Ionicons name="pricetag" size={20} color={colors.warning} />
        </View>
        <View>
          <Text style={[styles.quickStatValue, { color: colors.text }]}>{pendingOffers}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Bekleyen Teklif</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function UpcomingJobCard({
  title,
  date,
  location,
  role,
  earnings,
  daysUntil,
  status,
  image,
  onPress,
}: {
  title: string;
  date: string;
  location: string;
  role: string;
  earnings: number;
  daysUntil: number;
  status: string;
  image: string;
  onPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.jobCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: image }} style={styles.jobImage} />
      <View style={styles.jobContent}>
        <View style={styles.jobHeader}>
          <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <View
            style={[
              styles.daysUntilBadge,
              { backgroundColor: daysUntil <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)' },
            ]}
          >
            <Text style={[styles.daysUntilText, { color: daysUntil <= 7 ? colors.error : colors.info }]}>
              {daysUntil} gün
            </Text>
          </View>
        </View>
        <Text style={[styles.jobDate, { color: colors.textMuted }]}>
          {date} • {location}
        </Text>
        <View style={styles.jobFooter}>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)' }]}>
            <Text style={[styles.roleText, { color: colors.brand[400] }]}>{role}</Text>
          </View>
          <Text style={[styles.earningsText, { color: colors.success }]}>₺{earnings.toLocaleString('tr-TR')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RequestCard({
  title,
  category,
  organizer,
  organizerImage,
  location,
  date,
  budget,
  isNew,
  isHot,
  timeAgo,
  matchScore,
  onPress,
}: {
  title: string;
  category: string;
  organizer: string;
  organizerImage: string;
  location: string;
  date: string;
  budget: string;
  isNew: boolean;
  isHot: boolean;
  timeAgo: string;
  matchScore: number;
  onPress: () => void;
}) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.requestCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: isHot ? 'rgba(239, 68, 68, 0.3)' : colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestBadges}>
          {isNew && (
            <View style={[styles.newBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.newBadgeText, { color: colors.success }]}>Yeni</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.hotBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="flame" size={12} color={colors.error} />
              <Text style={[styles.hotBadgeText, { color: colors.error }]}>Acil</Text>
            </View>
          )}
        </View>
        <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo}</Text>
      </View>

      <Text style={[styles.requestTitle, { color: colors.text }]}>{title}</Text>

      <View style={styles.requestMeta}>
        <Image source={{ uri: organizerImage }} style={styles.organizerImage} />
        <Text style={[styles.organizerName, { color: colors.textSecondary }]}>{organizer}</Text>
        <Text style={[styles.requestDot, { color: colors.textMuted }]}>•</Text>
        <Ionicons name="location" size={12} color={colors.textMuted} />
        <Text style={[styles.requestLocation, { color: colors.textMuted }]}>{location}</Text>
      </View>

      <View style={styles.requestFooter}>
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.08)' }]}>
          <Text style={[styles.categoryText, { color: colors.brand[400] }]}>{category}</Text>
        </View>
        <Text style={[styles.budgetText, { color: colors.text }]}>{budget}</Text>
      </View>

      <View style={[styles.matchRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border }]}>
        <View style={styles.matchInfo}>
          <Text style={[styles.matchLabel, { color: colors.textMuted }]}>Eşleşme Skoru</Text>
          <View style={[styles.matchBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <View style={[styles.matchProgress, { width: `${matchScore}%`, backgroundColor: colors.brand[400] }]} />
          </View>
        </View>
        <Text style={[styles.matchScore, { color: colors.brand[400] }]}>{matchScore}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function PerformanceCard({ responseRate }: { responseRate: number }) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <View
      style={[
        styles.performanceCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          ...(isDark ? {} : helpers.getShadow('sm')),
        },
      ]}
    >
      <View style={styles.performanceHeader}>
        <Ionicons name="analytics-outline" size={20} color={colors.brand[400]} />
        <Text style={[styles.performanceTitle, { color: colors.text }]}>Performans</Text>
      </View>

      <View style={styles.performanceCircles}>
        <PerformanceCircle value={responseRate} label="Yanıt Oranı" color={colors.success} />
        <PerformanceCircle value={96} label="Tamamlama" color={colors.brand[500]} />
        <PerformanceCircle value={99} label="Memnuniyet" color={colors.warning} />
      </View>

      <View style={[styles.performanceHint, { backgroundColor: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.06)' }]}>
        <Ionicons name="sparkles" size={14} color={colors.brand[400]} />
        <Text style={[styles.performanceHintText, { color: colors.brand[400] }]}>
          Harika gidiyorsunuz! Üst düzey sağlayıcı statüsündesiniz.
        </Text>
      </View>
    </View>
  );
}

function PerformanceCircle({ value, label, color }: { value: number; label: string; color: string }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.circleItem}>
      <View style={[styles.circle, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }]}>
        <View
          style={[
            styles.circleProgress,
            {
              borderColor: color,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            },
          ]}
        >
          <Text style={[styles.circleValue, { color: colors.text }]}>{value}%</Text>
        </View>
      </View>
      <Text style={[styles.circleLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  artistsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },

  // Operation Card
  operationCard: {
    marginHorizontal: 20,
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  operationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  operationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operationContent: {
    flex: 1,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  operationSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  // Provider Header
  providerHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  providerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 14,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  statusDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 12,
  },

  // Earnings Card
  earningsSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  earningsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  earningsHeader: {
    marginBottom: 20,
  },
  earningsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  earningsChange: {
    marginTop: 8,
  },
  earningsChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  earningsChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  earningsStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  earningsStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  earningsStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  earningsStatDivider: {
    width: 1,
    height: 30,
  },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  quickStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 12,
  },

  // Job Card
  jobCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  jobImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  jobContent: {
    flex: 1,
    justifyContent: 'center',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  daysUntilBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysUntilText: {
    fontSize: 11,
    fontWeight: '600',
  },
  jobDate: {
    fontSize: 12,
    marginTop: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Request Card
  requestCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  organizerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  organizerName: {
    fontSize: 12,
  },
  requestDot: {
    fontSize: 10,
  },
  requestLocation: {
    fontSize: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  matchBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  matchProgress: {
    height: '100%',
    borderRadius: 3,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Performance Card
  performanceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  performanceCircles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  circleItem: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 6,
  },
  circleProgress: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 11,
  },
  performanceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  performanceHintText: {
    fontSize: 12,
    flex: 1,
  },
});

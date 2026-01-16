/**
 * Operasyon Merkezi Ekranı
 *
 * Rol tabanlı operasyon bölümlerini gösteren ana hub ekranı.
 * Her bölüm kartı, kullanıcının yetkilerine göre filtrelenir.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useOperationPermissions } from '../hooks/useOperationPermissions';
import {
  OperationSectionType,
  SECTION_META,
  getSectionStatusLabel,
  getSectionStatusColor,
} from '../types/operationSection';
import {
  sampleEventOperations,
  currentOperationUser,
} from '../data/operationSectionsData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Navigation types
type RootStackParamList = {
  OperationHub: { eventId: string };
  OperationSectionDetail: {
    eventId: string;
    sectionType: OperationSectionType;
  };
};

type OperationHubRouteProp = RouteProp<RootStackParamList, 'OperationHub'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Animated components
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function OperationHubScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OperationHubRouteProp>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  // Permission hook
  const {
    currentUser,
    userRole,
    getViewableSections,
    getSectionPermission,
    canAssignProvider,
  } = useOperationPermissions();

  // State
  const [refreshing, setRefreshing] = useState(false);

  // Get event data
  const eventData = sampleEventOperations;

  // Get accessible sections for current user
  const accessibleSections = useMemo(() => {
    return getViewableSections();
  }, [getViewableSections]);

  // Get section data from event operations
  const getSectionData = useCallback(
    (sectionType: OperationSectionType) => {
      return eventData.sections.find((s) => s.type === sectionType);
    },
    [eventData]
  );

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header style
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 60, 100],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSectionPress = useCallback(
    (sectionType: OperationSectionType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('OperationSectionDetail', {
        eventId: eventData.eventId,
        sectionType,
      });
    },
    [navigation, eventData.eventId]
  );

  const handleAssignProvider = useCallback(
    (sectionType: OperationSectionType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Open provider assignment modal
      console.log('Assign provider for', sectionType);
    },
    []
  );

  // Render section card
  const renderSectionCard = useCallback(
    (sectionInfo: (typeof accessibleSections)[0], index: number) => {
      const section = getSectionData(sectionInfo.type);
      if (!section) return null;

      const meta = SECTION_META[sectionInfo.type];
      const hasProvider = section.provider !== null;
      const permission = getSectionPermission(sectionInfo.type);
      const canAssign = canAssignProvider(sectionInfo.type);

      return (
        <Animated.View
          key={sectionInfo.type}
          entering={FadeInDown.delay(index * 100).duration(400)}
          style={styles.cardWrapper}
        >
          <TouchableOpacity
            style={[
              styles.sectionCard,
              !hasProvider && styles.sectionCardUnassigned,
            ]}
            onPress={() => handleSectionPress(sectionInfo.type)}
            activeOpacity={0.7}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: meta.color + '20' },
                ]}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={24}
                  color={meta.color}
                />
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: hasProvider
                      ? getSectionStatusColor(section.status) + '20'
                      : '#F59E0B20',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: hasProvider
                        ? getSectionStatusColor(section.status)
                        : '#F59E0B',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Section Name */}
            <Text style={styles.sectionName}>{meta.name}</Text>

            {/* Provider Info or Planning Badge */}
            {hasProvider ? (
              <View style={styles.providerInfo}>
                <Text style={styles.providerName} numberOfLines={1}>
                  {section.provider?.name}
                </Text>
                {section.summary && (
                  <Text style={styles.summaryText} numberOfLines={1}>
                    {section.summary.value}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.planningBadge}>
                <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                <Text style={styles.planningText}>Atanmadı</Text>
              </View>
            )}

            {/* Action Button */}
            <View style={styles.cardFooter}>
              {hasProvider ? (
                <View style={styles.viewButton}>
                  <Text style={[styles.viewButtonText, { color: meta.color }]}>
                    Görüntüle
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={meta.color} />
                </View>
              ) : canAssign ? (
                <TouchableOpacity
                  style={[styles.assignButton, { backgroundColor: meta.color }]}
                  onPress={() => handleAssignProvider(sectionInfo.type)}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.assignButtonText}>Ata</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.viewButton}>
                  <Text style={styles.planningViewText}>Planlama</Text>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Permission indicator */}
            {permission.canEdit && (
              <View style={styles.editIndicator}>
                <Ionicons name="pencil" size={10} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [
      getSectionData,
      getSectionPermission,
      canAssignProvider,
      handleSectionPress,
      handleAssignProvider,
    ]
  );

  // Overall progress calculation
  const overallProgress = useMemo(() => {
    const totalSections = eventData.sections.length;
    const completedSections = eventData.sections.filter(
      (s) => s.status === 'completed'
    ).length;
    const assignedSections = eventData.sections.filter(
      (s) => s.provider !== null
    ).length;

    return {
      completed: completedSections,
      assigned: assignedSections,
      total: totalSections,
      percentage: Math.round((completedSections / totalSections) * 100),
    };
  }, [eventData.sections]);

  return (
    <View style={styles.container}>
      {/* Fixed Header Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          { paddingTop: insets.top },
          headerStyle,
        ]}
      >
        <Text style={styles.headerTitle}>Operasyon Merkezi</Text>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      {/* Main Content */}
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{eventData.eventTitle}</Text>
          <Text style={styles.eventSubtitle}>
            {eventData.eventDate} • {eventData.eventVenue}
          </Text>
        </View>

        {/* Current User Info */}
        {userRole && (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#4B30B8" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {currentOperationUser.party === 'booking'
                    ? 'Booking Firması'
                    : currentOperationUser.party === 'organizer'
                    ? 'Organizatör'
                    : 'Provider'}
                </Text>
                <Text style={styles.userRole}>{userRole.name}</Text>
              </View>
            </View>
            <View style={styles.accessBadge}>
              <Text style={styles.accessBadgeText}>
                {accessibleSections.length} bölüm
              </Text>
            </View>
          </View>
        )}

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Genel İlerleme</Text>
            <Text style={styles.progressPercentage}>
              %{overallProgress.percentage}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${overallProgress.percentage}%` },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {overallProgress.assigned}/{overallProgress.total}
              </Text>
              <Text style={styles.progressStatLabel}>Atanan</Text>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {overallProgress.completed}/{overallProgress.total}
              </Text>
              <Text style={styles.progressStatLabel}>Tamamlanan</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Operasyon Bölümleri</Text>
          <Text style={styles.sectionHeaderSubtitle}>
            Erişebildiğiniz bölümler
          </Text>
        </View>

        {/* Sections Grid */}
        <View style={styles.sectionsGrid}>
          {accessibleSections.map((section, index) =>
            renderSectionCard(section, index)
          )}
        </View>

        {/* No Access Message */}
        {accessibleSections.length === 0 && (
          <View style={styles.noAccessCard}>
            <Ionicons name="lock-closed" size={48} color="#D1D5DB" />
            <Text style={styles.noAccessTitle}>Erişim Yok</Text>
            <Text style={styles.noAccessText}>
              Bu etkinliğin operasyon bölümlerine erişim yetkiniz bulunmuyor.
            </Text>
          </View>
        )}

        {/* Parties Section */}
        <View style={styles.partiesSection}>
          <Text style={styles.partiesSectionTitle}>Taraflar</Text>
          <View style={styles.partiesRow}>
            <View style={styles.partyCard}>
              <Image
                source={{ uri: eventData.parties.booking.companyLogo }}
                style={styles.partyLogo}
              />
              <Text style={styles.partyName} numberOfLines={1}>
                {eventData.parties.booking.companyName}
              </Text>
              <Text style={styles.partyType}>Booking</Text>
            </View>
            <View style={styles.partyCard}>
              <Image
                source={{ uri: eventData.parties.organizer.companyLogo }}
                style={styles.partyLogo}
              />
              <Text style={styles.partyName} numberOfLines={1}>
                {eventData.parties.organizer.companyName}
              </Text>
              <Text style={styles.partyType}>Organizatör</Text>
            </View>
            {eventData.parties.artist && (
              <View style={styles.partyCard}>
                <Image
                  source={{ uri: eventData.parties.artist.artistImage }}
                  style={styles.partyLogo}
                />
                <Text style={styles.partyName} numberOfLines={1}>
                  {eventData.parties.artist.artistName}
                </Text>
                <Text style={styles.partyType}>Sanatçı</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F3F4F6',
    zIndex: 100,
    paddingBottom: 12,
    paddingHorizontal: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B30B820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  accessBadge: {
    backgroundColor: '#4B30B820',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  accessBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B30B8',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  progressStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    height: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardUnassigned: {
    borderWidth: 1,
    borderColor: '#F59E0B40',
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  planningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  planningText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  planningViewText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  assignButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  editIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAccessCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  noAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  partiesSection: {
    marginTop: 20,
  },
  partiesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  partiesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  partyCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  partyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  partyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  partyType: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default OperationHubScreen;

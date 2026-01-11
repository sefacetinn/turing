import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';
import { events as mockEvents, artists } from '../data/mockData';
import { ReviseEventModal } from '../components/ReviseEventModal';
import { CancelEventModal } from '../components/CancelEventModal';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  category: string;
  name: string;
  status: string;
  provider: string | null;
  price: number;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'payment' | 'update';
  completed: boolean;
}

// Get category info
const getCategoryInfo = (category: string) => {
  const categories: Record<string, { name: string; icon: keyof typeof Ionicons.glyphMap; gradient: readonly [string, string] }> = {
    booking: { name: 'Booking', icon: 'musical-notes', gradient: gradients.booking },
    technical: { name: 'Teknik', icon: 'volume-high', gradient: gradients.technical },
    venue: { name: 'Mekan', icon: 'business', gradient: gradients.venue },
    accommodation: { name: 'Konaklama', icon: 'bed', gradient: gradients.accommodation },
    transport: { name: 'Ulaşım', icon: 'car', gradient: gradients.transport },
    flight: { name: 'Uçak', icon: 'airplane', gradient: gradients.flight },
    operation: { name: 'Operasyon', icon: 'settings', gradient: gradients.operation },
  };
  return categories[category] || { name: category, icon: 'help-circle' as const, gradient: gradients.primary };
};

// Get status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Onaylandı', color: colors.success, icon: 'checkmark-circle' as const };
    case 'pending':
      return { label: 'Bekliyor', color: colors.warning, icon: 'time' as const };
    case 'offered':
      return { label: 'Teklif Geldi', color: colors.info, icon: 'document-text' as const };
    case 'draft':
      return { label: 'Taslak', color: colors.zinc[500], icon: 'create' as const };
    default:
      return { label: status, color: colors.zinc[500], icon: 'help-circle' as const };
  }
};

// Mock timeline data
const mockTimeline: TimelineItem[] = [
  { id: 't1', title: 'Etkinlik Oluşturuldu', description: 'Etkinlik taslağı hazırlandı', date: '1 Haziran 2024', type: 'milestone', completed: true },
  { id: 't2', title: 'Mekan Onayı', description: 'KüsümPark mekan rezervasyonu onaylandı', date: '5 Haziran 2024', type: 'task', completed: true },
  { id: 't3', title: 'Sanatçı Anlaşması', description: 'Mabel Matiz ile sözleşme imzalandı', date: '8 Haziran 2024', type: 'milestone', completed: true },
  { id: 't4', title: 'Ön Ödeme', description: '₺250.000 ön ödeme yapıldı', date: '10 Haziran 2024', type: 'payment', completed: true },
  { id: 't5', title: 'Teknik Ekipman Teslimi', description: 'Ses ve ışık sistemi kurulumu', date: '14 Temmuz 2024', type: 'task', completed: false },
  { id: 't6', title: 'Etkinlik Günü', description: 'Yaz Festivali 2024 başlıyor!', date: '15 Temmuz 2024', type: 'milestone', completed: false },
];

export function OrganizerEventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params || { eventId: '1' };

  const [activeSection, setActiveSection] = useState<'services' | 'timeline' | 'budget'>('services');
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Find event
  const event = useMemo(() => {
    return mockEvents.find(e => e.id === eventId);
  }, [eventId]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Etkinlik bulunamadı</Text>
      </SafeAreaView>
    );
  }

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    event.services.forEach((service: Service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });
    return grouped;
  }, [event.services]);

  // Stats
  const stats = useMemo(() => {
    const confirmed = event.services.filter((s: Service) => s.status === 'confirmed').length;
    const pending = event.services.filter((s: Service) => s.status === 'pending').length;
    const offered = event.services.filter((s: Service) => s.status === 'offered').length;
    return { confirmed, pending, offered, total: event.services.length };
  }, [event.services]);

  const renderServiceCard = (service: Service) => {
    const statusInfo = getStatusInfo(service.status);
    const categoryInfo = getCategoryInfo(service.category);

    return (
      <TouchableOpacity key={service.id} style={styles.serviceCard} activeOpacity={0.8}>
        <View style={styles.serviceHeader}>
          <LinearGradient
            colors={categoryInfo.gradient}
            style={styles.serviceCategoryIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={categoryInfo.icon} size={14} color="white" />
          </LinearGradient>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceCategory}>{categoryInfo.name}</Text>
          </View>
          <View style={[styles.serviceStatusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
            <Text style={[styles.serviceStatusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Text style={styles.serviceDetailLabel}>Tedarikçi</Text>
            <Text style={styles.serviceDetailValue}>
              {service.provider || 'Atanmadı'}
            </Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Text style={styles.serviceDetailLabel}>Tutar</Text>
            <Text style={styles.serviceDetailValue}>
              ₺{service.price.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {service.status === 'pending' && (
          <TouchableOpacity style={styles.serviceActionButton}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.serviceActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="search" size={14} color="white" />
              <Text style={styles.serviceActionText}>Tedarikçi Bul</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {service.status === 'offered' && (
          <TouchableOpacity style={styles.serviceActionButton}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.serviceActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="document-text" size={14} color="white" />
              <Text style={styles.serviceActionText}>Teklifleri Gör</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimelineItem = (item: TimelineItem, index: number, isLast: boolean) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'milestone': return 'flag';
        case 'task': return 'checkbox';
        case 'payment': return 'card';
        case 'update': return 'refresh';
        default: return 'ellipse';
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'milestone': return colors.brand[500];
        case 'task': return colors.success;
        case 'payment': return colors.warning;
        case 'update': return colors.info;
        default: return colors.zinc[500];
      }
    };

    return (
      <View key={item.id} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[
            styles.timelineIcon,
            { backgroundColor: item.completed ? getTypeColor(item.type) : colors.zinc[700] }
          ]}>
            <Ionicons
              name={getTypeIcon(item.type) as keyof typeof Ionicons.glyphMap}
              size={12}
              color="white"
            />
          </View>
          {!isLast && (
            <View style={[
              styles.timelineLine,
              { backgroundColor: item.completed ? getTypeColor(item.type) : colors.zinc[700] }
            ]} />
          )}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineDate}>{item.date}</Text>
          <Text style={[styles.timelineTitle, !item.completed && styles.timelineTitlePending]}>
            {item.title}
          </Text>
          <Text style={styles.timelineDescription}>{item.description}</Text>
        </View>
        {item.completed && (
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.imageGradient}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Event Info */}
          <View style={styles.headerContent}>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                {event.status === 'confirmed' ? 'Onaylandı' : event.status === 'planning' ? 'Planlama' : 'Taslak'}
              </Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <View style={styles.eventMetaItem}>
                <Ionicons name="calendar" size={14} color="white" />
                <Text style={styles.eventMetaText}>{event.date}</Text>
              </View>
              <View style={styles.eventMetaItem}>
                <Ionicons name="location" size={14} color="white" />
                <Text style={styles.eventMetaText}>{event.venue}, {event.district}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Genel İlerleme</Text>
            <Text style={styles.progressPercent}>{event.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={gradients.primary}
              style={[styles.progressFill, { width: `${event.progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <View style={[styles.progressStatDot, { backgroundColor: colors.success }]} />
              <Text style={styles.progressStatText}>{stats.confirmed} Onaylı</Text>
            </View>
            <View style={styles.progressStatItem}>
              <View style={[styles.progressStatDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.progressStatText}>{stats.pending} Bekliyor</Text>
            </View>
            <View style={styles.progressStatItem}>
              <View style={[styles.progressStatDot, { backgroundColor: colors.info }]} />
              <Text style={styles.progressStatText}>{stats.offered} Teklif</Text>
            </View>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <Ionicons name="people" size={20} color={colors.brand[400]} />
            <Text style={styles.quickInfoValue}>{event.attendees.toLocaleString('tr-TR')}</Text>
            <Text style={styles.quickInfoLabel}>Katılımcı</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Ionicons name="wallet" size={20} color={colors.success} />
            <Text style={styles.quickInfoValue}>₺{(event.budget / 1000).toFixed(0)}K</Text>
            <Text style={styles.quickInfoLabel}>Bütçe</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Ionicons name="time" size={20} color={colors.warning} />
            <Text style={styles.quickInfoValue}>{event.time.split(' - ')[0]}</Text>
            <Text style={styles.quickInfoLabel}>Başlangıç</Text>
          </View>
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            style={[styles.sectionTab, activeSection === 'services' && styles.sectionTabActive]}
            onPress={() => setActiveSection('services')}
          >
            <Ionicons
              name={activeSection === 'services' ? 'grid' : 'grid-outline'}
              size={14}
              color={activeSection === 'services' ? colors.brand[400] : colors.zinc[500]}
            />
            <Text style={[styles.sectionTabText, activeSection === 'services' && styles.sectionTabTextActive]}>
              Hizmetler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionTab, activeSection === 'timeline' && styles.sectionTabActive]}
            onPress={() => setActiveSection('timeline')}
          >
            <Ionicons
              name={activeSection === 'timeline' ? 'time' : 'time-outline'}
              size={14}
              color={activeSection === 'timeline' ? colors.brand[400] : colors.zinc[500]}
            />
            <Text style={[styles.sectionTabText, activeSection === 'timeline' && styles.sectionTabTextActive]}>
              Zaman Çizelgesi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionTab, activeSection === 'budget' && styles.sectionTabActive]}
            onPress={() => setActiveSection('budget')}
          >
            <Ionicons
              name={activeSection === 'budget' ? 'wallet' : 'wallet-outline'}
              size={14}
              color={activeSection === 'budget' ? colors.brand[400] : colors.zinc[500]}
            />
            <Text style={[styles.sectionTabText, activeSection === 'budget' && styles.sectionTabTextActive]}>
              Bütçe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Section */}
        {activeSection === 'services' && (
          <View style={styles.servicesSection}>
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <View key={category} style={styles.serviceCategoryGroup}>
                <View style={styles.serviceCategoryHeader}>
                  <Text style={styles.serviceCategoryTitle}>
                    {getCategoryInfo(category).name}
                  </Text>
                  <Text style={styles.serviceCategoryCount}>
                    {services.length} hizmet
                  </Text>
                </View>
                {services.map(service => renderServiceCard(service))}
              </View>
            ))}

            {/* Add Service Button */}
            <TouchableOpacity style={styles.addServiceButton}>
              <Ionicons name="add" size={20} color={colors.brand[400]} />
              <Text style={styles.addServiceText}>Hizmet Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline Section */}
        {activeSection === 'timeline' && (
          <View style={styles.timelineSection}>
            {mockTimeline.map((item, index) =>
              renderTimelineItem(item, index, index === mockTimeline.length - 1)
            )}
          </View>
        )}

        {/* Budget Section */}
        {activeSection === 'budget' && (
          <View style={styles.budgetSection}>
            <View style={styles.budgetSummary}>
              <View style={styles.budgetSummaryItem}>
                <Text style={styles.budgetSummaryLabel}>Toplam Bütçe</Text>
                <Text style={styles.budgetSummaryValue}>
                  ₺{event.budget.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetSummaryItem}>
                <Text style={styles.budgetSummaryLabel}>Harcanan</Text>
                <Text style={[styles.budgetSummaryValue, { color: colors.warning }]}>
                  ₺{event.spent.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetSummaryItem}>
                <Text style={styles.budgetSummaryLabel}>Kalan</Text>
                <Text style={[styles.budgetSummaryValue, { color: colors.success }]}>
                  ₺{(event.budget - event.spent).toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>

            {/* Budget by Category */}
            <Text style={styles.budgetCategoryTitle}>Kategori Bazlı Harcamalar</Text>
            {Object.entries(servicesByCategory).map(([category, services]) => {
              const categoryTotal = services.reduce((sum, s) => sum + s.price, 0);
              const categoryPercent = (categoryTotal / event.budget) * 100;
              const categoryInfo = getCategoryInfo(category);

              return (
                <View key={category} style={styles.budgetCategoryItem}>
                  <View style={styles.budgetCategoryHeader}>
                    <View style={styles.budgetCategoryInfo}>
                      <LinearGradient
                        colors={categoryInfo.gradient}
                        style={styles.budgetCategoryIcon}
                      >
                        <Ionicons name={categoryInfo.icon} size={12} color="white" />
                      </LinearGradient>
                      <Text style={styles.budgetCategoryName}>{categoryInfo.name}</Text>
                    </View>
                    <Text style={styles.budgetCategoryAmount}>
                      ₺{categoryTotal.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.budgetCategoryBar}>
                    <LinearGradient
                      colors={categoryInfo.gradient}
                      style={[styles.budgetCategoryFill, { width: `${categoryPercent}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.budgetCategoryPercent}>{categoryPercent.toFixed(1)}%</Text>
                </View>
              );
            })}

            {/* Export Button */}
            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="download-outline" size={18} color={colors.brand[400]} />
              <Text style={styles.exportButtonText}>Bütçe Raporu İndir (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => setShowReviseModal(true)}
          >
            <Ionicons name="create-outline" size={18} color={colors.text} />
            <Text style={styles.actionButtonSecondaryText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => setShowCancelModal(true)}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
            <Text style={[styles.actionButtonSecondaryText, { color: colors.error }]}>
              İptal Et
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="rocket" size={18} color="white" />
            <Text style={styles.primaryButtonText}>Etkinliği Yayınla</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Revise Event Modal */}
      <ReviseEventModal
        visible={showReviseModal}
        onClose={() => setShowReviseModal(false)}
        onSubmit={(data) => {
          Alert.alert('Başarılı', 'Değişiklik talebi gönderildi.');
          setShowReviseModal(false);
        }}
        eventTitle={event.title}
      />

      {/* Cancel Event Modal */}
      <CancelEventModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={(reason, refundOption) => {
          Alert.alert('Etkinlik İptal Edildi', 'Tedarikçilere bildirim gönderildi.');
          setShowCancelModal(false);
          navigation.goBack();
        }}
        eventTitle={event.title}
        eventDate={event.date}
        totalSpent={event.spent}
        confirmedProviders={stats.confirmed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
  headerImage: {
    height: 280,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    marginBottom: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand[400],
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 20,
  },
  progressStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressStatText: {
    fontSize: 12,
    color: colors.zinc[400],
  },
  quickInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickInfoCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 2,
  },
  sectionTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 6,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  sectionTabText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[400],
  },
  sectionTabTextActive: {
    color: colors.brand[400],
  },
  servicesSection: {
    padding: 20,
  },
  serviceCategoryGroup: {
    marginBottom: 20,
  },
  serviceCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  serviceCategoryCount: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  serviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serviceCategory: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 1,
  },
  serviceStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  serviceStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  serviceDetailItem: {},
  serviceDetailLabel: {
    fontSize: 10,
    color: colors.zinc[500],
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  serviceDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  serviceActionButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  serviceActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  serviceActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    borderStyle: 'dashed',
    gap: 8,
  },
  addServiceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  timelineSection: {
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineDate: {
    fontSize: 11,
    color: colors.zinc[500],
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  timelineTitlePending: {
    color: colors.zinc[400],
  },
  timelineDescription: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  budgetSection: {
    padding: 20,
  },
  budgetSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  budgetSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetSummaryLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  budgetSummaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  budgetDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  budgetCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  budgetCategoryItem: {
    marginBottom: 16,
  },
  budgetCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCategoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  budgetCategoryAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  budgetCategoryBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  budgetCategoryFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetCategoryPercent: {
    fontSize: 11,
    color: colors.zinc[500],
    textAlign: 'right',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    gap: 8,
    marginTop: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});

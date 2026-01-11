import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

// Local events data
const events = [
  { id: '1', title: 'Yaz Festivali 2024', description: '3 günlük açık hava müzik festivali', date: '15-17 Temmuz 2024', time: '16:00', location: 'İstanbul', district: 'Kadıköy', venue: 'KüçükÇiftlik Park', status: 'planning', progress: 65, budget: 2500000, spent: 1625000, attendees: 15000, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', services: [{ id: 's1', category: 'booking', name: 'Ana Sahne', status: 'confirmed', provider: 'Mabel Matiz', price: 200000 }] },
  { id: '2', title: 'Kurumsal Gala', description: 'Yıllık şirket galası', date: '22 Ağustos 2024', time: '19:00', location: 'Ankara', district: 'Çankaya', venue: 'JW Marriott', status: 'confirmed', progress: 100, budget: 800000, spent: 750000, attendees: 500, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', services: [] },
];

const { width } = Dimensions.get('window');

const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
  const gradientMap: Record<string, readonly [string, string, ...string[]]> = {
    booking: gradients.booking,
    technical: gradients.technical,
    venue: gradients.venue,
    accommodation: gradients.accommodation,
    transport: gradients.transport,
    flight: gradients.flight,
    operation: gradients.operation,
  };
  return gradientMap[category] || gradients.primary;
};

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    booking: 'musical-notes',
    technical: 'volume-high',
    venue: 'business',
    accommodation: 'bed',
    transport: 'car',
    flight: 'airplane',
    operation: 'settings',
  };
  return iconMap[category] || 'ellipse';
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { color: string; text: string; bg: string }> = {
    confirmed: { color: colors.success, text: 'Onaylandı', bg: 'rgba(16, 185, 129, 0.15)' },
    pending: { color: colors.warning, text: 'Beklemede', bg: 'rgba(245, 158, 11, 0.15)' },
    offered: { color: colors.info, text: 'Teklif Var', bg: 'rgba(59, 130, 246, 0.15)' },
    planning: { color: colors.brand[400], text: 'Planlama', bg: 'rgba(147, 51, 234, 0.15)' },
    draft: { color: colors.zinc[500], text: 'Taslak', bg: 'rgba(113, 113, 122, 0.15)' },
  };
  return statusMap[status] || statusMap.pending;
};

export function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = (route.params as { eventId: string }) || { eventId: '1' };

  const event = events.find(e => e.id === eventId) || events[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'budget'>('overview');

  if (!event) {
    return null;
  }

  const confirmedServices = event.services?.filter(s => s.status === 'confirmed').length || 0;
  const totalServices = event.services?.length || 0;
  const budgetUsedPercent = event.budget ? Math.round((event.spent / event.budget) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImage}>
        <Image source={{ uri: event.image }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(9,9,11,0.8)', colors.background]}
          style={styles.imageGradient}
        />
        <SafeAreaView style={styles.headerActions}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(event.status).bg }]}>
            <Text style={[styles.statusText, { color: getStatusInfo(event.status).color }]}>
              {getStatusInfo(event.status).text}
            </Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.zinc[400]} />
              <Text style={styles.quickInfoText}>{event.date}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="time-outline" size={16} color={colors.zinc[400]} />
              <Text style={styles.quickInfoText}>{event.time}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="location-outline" size={16} color={colors.zinc[400]} />
              <Text style={styles.quickInfoText}>{event.venue}, {event.district}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="people-outline" size={16} color={colors.zinc[400]} />
              <Text style={styles.quickInfoText}>{event.attendees.toLocaleString()} katılımcı</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{event.progress}%</Text>
            <Text style={styles.statLabel}>İlerleme</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={gradients.primary}
                style={[styles.progressFill, { width: `${event.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{confirmedServices}/{totalServices}</Text>
            <Text style={styles.statLabel}>Hizmetler</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillGreen, { width: `${(confirmedServices/totalServices)*100}%` }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{budgetUsedPercent}%</Text>
            <Text style={styles.statLabel}>Bütçe</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFillOrange, { width: `${budgetUsedPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['overview', 'services', 'budget'] as const).map((tab) => {
            const tabConfig = {
              overview: { icon: 'information-circle-outline', iconActive: 'information-circle', label: 'Genel' },
              services: { icon: 'grid-outline', iconActive: 'grid', label: 'Hizmetler' },
              budget: { icon: 'wallet-outline', iconActive: 'wallet', label: 'Bütçe' },
            };
            const config = tabConfig[tab];
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Ionicons
                  name={(activeTab === tab ? config.iconActive : config.icon) as any}
                  size={14}
                  color={activeTab === tab ? colors.brand[400] : colors.zinc[500]}
                />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <View style={styles.servicesSection}>
            {event.services.map((service, index) => {
              const statusInfo = getStatusInfo(service.status);
              return (
                <TouchableOpacity key={service.id} style={styles.serviceCard}>
                  <LinearGradient
                    colors={getCategoryGradient(service.category)}
                    style={styles.serviceIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={getCategoryIcon(service.category) as any} size={18} color="white" />
                  </LinearGradient>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceProvider}>
                      {service.provider || 'Tedarikçi bekleniyor'}
                    </Text>
                  </View>
                  <View style={styles.serviceRight}>
                    <Text style={styles.servicePrice}>₺{service.price.toLocaleString()}</Text>
                    <View style={[styles.serviceStatus, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.serviceStatusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.addServiceButton}>
              <Ionicons name="add-circle-outline" size={20} color={colors.brand[400]} />
              <Text style={styles.addServiceText}>Hizmet Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'overview' && (
          <View style={styles.overviewSection}>
            {/* Timeline */}
            <Text style={styles.sectionTitle}>Zaman Çizelgesi</Text>
            <View style={styles.timeline}>
              {[
                { title: 'Etkinlik Oluşturuldu', date: '1 Haziran 2024', done: true },
                { title: 'Mekan Onaylandı', date: '5 Haziran 2024', done: true },
                { title: 'Sanatçı Sözleşmesi', date: '10 Haziran 2024', done: true },
                { title: 'Teknik Ekip', date: '15 Haziran 2024', done: false },
                { title: 'Final Kontrol', date: '10 Temmuz 2024', done: false },
                { title: 'Etkinlik Günü', date: event.date, done: false },
              ].map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    {item.done ? (
                      <Ionicons name="checkmark" size={12} color="white" />
                    ) : (
                      <View style={styles.timelineDotEmpty} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, !item.done && styles.timelineTitlePending]}>
                      {item.title}
                    </Text>
                    <Text style={styles.timelineDate}>{item.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'budget' && (
          <View style={styles.budgetSection}>
            <View style={styles.budgetSummary}>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Toplam Bütçe</Text>
                <Text style={styles.budgetValue}>₺{event.budget.toLocaleString()}</Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Harcanan</Text>
                <Text style={[styles.budgetValue, { color: colors.warning }]}>
                  ₺{event.spent.toLocaleString()}
                </Text>
              </View>
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Kalan</Text>
                <Text style={[styles.budgetValue, { color: colors.success }]}>
                  ₺{(event.budget - event.spent).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Harcama Dağılımı</Text>
            {event.services.filter(s => s.status === 'confirmed').map((service) => (
              <View key={service.id} style={styles.budgetRow}>
                <View style={styles.budgetRowLeft}>
                  <View style={[styles.budgetDot, { backgroundColor: getCategoryGradient(service.category)[0] }]} />
                  <Text style={styles.budgetRowName}>{service.name}</Text>
                </View>
                <Text style={styles.budgetRowValue}>₺{service.price.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="create-outline" size={20} color={colors.text} />
          <Text style={styles.secondaryButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="paper-plane" size={18} color="white" />
            <Text style={styles.primaryButtonText}>Teklif İste</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerImage: {
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginTop: -40,
  },
  eventInfo: {
    paddingHorizontal: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.zinc[400],
    lineHeight: 20,
    marginBottom: 16,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickInfoText: {
    fontSize: 13,
    color: colors.zinc[400],
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginTop: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressFillGreen: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.success,
  },
  progressFillOrange: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.warning,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  tabTextActive: {
    color: colors.brand[400],
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 10,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  serviceProvider: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  serviceRight: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serviceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  serviceStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 14,
    marginTop: 8,
  },
  addServiceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
  },
  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  timelineDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.zinc[600],
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timelineTitlePending: {
    color: colors.zinc[500],
  },
  timelineDate: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  budgetSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  budgetSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 11,
    color: colors.zinc[500],
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  budgetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetRowName: {
    fontSize: 14,
    color: colors.text,
  },
  budgetRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButton: {
    flex: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

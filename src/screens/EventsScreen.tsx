import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

interface EventsScreenProps {
  isProviderMode: boolean;
}

const events = [
  { id: '1', title: 'Yaz Festivali 2024', date: '15 Temmuz 2024', location: 'İstanbul, Kadıköy', status: 'planning', progress: 65 },
  { id: '2', title: 'Kurumsal Gala', date: '22 Ağustos 2024', location: 'Ankara, Çankaya', status: 'confirmed', progress: 100 },
  { id: '3', title: 'Düğün Organizasyonu', date: '1 Eylül 2024', location: 'İzmir, Çeşme', status: 'draft', progress: 25 },
];

export function EventsScreen({ isProviderMode }: EventsScreenProps) {
  const navigation = useNavigation<any>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'planning': return colors.brand[400];
      case 'draft': return colors.zinc[500];
      default: return colors.zinc[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Onaylandı';
      case 'planning': return 'Planlama';
      case 'draft': return 'Taslak';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isProviderMode ? 'İşlerim' : 'Etkinlikler'}
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={styles.filterChipTextActive}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Planlama</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Onaylı</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Taslak</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Events List */}
        <View style={styles.eventsList}>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            >
              <View style={styles.eventHeader}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(event.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                    {getStatusText(event.status)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.zinc[500]} />
              </View>

              <Text style={styles.eventTitle}>{event.title}</Text>

              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.zinc[500]} />
                  <Text style={styles.eventMetaText}>{event.date}</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.zinc[500]} />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>İlerleme</Text>
                  <Text style={styles.progressValue}>{event.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={gradients.primary}
                    style={[styles.progressFill, { width: `${event.progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.brand[400],
  },
  eventsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.zinc[500],
  },
  progressContainer: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.zinc[500],
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand[400],
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
});

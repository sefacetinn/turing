import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

interface TimeSlot {
  hour: number;
  minute: number;
}

export function QuietHoursScreen() {
  const navigation = useNavigation<any>();

  const [quietModeEnabled, setQuietModeEnabled] = useState(true);
  const [startTime, setStartTime] = useState<TimeSlot>({ hour: 22, minute: 0 });
  const [endTime, setEndTime] = useState<TimeSlot>({ hour: 8, minute: 0 });
  const [allowCritical, setAllowCritical] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

  const days = [
    { id: 'mon', label: 'Pzt' },
    { id: 'tue', label: 'Sal' },
    { id: 'wed', label: 'Çar' },
    { id: 'thu', label: 'Per' },
    { id: 'fri', label: 'Cum' },
    { id: 'sat', label: 'Cmt' },
    { id: 'sun', label: 'Paz' },
  ];

  const formatTime = (time: TimeSlot) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId]
    );
  };

  const adjustTime = (type: 'start' | 'end', field: 'hour' | 'minute', delta: number) => {
    const setter = type === 'start' ? setStartTime : setEndTime;
    setter((prev) => {
      let newValue = prev[field] + delta;
      if (field === 'hour') {
        newValue = ((newValue % 24) + 24) % 24;
      } else {
        newValue = ((newValue % 60) + 60) % 60;
      }
      return { ...prev, [field]: newValue };
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sessiz Saatler</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Icon & Description */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.iconBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="moon" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Rahatsız Etmeyin</Text>
          <Text style={styles.heroDescription}>
            Belirlediğiniz saatler arasında bildirimleri sessize alın
          </Text>
        </View>

        {/* Enable Toggle */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Sessiz Mod</Text>
                <Text style={styles.toggleDescription}>
                  {quietModeEnabled ? 'Aktif' : 'Devre dışı'}
                </Text>
              </View>
              <Switch
                value={quietModeEnabled}
                onValueChange={setQuietModeEnabled}
                trackColor={{ false: colors.zinc[700], true: colors.brand[600] }}
                thumbColor={quietModeEnabled ? colors.brand[400] : colors.zinc[400]}
              />
            </View>
          </View>
        </View>

        {quietModeEnabled && (
          <>
            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saat Aralığı</Text>
              <View style={styles.timeCard}>
                {/* Start Time */}
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Başlangıç</Text>
                  <View style={styles.timePicker}>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('start', 'hour', 1)}
                      >
                        <Ionicons name="chevron-up" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                      <Text style={styles.timeValue}>{startTime.hour.toString().padStart(2, '0')}</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('start', 'hour', -1)}
                      >
                        <Ionicons name="chevron-down" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('start', 'minute', 15)}
                      >
                        <Ionicons name="chevron-up" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                      <Text style={styles.timeValue}>{startTime.minute.toString().padStart(2, '0')}</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('start', 'minute', -15)}
                      >
                        <Ionicons name="chevron-down" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.timeArrow}>
                  <Ionicons name="arrow-forward" size={24} color={colors.zinc[600]} />
                </View>

                {/* End Time */}
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Bitiş</Text>
                  <View style={styles.timePicker}>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('end', 'hour', 1)}
                      >
                        <Ionicons name="chevron-up" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                      <Text style={styles.timeValue}>{endTime.hour.toString().padStart(2, '0')}</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('end', 'hour', -1)}
                      >
                        <Ionicons name="chevron-down" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('end', 'minute', 15)}
                      >
                        <Ionicons name="chevron-up" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                      <Text style={styles.timeValue}>{endTime.minute.toString().padStart(2, '0')}</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => adjustTime('end', 'minute', -15)}
                      >
                        <Ionicons name="chevron-down" size={20} color={colors.zinc[400]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Days Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aktif Günler</Text>
              <View style={styles.daysCard}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[styles.dayButton, selectedDays.includes(day.id) && styles.dayButtonActive]}
                    onPress={() => toggleDay(day.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayText, selectedDays.includes(day.id) && styles.dayTextActive]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Allow Critical */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>İstisnalar</Text>
              <View style={styles.card}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <View style={styles.toggleHeader}>
                      <Ionicons name="alert-circle" size={20} color={colors.error} />
                      <Text style={styles.toggleTitle}>Kritik Bildirimler</Text>
                    </View>
                    <Text style={styles.toggleDescription}>
                      Güvenlik uyarıları ve acil mesajlar yine de gösterilsin
                    </Text>
                  </View>
                  <Switch
                    value={allowCritical}
                    onValueChange={setAllowCritical}
                    trackColor={{ false: colors.zinc[700], true: colors.brand[600] }}
                    thumbColor={allowCritical ? colors.brand[400] : colors.zinc[400]}
                  />
                </View>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={styles.summaryText}>
                  Sessiz mod {formatTime(startTime)} - {formatTime(endTime)} saatleri arasında{' '}
                  {selectedDays.length === 7 ? 'her gün' : `${selectedDays.length} gün`} aktif olacak.
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.zinc[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.zinc[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.zinc[500],
    marginTop: 2,
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: colors.zinc[500],
    marginBottom: 12,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    width: 50,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.zinc[600],
    marginHorizontal: 4,
  },
  timeArrow: {
    paddingHorizontal: 16,
  },
  daysCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  dayButtonActive: {
    backgroundColor: colors.brand[600],
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.zinc[500],
  },
  dayTextActive: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: colors.zinc[400],
    lineHeight: 20,
  },
});

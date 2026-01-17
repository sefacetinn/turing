import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface QuietPreset {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: readonly [string, string];
  startTime: TimeSlot;
  endTime: TimeSlot;
  days: string[];
  description: string;
}

const presets: QuietPreset[] = [
  {
    id: 'night',
    name: 'Gece Modu',
    icon: 'moon',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#6D28D9'] as const,
    startTime: { hour: 22, minute: 0 },
    endTime: { hour: 8, minute: 0 },
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    description: '22:00 - 08:00, Her gün',
  },
  {
    id: 'work',
    name: 'Çalışma Saatleri',
    icon: 'briefcase',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#1D4ED8'] as const,
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 18, minute: 0 },
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    description: '09:00 - 18:00, Hafta içi',
  },
  {
    id: 'weekend',
    name: 'Hafta Sonu',
    icon: 'sunny',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'] as const,
    startTime: { hour: 0, minute: 0 },
    endTime: { hour: 23, minute: 59 },
    days: ['sat', 'sun'],
    description: 'Tüm gün, Cmt-Paz',
  },
  {
    id: 'custom',
    name: 'Özel',
    icon: 'settings',
    color: '#10B981',
    gradient: ['#10B981', '#059669'] as const,
    startTime: { hour: 22, minute: 0 },
    endTime: { hour: 8, minute: 0 },
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    description: 'Kendiniz ayarlayın',
  },
];

export function QuietHoursScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const [quietModeEnabled, setQuietModeEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('night');
  const [startTime, setStartTime] = useState<TimeSlot>({ hour: 22, minute: 0 });
  const [endTime, setEndTime] = useState<TimeSlot>({ hour: 8, minute: 0 });
  const [allowCritical, setAllowCritical] = useState(true);
  const [allowAlarms, setAllowAlarms] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('Şu anda müsait değilim. En kısa sürede dönüş yapacağım.');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

  // Animation refs
  const timelineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const days = [
    { id: 'mon', label: 'Pzt', fullLabel: 'Pazartesi' },
    { id: 'tue', label: 'Sal', fullLabel: 'Salı' },
    { id: 'wed', label: 'Çar', fullLabel: 'Çarşamba' },
    { id: 'thu', label: 'Per', fullLabel: 'Perşembe' },
    { id: 'fri', label: 'Cum', fullLabel: 'Cuma' },
    { id: 'sat', label: 'Cmt', fullLabel: 'Cumartesi' },
    { id: 'sun', label: 'Paz', fullLabel: 'Pazar' },
  ];

  // Pulse animation for active indicator
  useEffect(() => {
    if (quietModeEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [quietModeEnabled]);

  // Timeline animation
  useEffect(() => {
    Animated.timing(timelineAnim, {
      toValue: quietModeEnabled ? 1 : 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [quietModeEnabled]);

  const formatTime = (time: TimeSlot) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const toggleDay = (dayId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPreset('custom');
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId]
    );
  };

  const adjustTime = (type: 'start' | 'end', field: 'hour' | 'minute', delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPreset('custom');
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

  const selectPreset = (preset: QuietPreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setStartTime(preset.startTime);
      setEndTime(preset.endTime);
      setSelectedDays(preset.days);
    }
  };

  const handleToggleQuietMode = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuietModeEnabled(value);
  };

  // Calculate quiet hours for visual timeline (returns percentage of 24h)
  const calculateQuietHoursPercentage = () => {
    const startMinutes = startTime.hour * 60 + startTime.minute;
    let endMinutes = endTime.hour * 60 + endTime.minute;

    // Handle overnight periods
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const duration = endMinutes - startMinutes;
    return {
      start: (startMinutes / (24 * 60)) * 100,
      duration: (duration / (24 * 60)) * 100,
    };
  };

  const quietHoursPercentage = calculateQuietHoursPercentage();

  // Calculate quiet duration
  const calculateDuration = () => {
    const startMinutes = startTime.hour * 60 + startTime.minute;
    let endMinutes = endTime.hour * 60 + endTime.minute;

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours} saat`;
    }
    return `${hours} saat ${minutes} dk`;
  };

  const currentPreset = presets.find(p => p.id === selectedPreset);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sessiz Saatler</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Status */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrapper}>
            <Animated.View
              style={[
                styles.heroIconPulse,
                {
                  backgroundColor: quietModeEnabled ? 'rgba(245, 158, 11, 0.15)' : 'rgba(156, 163, 175, 0.1)',
                  transform: [{ scale: pulseAnim }],
                }
              ]}
            />
            <LinearGradient
              colors={quietModeEnabled ? ['#f59e0b', '#d97706'] : ['#6B7280', '#4B5563']}
              style={styles.iconBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="moon" size={32} color="white" />
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Rahatsız Etmeyin</Text>
          <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
            {quietModeEnabled
              ? `Sessiz mod ${formatTime(startTime)} - ${formatTime(endTime)} arasında aktif`
              : 'Bildirimler sessize alınmıyor'}
          </Text>

          {/* Duration Badge */}
          {quietModeEnabled && (
            <View style={[styles.durationBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="time-outline" size={14} color="#F59E0B" />
              <Text style={styles.durationText}>{calculateDuration()}</Text>
            </View>
          )}
        </View>

        {/* Visual Timeline */}
        {quietModeEnabled && (
          <View style={styles.timelineSection}>
            <View style={[styles.timelineContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F3F4F6' }]}>
              {/* Time markers */}
              <View style={styles.timeMarkers}>
                <Text style={[styles.timeMarker, { color: colors.textMuted }]}>00:00</Text>
                <Text style={[styles.timeMarker, { color: colors.textMuted }]}>06:00</Text>
                <Text style={[styles.timeMarker, { color: colors.textMuted }]}>12:00</Text>
                <Text style={[styles.timeMarker, { color: colors.textMuted }]}>18:00</Text>
                <Text style={[styles.timeMarker, { color: colors.textMuted }]}>24:00</Text>
              </View>

              {/* Timeline bar */}
              <View style={[styles.timelineBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB' }]}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={[
                    styles.timelineActive,
                    {
                      left: `${quietHoursPercentage.start}%`,
                      width: `${quietHoursPercentage.duration}%`,
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                {/* Start indicator */}
                <View style={[
                  styles.timeIndicator,
                  { left: `${quietHoursPercentage.start}%`, backgroundColor: '#F59E0B' }
                ]}>
                  <Text style={styles.timeIndicatorText}>{formatTime(startTime)}</Text>
                </View>
                {/* End indicator */}
                <View style={[
                  styles.timeIndicator,
                  { left: `${(quietHoursPercentage.start + quietHoursPercentage.duration) % 100}%`, backgroundColor: '#D97706' }
                ]}>
                  <Text style={styles.timeIndicatorText}>{formatTime(endTime)}</Text>
                </View>
              </View>

              {/* Hour ticks */}
              <View style={styles.hourTicks}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.hourTick,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#CBD5E1' },
                      i % 6 === 0 && styles.hourTickMajor,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Enable Toggle */}
        <View style={styles.section}>
          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
            }
          ]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleHeader}>
                  <Ionicons name="notifications-off" size={20} color={quietModeEnabled ? '#F59E0B' : colors.textMuted} />
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Sessiz Mod</Text>
                </View>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {quietModeEnabled ? 'Bildirimler susturuldu' : 'Tüm bildirimler aktif'}
                </Text>
              </View>
              <Switch
                value={quietModeEnabled}
                onValueChange={handleToggleQuietMode}
                trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: '#F59E0B' }}
                thumbColor={quietModeEnabled ? '#FFFFFF' : isDark ? colors.zinc[400] : colors.zinc[300]}
              />
            </View>
          </View>
        </View>

        {quietModeEnabled && (
          <>
            {/* Quick Presets */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Hızlı Ayarlar</Text>
              <View style={styles.presetsGrid}>
                {presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                        borderColor: selectedPreset === preset.id
                          ? preset.color
                          : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB'),
                        borderWidth: selectedPreset === preset.id ? 2 : 1,
                      }
                    ]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={selectedPreset === preset.id ? preset.gradient : [isDark ? '#374151' : '#F3F4F6', isDark ? '#374151' : '#F3F4F6']}
                      style={styles.presetIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={preset.icon}
                        size={18}
                        color={selectedPreset === preset.id ? 'white' : colors.textMuted}
                      />
                    </LinearGradient>
                    <Text style={[
                      styles.presetName,
                      { color: selectedPreset === preset.id ? colors.text : colors.textSecondary }
                    ]}>
                      {preset.name}
                    </Text>
                    <Text style={[styles.presetDescription, { color: colors.textMuted }]}>
                      {preset.description}
                    </Text>
                    {selectedPreset === preset.id && (
                      <View style={[styles.presetCheckmark, { backgroundColor: preset.color }]}>
                        <Ionicons name="checkmark" size={10} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Saat Aralığı</Text>
              <View style={[
                styles.timeCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
                }
              ]}>
                {/* Start Time */}
                <View style={styles.timeBlock}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Başlangıç</Text>
                  <View style={styles.timePicker}>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('start', 'hour', 1)}
                      >
                        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <View style={[styles.timeValueBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
                        <Text style={[styles.timeValue, { color: '#F59E0B' }]}>{startTime.hour.toString().padStart(2, '0')}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('start', 'hour', -1)}
                      >
                        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.timeSeparator, { color: '#F59E0B' }]}>:</Text>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('start', 'minute', 15)}
                      >
                        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <View style={[styles.timeValueBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)' }]}>
                        <Text style={[styles.timeValue, { color: '#F59E0B' }]}>{startTime.minute.toString().padStart(2, '0')}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('start', 'minute', -15)}
                      >
                        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.timeArrow}>
                  <View style={[styles.timeArrowBg, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}>
                    <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
                  </View>
                </View>

                {/* End Time */}
                <View style={styles.timeBlock}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Bitiş</Text>
                  <View style={styles.timePicker}>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('end', 'hour', 1)}
                      >
                        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <View style={[styles.timeValueBox, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.08)' }]}>
                        <Text style={[styles.timeValue, { color: '#D97706' }]}>{endTime.hour.toString().padStart(2, '0')}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('end', 'hour', -1)}
                      >
                        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.timeSeparator, { color: '#D97706' }]}>:</Text>
                    <View style={styles.timeColumn}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('end', 'minute', 15)}
                      >
                        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                      <View style={[styles.timeValueBox, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.08)' }]}>
                        <Text style={[styles.timeValue, { color: '#D97706' }]}>{endTime.minute.toString().padStart(2, '0')}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]}
                        onPress={() => adjustTime('end', 'minute', -15)}
                      >
                        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Days Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Aktif Günler</Text>
              <View style={[
                styles.daysCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
                }
              ]}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F3F4F6'
                      },
                      selectedDays.includes(day.id) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleDay(day.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: colors.textSecondary },
                      selectedDays.includes(day.id) && styles.dayTextActive
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.daysHint, { color: colors.textMuted }]}>
                {selectedDays.length === 7
                  ? 'Her gün aktif'
                  : selectedDays.length === 0
                    ? 'Hiçbir gün seçilmedi'
                    : `${selectedDays.length} gün seçildi`}
              </Text>
            </View>

            {/* Exceptions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>İstisnalar</Text>
              <View style={[
                styles.exceptionsCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
                }
              ]}>
                {/* Critical Notifications */}
                <View style={styles.exceptionItem}>
                  <View style={styles.exceptionLeft}>
                    <View style={[styles.exceptionIcon, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    </View>
                    <View style={styles.exceptionInfo}>
                      <Text style={[styles.exceptionTitle, { color: colors.text }]}>Kritik Bildirimler</Text>
                      <Text style={[styles.exceptionDescription, { color: colors.textSecondary }]}>
                        Güvenlik ve acil uyarılar
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={allowCritical}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAllowCritical(value);
                    }}
                    trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                    thumbColor={allowCritical ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
                  />
                </View>

                <View style={[styles.exceptionDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F3F4F6' }]} />

                {/* Alarms */}
                <View style={styles.exceptionItem}>
                  <View style={styles.exceptionLeft}>
                    <View style={[styles.exceptionIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                      <Ionicons name="alarm" size={18} color="#3B82F6" />
                    </View>
                    <View style={styles.exceptionInfo}>
                      <Text style={[styles.exceptionTitle, { color: colors.text }]}>Alarmlar</Text>
                      <Text style={[styles.exceptionDescription, { color: colors.textSecondary }]}>
                        Hatırlatıcılar ve zamanlayıcılar
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={allowAlarms}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAllowAlarms(value);
                    }}
                    trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: colors.brand[600] }}
                    thumbColor={allowAlarms ? colors.brand[400] : isDark ? colors.zinc[400] : colors.zinc[300]}
                  />
                </View>
              </View>
            </View>

            {/* Auto Reply */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Otomatik Yanıt</Text>
              <View style={[
                styles.autoReplyCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
                }
              ]}>
                <View style={styles.autoReplyHeader}>
                  <View style={styles.autoReplyLeft}>
                    <View style={[styles.autoReplyIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                      <Ionicons name="chatbubble-ellipses" size={18} color="#10B981" />
                    </View>
                    <View style={styles.autoReplyInfo}>
                      <Text style={[styles.autoReplyTitle, { color: colors.text }]}>Otomatik Yanıt</Text>
                      <Text style={[styles.autoReplyDescription, { color: colors.textSecondary }]}>
                        Mesajlara otomatik cevap gönder
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={autoReplyEnabled}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAutoReplyEnabled(value);
                    }}
                    trackColor={{ false: isDark ? colors.zinc[700] : colors.border, true: '#10B981' }}
                    thumbColor={autoReplyEnabled ? '#FFFFFF' : isDark ? colors.zinc[400] : colors.zinc[300]}
                  />
                </View>

                {autoReplyEnabled && (
                  <View style={styles.autoReplyMessageContainer}>
                    <TextInput
                      style={[
                        styles.autoReplyInput,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F9FAFB',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                          color: colors.text,
                        }
                      ]}
                      value={autoReplyMessage}
                      onChangeText={setAutoReplyMessage}
                      placeholder="Otomatik yanıt mesajınız..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <View style={[
                styles.summaryCard,
                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)' }
              ]}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={[styles.summaryText, { color: colors.textMuted }]}>
                  Sessiz mod {formatTime(startTime)} - {formatTime(endTime)} saatleri arasında{' '}
                  {selectedDays.length === 7 ? 'her gün' : `${selectedDays.length} gün`} aktif olacak.
                  {allowCritical && ' Kritik bildirimler yine de gösterilecek.'}
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
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  heroIconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineContainer: {
    borderRadius: 16,
    padding: 16,
  },
  timeMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeMarker: {
    fontSize: 10,
    fontWeight: '500',
  },
  timelineBar: {
    height: 24,
    borderRadius: 12,
    position: 'relative',
    marginBottom: 8,
  },
  timelineActive: {
    position: 'absolute',
    height: '100%',
    borderRadius: 12,
  },
  timeIndicator: {
    position: 'absolute',
    top: -6,
    transform: [{ translateX: -24 }],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  hourTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 8,
  },
  hourTick: {
    width: 1,
    height: 4,
  },
  hourTickMajor: {
    height: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
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
    gap: 10,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 30,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: '47%',
    padding: 14,
    borderRadius: 14,
    position: 'relative',
  },
  presetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 11,
  },
  presetCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
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
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValueBox: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 6,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  timeArrow: {
    paddingHorizontal: 8,
  },
  timeArrowBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysCard: {
    borderRadius: 16,
    borderWidth: 1,
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
  },
  dayButtonActive: {
    backgroundColor: '#F59E0B',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayTextActive: {
    color: 'white',
  },
  daysHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  exceptionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  exceptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  exceptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exceptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exceptionInfo: {
    flex: 1,
  },
  exceptionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  exceptionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  exceptionDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  autoReplyCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  autoReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  autoReplyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoReplyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  autoReplyInfo: {
    flex: 1,
  },
  autoReplyTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  autoReplyDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  autoReplyMessageContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  autoReplyInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});

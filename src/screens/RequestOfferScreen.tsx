import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OptimizedImage } from '../components/OptimizedImage';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

// Mock events for selection
const userEvents = [
  { id: 'e1', title: 'Yaz Festivali 2024', date: '15 Temmuz 2024', location: 'İstanbul' },
  { id: 'e2', title: 'Kurumsal Gala', date: '22 Ağustos 2024', location: 'Ankara' },
  { id: 'e3', title: 'Düğün Organizasyonu', date: '1 Eylül 2024', location: 'İzmir' },
];

export function RequestOfferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { provider, category } = (route.params as { provider?: any; category?: string }) || {};
  const { colors, isDark, helpers } = useTheme();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [attendees, setAttendees] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = () => {
    if (!selectedEvent) {
      Alert.alert('Uyarı', 'Lütfen bir etkinlik seçin');
      return;
    }

    Alert.alert(
      'Teklif Talebi Gönderildi',
      'Talebiniz sağlayıcıya iletildi. En kısa sürede size dönüş yapılacaktır.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Teklif Talebi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Info */}
        {provider && (
          <View style={[
            styles.providerCard,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            },
            ...(isDark ? [] : [helpers.getShadow('sm')])
          ]}>
            <OptimizedImage source={provider.image} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
              <Text style={[styles.providerCategory, { color: colors.textMuted }]}>{provider.description}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Event Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Etkinlik Seçin</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Bu teklif hangi etkinlik için?</Text>

          <View style={styles.eventsList}>
            {userEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : colors.cardBackground,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                  },
                  selectedEvent === event.id && [
                    styles.eventCardSelected,
                    { borderColor: colors.brand[500] }
                  ],
                  ...(isDark ? [] : [helpers.getShadow('sm')])
                ]}
                onPress={() => setSelectedEvent(event.id)}
              >
                <View style={styles.eventRadio}>
                  {selectedEvent === event.id ? (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.eventRadioSelected}
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.eventRadioEmpty, { borderColor: colors.textMuted }]} />
                  )}
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.date}</Text>
                    <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.eventMetaText, { color: colors.textMuted }]}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Create New Event Option */}
            <TouchableOpacity
              style={styles.newEventCard}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <View style={styles.newEventIcon}>
                <Ionicons name="add" size={20} color={colors.brand[400]} />
              </View>
              <Text style={[styles.newEventText, { color: colors.brand[400] }]}>Yeni Etkinlik Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bütçe Aralığı</Text>
          <View style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            }
          ]}>
            <Ionicons name="cash-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Örn: 50.000 - 100.000 TL"
              placeholderTextColor={colors.textMuted}
              value={budget}
              onChangeText={setBudget}
              keyboardType="default"
            />
          </View>
        </View>

        {/* Date & Duration */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tarih</Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
              }
            ]}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="GG/AA/YYYY"
                placeholderTextColor={colors.textMuted}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Süre</Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
              }
            ]}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Örn: 4 saat"
                placeholderTextColor={colors.textMuted}
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>
        </View>

        {/* Attendees */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Katılımcı Sayısı</Text>
          <View style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            }
          ]}>
            <Ionicons name="people-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Tahmini katılımcı sayısı"
              placeholderTextColor={colors.textMuted}
              value={attendees}
              onChangeText={setAttendees}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Özel Gereksinimler</Text>
          <View style={[
            styles.textAreaContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            }
          ]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Özel isteklerinizi veya gereksinimlerinizi yazın..."
              placeholderTextColor={colors.textMuted}
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ek Açıklama</Text>
          <View style={[
            styles.textAreaContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
            }
          ]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Etkinlik hakkında detaylı bilgi verin..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[
        styles.bottomAction,
        {
          backgroundColor: isDark ? 'rgba(9, 9, 11, 0.95)' : colors.background,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
        }
      ]}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.submitButtonText}>Teklif Talebi Gönder</Text>
            <Ionicons name="paper-plane" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  providerCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  providerCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  eventsList: {
    gap: 10,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  eventCardSelected: {
    backgroundColor: 'rgba(75, 48, 184, 0.05)',
  },
  eventRadio: {
    marginRight: 12,
  },
  eventRadioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  eventRadioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 11,
    marginRight: 8,
  },
  newEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(75, 48, 184, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 48, 184, 0.2)',
    borderStyle: 'dashed',
  },
  newEventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 48, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newEventText: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  textArea: {
    fontSize: 14,
    minHeight: 80,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 100,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});

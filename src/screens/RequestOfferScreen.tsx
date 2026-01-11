import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme/colors';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teklif Talebi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Info */}
        {provider && (
          <View style={styles.providerCard}>
            <Image source={{ uri: provider.image }} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCategory}>{provider.description}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Event Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlik Seçin</Text>
          <Text style={styles.sectionSubtitle}>Bu teklif hangi etkinlik için?</Text>

          <View style={styles.eventsList}>
            {userEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  selectedEvent === event.id && styles.eventCardSelected
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
                    <View style={styles.eventRadioEmpty} />
                  )}
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.zinc[500]} />
                    <Text style={styles.eventMetaText}>{event.date}</Text>
                    <Ionicons name="location-outline" size={12} color={colors.zinc[500]} />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
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
              <Text style={styles.newEventText}>Yeni Etkinlik Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bütçe Aralığı</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={18} color={colors.zinc[500]} />
            <TextInput
              style={styles.input}
              placeholder="Örn: 50.000 - 100.000 TL"
              placeholderTextColor={colors.zinc[600]}
              value={budget}
              onChangeText={setBudget}
              keyboardType="default"
            />
          </View>
        </View>

        {/* Date & Duration */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.sectionTitle}>Tarih</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                placeholder="GG/AA/YYYY"
                placeholderTextColor={colors.zinc[600]}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.sectionTitle}>Süre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="time-outline" size={18} color={colors.zinc[500]} />
              <TextInput
                style={styles.input}
                placeholder="Örn: 4 saat"
                placeholderTextColor={colors.zinc[600]}
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>
        </View>

        {/* Attendees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Katılımcı Sayısı</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={18} color={colors.zinc[500]} />
            <TextInput
              style={styles.input}
              placeholder="Tahmini katılımcı sayısı"
              placeholderTextColor={colors.zinc[600]}
              value={attendees}
              onChangeText={setAttendees}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özel Gereksinimler</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Özel isteklerinizi veya gereksinimlerinizi yazın..."
              placeholderTextColor={colors.zinc[600]}
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
          <Text style={styles.sectionTitle}>Ek Açıklama</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Etkinlik hakkında detaylı bilgi verin..."
              placeholderTextColor={colors.zinc[600]}
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
      <View style={styles.bottomAction}>
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
    backgroundColor: colors.background,
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
    color: colors.text,
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
    color: colors.text,
  },
  providerCategory: {
    fontSize: 12,
    color: colors.zinc[400],
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
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.zinc[500],
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
    borderColor: colors.brand[500],
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
  },
  eventRadio: {
    marginRight: 12,
  },
  eventRadioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.zinc[600],
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
    color: colors.text,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 11,
    color: colors.zinc[500],
    marginRight: 8,
  },
  newEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    borderStyle: 'dashed',
  },
  newEventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newEventText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brand[400],
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
    color: colors.text,
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
    color: colors.text,
    minHeight: 80,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
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

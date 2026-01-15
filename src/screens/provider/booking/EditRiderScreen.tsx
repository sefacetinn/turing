import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import {
  getArtistById,
  TechnicalRider,
  TransportRider,
  AccommodationRider,
  BackstageRider,
  riderTypeLabels,
} from '../../../data/provider/artistData';

type RiderType = 'technical' | 'transport' | 'accommodation' | 'backstage';

type RouteParams = {
  EditRider: { artistId: string; riderType: RiderType };
};

const riderConfig = {
  technical: { icon: 'hardware-chip-outline', color: '#6366F1' },
  transport: { icon: 'car-outline', color: '#F59E0B' },
  accommodation: { icon: 'bed-outline', color: '#10B981' },
  backstage: { icon: 'cafe-outline', color: '#EC4899' },
};

export function EditRiderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'EditRider'>>();
  const { colors, isDark } = useTheme();

  const { artistId, riderType } = route.params;
  const artist = useMemo(() => getArtistById(artistId), [artistId]);
  const existingRider = artist?.riders[riderType];

  // Technical Rider States
  const [stageWidth, setStageWidth] = useState(
    (existingRider as TechnicalRider)?.stage?.minWidth?.toString() || ''
  );
  const [stageDepth, setStageDepth] = useState(
    (existingRider as TechnicalRider)?.stage?.minDepth?.toString() || ''
  );
  const [stageHeight, setStageHeight] = useState(
    (existingRider as TechnicalRider)?.stage?.minHeight?.toString() || ''
  );
  const [roofRequired, setRoofRequired] = useState(
    (existingRider as TechnicalRider)?.stage?.roofRequired || false
  );
  const [soundPower, setSoundPower] = useState(
    (existingRider as TechnicalRider)?.sound?.minPower?.toString() || ''
  );
  const [monitors, setMonitors] = useState(
    (existingRider as TechnicalRider)?.sound?.monitors?.toString() || ''
  );
  const [movingHeads, setMovingHeads] = useState(
    (existingRider as TechnicalRider)?.lighting?.movingHeadCount?.toString() || ''
  );
  const [hazeRequired, setHazeRequired] = useState(
    (existingRider as TechnicalRider)?.lighting?.hazeRequired || false
  );
  const [loadInHours, setLoadInHours] = useState(
    (existingRider as TechnicalRider)?.timing?.loadInHours?.toString() || ''
  );
  const [soundCheckHours, setSoundCheckHours] = useState(
    (existingRider as TechnicalRider)?.timing?.soundCheckHours?.toString() || ''
  );

  // Transport Rider States
  const [airportTransfer, setAirportTransfer] = useState(
    (existingRider as TransportRider)?.airportTransfer?.required || false
  );
  const [passengerCount, setPassengerCount] = useState(
    (existingRider as TransportRider)?.airportTransfer?.passengerCount?.toString() || ''
  );
  const [localTransport, setLocalTransport] = useState(
    (existingRider as TransportRider)?.localTransport?.required || false
  );
  const [availableHours, setAvailableHours] = useState(
    (existingRider as TransportRider)?.localTransport?.availableHours || ''
  );

  // Accommodation Rider States
  const [artistRoomCount, setArtistRoomCount] = useState(
    (existingRider as AccommodationRider)?.artistRooms?.count?.toString() || ''
  );
  const [crewRoomCount, setCrewRoomCount] = useState(
    (existingRider as AccommodationRider)?.crewRooms?.count?.toString() || ''
  );
  const [minStarRating, setMinStarRating] = useState(
    (existingRider as AccommodationRider)?.artistRooms?.minStarRating?.toString() || '4'
  );
  const [breakfast, setBreakfast] = useState(
    (existingRider as AccommodationRider)?.meals?.breakfast || false
  );

  // Backstage Rider States
  const [dressingRoomCount, setDressingRoomCount] = useState(
    (existingRider as BackstageRider)?.dressingRoom?.count?.toString() || ''
  );
  const [privateRequired, setPrivateRequired] = useState(
    (existingRider as BackstageRider)?.dressingRoom?.privateRequired || false
  );
  const [hotMeals, setHotMeals] = useState(
    (existingRider as BackstageRider)?.catering?.hotMeals || false
  );

  // Common
  const [notes, setNotes] = useState(
    (existingRider as any)?.notes || ''
  );

  const config = riderConfig[riderType];

  const handleSave = () => {
    // Validate required fields based on rider type
    Alert.alert(
      'Basarili',
      'Rider bilgileri kaydedildi.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default',
    suffix?: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
        />
        {suffix && <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{suffix}</Text>}
      </View>
    </View>
  );

  const renderSwitch = (label: string, value: boolean, onChange: (val: boolean) => void) => (
    <View style={[styles.switchRow, { borderColor: colors.border }]}>
      <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  const renderTechnicalForm = () => (
    <>
      {/* Stage Section */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Sahne Gereksinimleri</Text>
        <View style={styles.inputRow}>
          {renderInput('Min. Genislik', stageWidth, setStageWidth, '12', 'numeric', 'm')}
          {renderInput('Min. Derinlik', stageDepth, setStageDepth, '10', 'numeric', 'm')}
        </View>
        {renderInput('Min. Yukseklik', stageHeight, setStageHeight, '8', 'numeric', 'm')}
        {renderSwitch('Cati Gerekli', roofRequired, setRoofRequired)}
      </View>

      {/* Sound Section */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Ses Sistemi</Text>
        {renderInput('Min. Guc', soundPower, setSoundPower, '15000', 'numeric', 'W')}
        {renderInput('Monitor Sayisi', monitors, setMonitors, '6', 'numeric', 'adet')}
      </View>

      {/* Lighting Section */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Isik Sistemi</Text>
        {renderInput('Moving Head', movingHeads, setMovingHeads, '24', 'numeric', 'adet')}
        {renderSwitch('Haze/Sis Makinesi', hazeRequired, setHazeRequired)}
      </View>

      {/* Timing Section */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Zamanlama</Text>
        <View style={styles.inputRow}>
          {renderInput('Kurulum', loadInHours, setLoadInHours, '4', 'numeric', 'saat')}
          {renderInput('Ses Kontrolu', soundCheckHours, setSoundCheckHours, '2', 'numeric', 'saat')}
        </View>
      </View>
    </>
  );

  const renderTransportForm = () => (
    <>
      {/* Airport Transfer */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Havalimani Transferi</Text>
        {renderSwitch('Transfer Gerekli', airportTransfer, setAirportTransfer)}
        {airportTransfer && (
          <>
            {renderInput('Yolcu Sayisi', passengerCount, setPassengerCount, '10', 'numeric', 'kisi')}
          </>
        )}
      </View>

      {/* Local Transport */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Sehir Ici Ulasim</Text>
        {renderSwitch('Ulasim Gerekli', localTransport, setLocalTransport)}
        {localTransport && (
          <>
            {renderInput('Musait Saatler', availableHours, setAvailableHours, '10:00-02:00')}
          </>
        )}
      </View>
    </>
  );

  const renderAccommodationForm = () => (
    <>
      {/* Artist Rooms */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Sanatci Konaklamasi</Text>
        {renderInput('Oda Sayisi', artistRoomCount, setArtistRoomCount, '2', 'numeric', 'oda')}
        {renderInput('Min. Yildiz', minStarRating, setMinStarRating, '5', 'numeric', 'yildiz')}
      </View>

      {/* Crew Rooms */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Ekip Konaklamasi</Text>
        {renderInput('Oda Sayisi', crewRoomCount, setCrewRoomCount, '6', 'numeric', 'oda')}
      </View>

      {/* Meals */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Yemek</Text>
        {renderSwitch('Kahvalti Dahil', breakfast, setBreakfast)}
      </View>
    </>
  );

  const renderBackstageForm = () => (
    <>
      {/* Dressing Room */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Soyunma Odasi</Text>
        {renderInput('Oda Sayisi', dressingRoomCount, setDressingRoomCount, '2', 'numeric', 'oda')}
        {renderSwitch('Ozel Oda Gerekli', privateRequired, setPrivateRequired)}
      </View>

      {/* Catering */}
      <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.formSectionTitle, { color: colors.text }]}>Catering</Text>
        {renderSwitch('Sicak Yemek', hotMeals, setHotMeals)}
      </View>
    </>
  );

  const renderFormByType = () => {
    switch (riderType) {
      case 'technical':
        return renderTechnicalForm();
      case 'transport':
        return renderTransportForm();
      case 'accommodation':
        return renderAccommodationForm();
      case 'backstage':
        return renderBackstageForm();
      default:
        return null;
    }
  };

  if (!artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Sanatci bulunamadi</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {riderTypeLabels[riderType]}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Artist Info */}
          <View style={[styles.artistInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.artistInfoLabel, { color: colors.textSecondary }]}>Sanatci</Text>
            <Text style={[styles.artistInfoName, { color: colors.text }]}>
              {artist.stageName || artist.name}
            </Text>
          </View>

          {renderFormByType()}

          {/* Notes */}
          <View style={[styles.formSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formSectionTitle, { color: colors.text }]}>Ek Notlar</Text>
            <TextInput
              style={[
                styles.notesInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ozel gereksinimler, notlar..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Upload Document */}
          <TouchableOpacity
            style={[styles.uploadButton, { borderColor: colors.border }]}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
              Rider Dokumani Yukle (PDF)
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: 'white', fontWeight: '600' },

  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 100 },

  artistInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  artistInfoLabel: { fontSize: 12, marginBottom: 4 },
  artistInfoName: { fontSize: 18, fontWeight: '600' },

  formSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputSuffix: { fontSize: 14, marginLeft: 8 },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  switchLabel: { fontSize: 15 },

  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadButtonText: { fontSize: 15, fontWeight: '500' },

  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getArtistById, Artist } from '../../../data/provider/artistData';

type RouteParams = {
  AddEditArtist: { artistId?: string };
};

const genreOptions = [
  'Pop', 'Rock', 'Electronic', 'House', 'Techno', 'R&B', 'Hip Hop',
  'Jazz', 'Classical', 'Turkish Pop', 'Arabesque', 'Alternative',
  'Deep House', 'Melodic Techno', 'Folk', 'Metal',
];

export function AddEditArtistScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'AddEditArtist'>>();
  const { colors, isDark } = useTheme();

  const artistId = route.params?.artistId;
  const existingArtist = useMemo(
    () => (artistId ? getArtistById(artistId) : null),
    [artistId]
  );
  const isEditing = !!existingArtist;

  // Form States
  const [name, setName] = useState(existingArtist?.name || '');
  const [stageName, setStageName] = useState(existingArtist?.stageName || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(existingArtist?.genre || []);
  const [description, setDescription] = useState(existingArtist?.description || '');
  const [bio, setBio] = useState(existingArtist?.bio || '');
  const [priceMin, setPriceMin] = useState(existingArtist?.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState(existingArtist?.priceMax?.toString() || '');
  const [instagram, setInstagram] = useState(existingArtist?.socialMedia?.instagram || '');
  const [spotify, setSpotify] = useState(existingArtist?.socialMedia?.spotify || '');
  const [youtube, setYoutube] = useState(existingArtist?.socialMedia?.youtube || '');
  const [status, setStatus] = useState<Artist['status']>(existingArtist?.status || 'active');
  const [availability, setAvailability] = useState<Artist['availability']>(
    existingArtist?.availability || 'available'
  );

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Sanatci adi gereklidir.');
      return;
    }
    if (selectedGenres.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'En az bir tur secmelisiniz.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Basarili',
      isEditing ? 'Sanatci bilgileri guncellendi.' : 'Yeni sanatci eklendi.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const toggleGenre = (genre: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          multiline ? styles.textArea : styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
      />
    </View>
  );

  const statusOptions = [
    { key: 'active', label: 'Aktif', color: '#10B981' },
    { key: 'inactive', label: 'Pasif', color: '#9CA3AF' },
    { key: 'on_tour', label: 'Turda', color: '#6366F1' },
  ];

  const availabilityOptions = [
    { key: 'available', label: 'Musait', color: '#10B981' },
    { key: 'busy', label: 'Mesgul', color: '#EF4444' },
    { key: 'limited', label: 'Sinirli', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Sanatciyi Duzenle' : 'Yeni Sanatci Ekle'}
        </Text>
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
          {/* Image Upload */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={[styles.imageUpload, { borderColor: colors.border }]}
            >
              {existingArtist?.image ? (
                <OptimizedImage source={existingArtist.image} style={styles.previewImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                  <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>
                    Profil Fotografi
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.coverUpload, { borderColor: colors.border }]}
            >
              {existingArtist?.coverImage ? (
                <OptimizedImage source={existingArtist.coverImage} style={styles.coverPreviewImage} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.coverUploadText, { color: colors.textSecondary }]}>
                    Kapak Fotografi
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Temel Bilgiler</Text>
            {renderInput('Gercek Ad *', name, setName, 'Ahmet Yilmaz')}
            {renderInput('Sahne Adi', stageName, setStageName, 'DJ Phantom')}
            {renderInput('Kisa Tanitim', description, setDescription, 'Pop sanatcisi...', true)}
            {renderInput('Biyografi', bio, setBio, 'Detayli biyografi...', true)}
          </View>

          {/* Genres */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Muzik Turleri * ({selectedGenres.length} secili)
            </Text>
            <View style={styles.genreGrid}>
              {genreOptions.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreChip,
                      {
                        backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleGenre(genre)}
                  >
                    <Text
                      style={[
                        styles.genreChipText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {genre}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Pricing */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fiyatlandirma</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                {renderInput('Min. Ucret', priceMin, setPriceMin, '50000', false, 'numeric')}
              </View>
              <Text style={[styles.priceSeparator, { color: colors.textSecondary }]}>-</Text>
              <View style={styles.priceInput}>
                {renderInput('Max. Ucret', priceMax, setPriceMax, '150000', false, 'numeric')}
              </View>
            </View>
          </View>

          {/* Status */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Durum</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: status === option.key ? option.color + '20' : colors.background,
                      borderColor: status === option.key ? option.color : colors.border,
                    },
                  ]}
                  onPress={() => setStatus(option.key as Artist['status'])}
                >
                  <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: status === option.key ? option.color : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Musaitlik</Text>
            <View style={styles.statusRow}>
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: availability === option.key ? option.color + '20' : colors.background,
                      borderColor: availability === option.key ? option.color : colors.border,
                    },
                  ]}
                  onPress={() => setAvailability(option.key as Artist['availability'])}
                >
                  <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: availability === option.key ? option.color : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Social Media */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sosyal Medya</Text>
            <View style={styles.socialInputGroup}>
              <View style={[styles.socialIconBox, { backgroundColor: '#E4405F20' }]}>
                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              </View>
              <TextInput
                style={[styles.socialInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="@kullaniciadi"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.socialInputGroup}>
              <View style={[styles.socialIconBox, { backgroundColor: '#1DB95420' }]}>
                <Ionicons name="musical-notes" size={20} color="#1DB954" />
              </View>
              <TextInput
                style={[styles.socialInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={spotify}
                onChangeText={setSpotify}
                placeholder="Spotify Artist ID"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.socialInputGroup}>
              <View style={[styles.socialIconBox, { backgroundColor: '#FF000020' }]}>
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              </View>
              <TextInput
                style={[styles.socialInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={youtube}
                onChangeText={setYoutube}
                placeholder="YouTube kanal adi"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

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
  headerTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: 'white', fontWeight: '600' },

  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 100 },

  imageSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageUpload: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  imageUploadText: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  coverUpload: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverPreviewImage: { width: '100%', height: '100%' },
  coverUploadText: { fontSize: 12, marginTop: 4 },

  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, marginBottom: 8 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
  },

  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  genreChipText: { fontSize: 13 },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: { flex: 1 },
  priceSeparator: { fontSize: 20, marginHorizontal: 12 },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusOptionText: { fontSize: 13, fontWeight: '500' },

  socialInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  socialIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});

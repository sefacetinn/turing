import React, { useState, useEffect } from 'react';
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
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { OptimizedImage } from '../../../components/OptimizedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { Artist } from '../../../data/provider/artistData';
import { useAuth } from '../../../context/AuthContext';
import { addDocument, updateDocument, getDocument, Collections } from '../../../services/firebase/firestore';

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
  const { user } = useAuth();

  const artistId = route.params?.artistId;
  const isEditing = !!artistId;

  // Loading state for fetching existing data
  const [isLoading, setIsLoading] = useState(isEditing);

  // Form States
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [bio, setBio] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [instagram, setInstagram] = useState('');
  const [spotify, setSpotify] = useState('');
  const [youtube, setYoutube] = useState('');
  const [status, setStatus] = useState<Artist['status']>('active');
  const [availability, setAvailability] = useState<Artist['availability']>('available');
  const [isSaving, setIsSaving] = useState(false);

  // Image States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Fetch existing artist data when editing
  useEffect(() => {
    if (isEditing && artistId) {
      fetchArtistData();
    }
  }, [artistId]);

  const fetchArtistData = async () => {
    if (!artistId) return;

    try {
      setIsLoading(true);
      const artistData = await getDocument<Artist>(Collections.ARTISTS, artistId);

      if (artistData) {
        // Populate form fields with existing data
        setName(artistData.name || '');
        setStageName(artistData.stageName || '');
        setDescription(artistData.description || '');
        setBio(artistData.bio || '');
        setStatus(artistData.status || 'active');
        setAvailability(artistData.availability || 'available');

        // Handle genres (could be array or string)
        if (artistData.genre) {
          if (Array.isArray(artistData.genre)) {
            setSelectedGenres(artistData.genre);
          } else if (typeof artistData.genre === 'string') {
            setSelectedGenres([artistData.genre]);
          }
        }

        // Handle price
        if (artistData.priceMin) {
          setPriceMin(artistData.priceMin.toString());
        }
        if (artistData.priceMax) {
          setPriceMax(artistData.priceMax.toString());
        }

        // Handle social media
        if (artistData.socialMedia) {
          setInstagram(artistData.socialMedia.instagram || '');
          setSpotify(artistData.socialMedia.spotify || '');
          setYoutube(artistData.socialMedia.youtube || '');
        }

        // Handle images
        if (artistData.image) {
          setProfileImage(artistData.image);
        }
        if (artistData.coverImage) {
          setCoverImage(artistData.coverImage);
        }
      }
    } catch (error) {
      console.warn('Error fetching artist data:', error);
      Alert.alert('Hata', 'Sanatçı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pick Profile Image
  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Error picking image:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Pick Cover Image
  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Error picking image:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Sanatçı adı gereklidir.');
      return;
    }
    if (selectedGenres.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'En az bir tür seçmelisiniz.');
      return;
    }

    if (!user) {
      Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
      return;
    }

    setIsSaving(true);

    try {
      const artistData: Record<string, any> = {
        name: name.trim(),
        genre: selectedGenres,
        status,
        availability,
        ownerId: user.uid,
        rating: 0,
        reviewCount: 0,
        totalShows: 0,
        totalRevenue: 0,
      };

      // Add optional fields only if they have values
      if (stageName.trim()) artistData.stageName = stageName.trim();
      if (description.trim()) artistData.description = description.trim();
      if (bio.trim()) artistData.bio = bio.trim();
      if (priceMin) artistData.priceMin = parseInt(priceMin) || 0;
      if (priceMax) artistData.priceMax = parseInt(priceMax) || 0;
      if (priceMin && priceMax) {
        artistData.priceRange = `₺${parseInt(priceMin).toLocaleString('tr-TR')} - ₺${parseInt(priceMax).toLocaleString('tr-TR')}`;
      }

      // Social media
      const socialMedia: Record<string, string> = {};
      if (instagram.trim()) socialMedia.instagram = instagram.trim();
      if (spotify.trim()) socialMedia.spotify = spotify.trim();
      if (youtube.trim()) socialMedia.youtube = youtube.trim();
      if (Object.keys(socialMedia).length > 0) {
        artistData.socialMedia = socialMedia;
      }

      // Images - use selected or default
      artistData.image = profileImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400';
      if (coverImage) artistData.coverImage = coverImage;

      if (isEditing && artistId) {
        await updateDocument(Collections.ARTISTS, artistId, artistData);
      } else {
        await addDocument(Collections.ARTISTS, artistData);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Başarılı',
        isEditing ? 'Sanatçı bilgileri güncellendi.' : 'Yeni sanatçı eklendi.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.warn('Error saving artist:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Sanatçı kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
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

  // Show loading state while fetching existing artist data
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Sanatçıyı Düzenle
          </Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Sanatçı bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {isEditing ? 'Sanatçıyı Düzenle' : 'Yeni Sanatçı Ekle'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
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
              onPress={pickProfileImage}
              activeOpacity={0.7}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.previewImage} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                  <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>
                    Profil Fotoğrafı
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.coverUpload, { borderColor: colors.border }]}
              onPress={pickCoverImage}
              activeOpacity={0.7}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverPreviewImage} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.coverUploadText, { color: colors.textSecondary }]}>
                    Kapak Fotoğrafı
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },

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

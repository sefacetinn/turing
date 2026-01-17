import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

// Poster size types
type PosterSize = 'story' | 'post';

interface PosterSizeConfig {
  id: PosterSize;
  name: string;
  dimensions: string;
  width: number;
  height: number;
  aspectRatio: number;
}

const posterSizes: PosterSizeConfig[] = [
  { id: 'story', name: 'Story', dimensions: '1080 x 1920', width: 1080, height: 1920, aspectRatio: 9 / 16 },
  { id: 'post', name: 'Post', dimensions: '1080 x 1080', width: 1080, height: 1080, aspectRatio: 1 },
];

// Template types with gradient colors
interface PosterTemplate {
  id: string;
  name: string;
  style: string;
  preview: string;
  gradientColors: readonly [string, string, ...string[]];
  textColor: string;
  accentColor: string;
  overlayOpacity: number;
  fontStyle: 'modern' | 'elegant' | 'bold' | 'retro';
}

const posterTemplates: PosterTemplate[] = [
  {
    id: 'neon',
    name: 'Neon Gece',
    style: 'Neon ışıklı, karanlık arka plan',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
    gradientColors: ['#0f0f23', '#1a1a3e', '#2d1b4e'],
    textColor: '#ffffff',
    accentColor: '#ff00ff',
    overlayOpacity: 0.7,
    fontStyle: 'modern',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    style: 'Sade ve şık tasarım',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    gradientColors: ['#1a1a1a', '#2d2d2d', '#1a1a1a'],
    textColor: '#ffffff',
    accentColor: '#4b30b8',
    overlayOpacity: 0.85,
    fontStyle: 'elegant',
  },
  {
    id: 'festival',
    name: 'Festival',
    style: 'Enerjik ve renkli',
    preview: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    gradientColors: ['#ff6b6b', '#feca57', '#48dbfb'],
    textColor: '#ffffff',
    accentColor: '#feca57',
    overlayOpacity: 0.6,
    fontStyle: 'bold',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    style: 'Lüks ve sofistike',
    preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    gradientColors: ['#1a1a2e', '#16213e', '#0f3460'],
    textColor: '#eaeaea',
    accentColor: '#d4af37',
    overlayOpacity: 0.75,
    fontStyle: 'elegant',
  },
  {
    id: 'retro',
    name: 'Retro',
    style: '80ler ve 90lar esintisi',
    preview: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400',
    gradientColors: ['#2d1b69', '#7b2cbf', '#ff006e'],
    textColor: '#ffffff',
    accentColor: '#01cdfe',
    overlayOpacity: 0.65,
    fontStyle: 'retro',
  },
  {
    id: 'concert',
    name: 'Konser',
    style: 'Sahne ışıkları ve kalabalık',
    preview: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    gradientColors: ['#0f0f0f', '#1f1f1f', '#2a0a3a'],
    textColor: '#ffffff',
    accentColor: '#8b5cf6',
    overlayOpacity: 0.7,
    fontStyle: 'bold',
  },
];

interface PosterGeneratorProps {
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventLocation: string;
  eventImage: string;
  artistNames?: string[];
}

export function PosterGenerator({
  eventTitle,
  eventDate,
  eventVenue,
  eventLocation,
  eventImage,
  artistNames = [],
}: PosterGeneratorProps) {
  const { colors, isDark } = useTheme();
  const viewShotRef = useRef<ViewShot>(null);

  const [selectedSize, setSelectedSize] = useState<PosterSize>('story');
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>(posterTemplates[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterGenerated, setPosterGenerated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedSizeConfig = posterSizes.find(s => s.id === selectedSize) ?? posterSizes[0];
  const previewWidth = width - 80;
  const previewHeight = previewWidth / selectedSizeConfig.aspectRatio;

  // Generate poster
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setPosterGenerated(false);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPosterGenerated(true);
    setIsGenerating(false);
  }, []);

  // Save poster to gallery
  const handleDownload = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye kaydetmek için izin vermeniz gerekiyor.');
        return;
      }

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Başarılı', 'Afiş galeriye kaydedildi.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Hata', 'Afiş kaydedilirken bir hata oluştu.');
    }
  }, []);

  // Share poster
  const handleShare = useCallback(async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `${eventTitle} Afişi`,
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [eventTitle]);

  // Render the actual poster design
  const renderPosterDesign = () => {
    const isStory = selectedSize === 'story';
    const template = selectedTemplate;

    return (
      <View style={[
        styles.posterCanvas,
        {
          width: previewWidth,
          height: Math.min(previewHeight, isStory ? 500 : 320),
        }
      ]}>
        {/* Background Gradient */}
        <LinearGradient
          colors={template.gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Event Image Overlay */}
        {eventImage && (
          <View style={[StyleSheet.absoluteFillObject, { opacity: 1 - template.overlayOpacity }]}>
            <Image
              source={{ uri: eventImage }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={2}
            />
          </View>
        )}

        {/* Decorative Elements based on template */}
        {template.id === 'neon' && (
          <>
            <View style={[styles.neonLine, { backgroundColor: '#ff00ff', top: '15%', left: -20, transform: [{ rotate: '-15deg' }] }]} />
            <View style={[styles.neonLine, { backgroundColor: '#00ffff', bottom: '20%', right: -20, transform: [{ rotate: '15deg' }] }]} />
            <View style={[styles.neonGlow, { backgroundColor: template.accentColor, top: '10%', right: '10%' }]} />
          </>
        )}

        {template.id === 'festival' && (
          <>
            <View style={[styles.confetti, { backgroundColor: '#ff6b6b', top: '8%', left: '15%' }]} />
            <View style={[styles.confetti, { backgroundColor: '#feca57', top: '12%', right: '20%' }]} />
            <View style={[styles.confetti, { backgroundColor: '#48dbfb', top: '5%', right: '35%' }]} />
            <View style={[styles.confetti, { backgroundColor: '#ff6b6b', bottom: '25%', left: '10%' }]} />
          </>
        )}

        {template.id === 'retro' && (
          <>
            <View style={[styles.retroGrid, { opacity: 0.15 }]} />
            <View style={[styles.retroSun, { backgroundColor: template.accentColor }]} />
          </>
        )}

        {template.id === 'concert' && (
          <>
            <View style={[styles.spotlight, { left: '10%', backgroundColor: '#8b5cf6' }]} />
            <View style={[styles.spotlight, { left: '50%', backgroundColor: '#ec4899' }]} />
            <View style={[styles.spotlight, { right: '10%', backgroundColor: '#f59e0b' }]} />
          </>
        )}

        {/* Content Container */}
        <View style={[styles.posterContent, { paddingVertical: isStory ? 40 : 24 }]}>
          {/* Top Section - Date Badge */}
          <View style={styles.posterTop}>
            <View style={[styles.dateBadge, { backgroundColor: `${template.accentColor}30`, borderColor: template.accentColor }]}>
              <Text style={[styles.dateBadgeText, { color: template.accentColor }]}>{eventDate}</Text>
            </View>
          </View>

          {/* Middle Section - Event Title & Artists */}
          <View style={styles.posterMiddle}>
            <Text style={[
              styles.eventTitle,
              { color: template.textColor },
              template.fontStyle === 'elegant' && styles.fontElegant,
              template.fontStyle === 'bold' && styles.fontBold,
              template.fontStyle === 'retro' && styles.fontRetro,
              !isStory && { fontSize: 24 },
            ]}>
              {eventTitle}
            </Text>

            {artistNames.length > 0 && (
              <View style={styles.artistsContainer}>
                <View style={[styles.artistsDivider, { backgroundColor: template.accentColor }]} />
                <Text style={[styles.artistsLabel, { color: template.accentColor }]}>FEATURING</Text>
                <Text style={[
                  styles.artistsText,
                  { color: template.textColor },
                  !isStory && { fontSize: 14 },
                ]}>
                  {artistNames.join(' • ')}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Section - Venue Info */}
          <View style={styles.posterBottom}>
            <View style={[styles.venueContainer, { borderTopColor: `${template.textColor}30` }]}>
              <Ionicons name="location" size={isStory ? 18 : 14} color={template.accentColor} />
              <View style={styles.venueTextContainer}>
                <Text style={[styles.venueName, { color: template.textColor }, !isStory && { fontSize: 12 }]}>{eventVenue}</Text>
                <Text style={[styles.venueLocation, { color: `${template.textColor}99` }, !isStory && { fontSize: 10 }]}>{eventLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Branding */}
        <View style={styles.brandingContainer}>
          <Text style={[styles.brandingText, { color: `${template.textColor}60` }]}>TURİNG</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Size Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Boyut Seçin</Text>
        <View style={styles.sizeOptions}>
          {posterSizes.map(size => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeOption,
                {
                  backgroundColor: selectedSize === size.id
                    ? isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.1)'
                    : isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
                  borderColor: selectedSize === size.id ? colors.brand[400] : isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                },
              ]}
              onPress={() => {
                setSelectedSize(size.id);
                setPosterGenerated(false);
              }}
            >
              <View style={[
                styles.sizePreview,
                {
                  aspectRatio: size.aspectRatio,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}>
                <Ionicons
                  name={size.id === 'story' ? 'phone-portrait' : 'square'}
                  size={20}
                  color={selectedSize === size.id ? colors.brand[400] : colors.textMuted}
                />
              </View>
              <Text style={[
                styles.sizeName,
                { color: selectedSize === size.id ? colors.brand[400] : colors.text },
              ]}>
                {size.name}
              </Text>
              <Text style={[styles.sizeDimensions, { color: colors.textMuted }]}>
                {size.dimensions}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Template Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Şablon Seçin</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templatesScroll}
        >
          {posterTemplates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                {
                  borderColor: selectedTemplate.id === template.id
                    ? colors.brand[400]
                    : isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                  borderWidth: selectedTemplate.id === template.id ? 2 : 1,
                },
              ]}
              onPress={() => {
                setSelectedTemplate(template);
                setPosterGenerated(false);
              }}
            >
              <LinearGradient
                colors={template.gradientColors}
                style={styles.templatePreviewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.templatePreviewContent}>
                  <View style={[styles.templatePreviewLine, { backgroundColor: template.accentColor }]} />
                  <View style={[styles.templatePreviewBox, { backgroundColor: `${template.textColor}20` }]} />
                  <View style={[styles.templatePreviewLine2, { backgroundColor: `${template.textColor}40` }]} />
                </View>
              </LinearGradient>
              <View style={styles.templateInfo}>
                <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                <Text style={[styles.templateStyle, { color: colors.textMuted }]}>{template.style}</Text>
              </View>
              {selectedTemplate.id === template.id && (
                <View style={[styles.templateSelected, { backgroundColor: colors.brand[400] }]}>
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Generated Poster Preview */}
      {posterGenerated && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Önizleme</Text>
          <View style={[styles.previewContainer, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          }]}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              {renderPosterDesign()}
            </ViewShot>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.previewAction, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}
                onPress={handleDownload}
              >
                <Ionicons name="download" size={20} color={colors.text} />
                <Text style={[styles.previewActionText, { color: colors.text }]}>İndir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewAction, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={20} color={colors.text} />
                <Text style={[styles.previewActionText, { color: colors.text }]}>Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewAction, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}
                onPress={handleGenerate}
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
                <Text style={[styles.previewActionText, { color: colors.text }]}>Yenile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Generating State */}
      {isGenerating && (
        <View style={styles.section}>
          <View style={[styles.generatingContainer, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
          }]}>
            <ActivityIndicator size="large" color={colors.brand[400]} />
            <Text style={[styles.generatingText, { color: colors.textMuted }]}>
              Afiş tasarımı oluşturuluyor...
            </Text>
          </View>
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerate}
        disabled={isGenerating}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradients.primary}
          style={styles.generateButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="sparkles" size={22} color="white" />
          )}
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Oluşturuluyor...' : posterGenerated ? 'Yeni Afiş Oluştur' : 'Afiş Oluştur'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Info Note */}
      <View style={[styles.infoNote, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }]}>
        <Ionicons name="information-circle" size={18} color={colors.info} />
        <Text style={[styles.infoNoteText, { color: colors.textSecondary }]}>
          Seçtiğiniz şablona göre etkinlik bilgilerinizle profesyonel bir afiş tasarımı oluşturulur.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Size Selection
  sizeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sizePreview: {
    width: 50,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sizeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sizeDimensions: {
    fontSize: 11,
  },

  // Templates
  templatesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  templateCard: {
    width: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  templatePreviewGradient: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatePreviewContent: {
    alignItems: 'center',
    gap: 6,
  },
  templatePreviewLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  templatePreviewBox: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
  templatePreviewLine2: {
    width: 50,
    height: 2,
    borderRadius: 1,
  },
  templateInfo: {
    padding: 10,
  },
  templateName: {
    fontSize: 13,
    fontWeight: '600',
  },
  templateStyle: {
    fontSize: 10,
    marginTop: 2,
  },
  templateSelected: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Poster Canvas
  posterCanvas: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  posterContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  posterTop: {
    alignItems: 'flex-start',
  },
  dateBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  posterMiddle: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  fontElegant: {
    fontWeight: '300',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  fontBold: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  fontRetro: {
    fontWeight: '800',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  artistsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  artistsDivider: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginBottom: 12,
  },
  artistsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
  },
  artistsText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1,
  },
  posterBottom: {
    alignItems: 'center',
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  venueTextContainer: {
    alignItems: 'flex-start',
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
  },
  venueLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  brandingText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Decorative Elements
  neonLine: {
    position: 'absolute',
    width: 150,
    height: 3,
    borderRadius: 2,
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  neonGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.2,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  retroGrid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopWidth: 1,
    borderColor: '#01cdfe',
  },
  retroSun: {
    position: 'absolute',
    bottom: '35%',
    alignSelf: 'center',
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    opacity: 0.8,
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: '100%',
    opacity: 0.15,
    transform: [{ skewX: '-15deg' }],
  },

  // Preview
  previewContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  previewActionText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Generating
  generatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  generatingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },

  // Generate Button
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

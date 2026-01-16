/**
 * MediaModule - Medya Modülü
 *
 * Etkinlik görselleri ve videoları gösterir.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { MediaModuleData, ModuleConfig } from '../../../types/modules';

interface MediaModuleProps {
  data?: MediaModuleData;
  config: ModuleConfig;
  mode?: 'view' | 'edit' | 'form';
  onDataChange?: (data: MediaModuleData) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MediaModule: React.FC<MediaModuleProps> = ({ data, config }) => {
  const { colors, isDark } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  const allImages = data.images || [];
  const allVideos = data.videos || [];
  const hasMedia = allImages.length > 0 || allVideos.length > 0 || data.posterImage;

  if (!hasMedia) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Medya içeriği yok</Text>
      </View>
    );
  }

  const displayImages = allImages.slice(0, 4);
  const remainingCount = allImages.length - 4;

  return (
    <>
      <View style={styles.container}>
        {/* Poster Image */}
        {data.posterImage && (
          <TouchableOpacity
            style={styles.posterWrapper}
            onPress={() => setSelectedImage(data.posterImage!)}
          >
            <Image source={{ uri: data.posterImage }} style={styles.posterImage} resizeMode="cover" />
            <View style={styles.posterBadge}>
              <Ionicons name="image" size={12} color="#FFFFFF" />
              <Text style={styles.posterBadgeText}>Poster</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Image Grid */}
        {allImages.length > 0 && (
          <View style={styles.imageGrid}>
            {displayImages.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageWrapper,
                  index === 0 && allImages.length > 1 && styles.mainImage,
                ]}
                onPress={() => setSelectedImage(imageUrl)}
              >
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                {index === 3 && remainingCount > 0 && (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>+{remainingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Videos */}
        {allVideos.length > 0 && (
          <View style={styles.videoSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Videolar</Text>
            {allVideos.map((videoUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.videoCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC' }]}
              >
                <View style={styles.videoThumbnail}>
                  <View style={[styles.videoPlaceholder, { backgroundColor: isDark ? '#3F3F46' : '#E2E8F0' }]}>
                    <Ionicons name="videocam" size={24} color={colors.textSecondary} />
                  </View>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={1}>
                    Video {index + 1}
                  </Text>
                  <Text style={[styles.videoUrl, { color: colors.textSecondary }]} numberOfLines={1}>
                    {videoUrl}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={[styles.summaryRow, { backgroundColor: isDark ? '#27272A' : '#F1F5F9' }]}>
          {allImages.length > 0 && (
            <View style={styles.summaryItem}>
              <Ionicons name="images" size={16} color="#6366F1" />
              <Text style={[styles.summaryText, { color: colors.text }]}>{allImages.length} Fotoğraf</Text>
            </View>
          )}
          {allVideos.length > 0 && (
            <View style={styles.summaryItem}>
              <Ionicons name="videocam" size={16} color="#EC4899" />
              <Text style={[styles.summaryText, { color: colors.text }]}>{allVideos.length} Video</Text>
            </View>
          )}
        </View>
      </View>

      {/* Image Viewer Modal */}
      <Modal visible={!!selectedImage} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeArea} onPress={() => setSelectedImage(null)} />
          <View style={styles.imageViewer}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  posterWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  posterBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: (SCREEN_WIDTH - 64) / 2 - 4,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  videoSection: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  videoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  videoThumbnail: {
    width: 100,
    height: 70,
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  videoTitle: { fontSize: 14, fontWeight: '600' },
  videoUrl: { fontSize: 11, marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: { fontSize: 13, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageViewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});

export default MediaModule;

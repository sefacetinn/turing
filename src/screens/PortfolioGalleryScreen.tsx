import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
  ViewToken,
  Animated,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { cacheDirectory, downloadAsync } from 'expo-file-system/build/legacy/FileSystem';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const THUMBNAIL_SIZE = 60;
const THUMBNAIL_MARGIN = 4;

interface RouteParams {
  images: string[];
  initialIndex?: number;
  providerName?: string;
}

interface ImageState {
  loading: boolean;
  error: boolean;
}

export function PortfolioGalleryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { images, initialIndex = 0, providerName } = route.params as RouteParams;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const [imageStates, setImageStates] = useState<Record<number, ImageState>>({});
  const [isSaving, setIsSaving] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const thumbnailListRef = useRef<FlatList>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(0)).current;

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls) {
      timer = setTimeout(() => {
        hideControls();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showControls, currentIndex]);

  const hideControls = () => {
    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(footerTranslateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowControls(false));
  };

  const showControlsWithAnimation = () => {
    setShowControls(true);
    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(footerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleControls = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showControls) {
      hideControls();
    } else {
      showControlsWithAnimation();
    }
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== currentIndex) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCurrentIndex(newIndex);

          // Scroll thumbnail to center
          thumbnailListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }
      }
    },
    [currentIndex]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleImageLoad = (index: number) => {
    setImageStates(prev => ({
      ...prev,
      [index]: { loading: false, error: false },
    }));
  };

  const handleImageError = (index: number) => {
    setImageStates(prev => ({
      ...prev,
      [index]: { loading: false, error: true },
    }));
  };

  const handleImageLoadStart = (index: number) => {
    setImageStates(prev => ({
      ...prev,
      [index]: { loading: true, error: false },
    }));
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: providerName
          ? `${providerName} - Portfolyo görseli`
          : 'Portfolyo görseli',
        url: images[currentIndex],
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSaveToGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye kaydetmek için izin vermeniz gerekiyor.');
        return;
      }

      setIsSaving(true);

      const imageUrl = images[currentIndex];
      const filename = `portfolio_${Date.now()}.jpg`;
      const fileUri = (cacheDirectory || '') + filename;

      const downloadResult = await downloadAsync(imageUrl, fileUri);

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Görsel galeriye kaydedildi.');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Görsel kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThumbnailPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const state = imageStates[index] || { loading: true, error: false };

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        style={styles.imageContainer}
      >
        {state.loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}

        {state.error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={styles.errorText}>Görsel yüklenemedi</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => handleImageLoadStart(index)}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="contain"
            onLoadStart={() => handleImageLoadStart(index)}
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageError(index)}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      onPress={() => handleThumbnailPress(index)}
      style={[
        styles.thumbnailContainer,
        currentIndex === index && styles.thumbnailActive,
      ]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      {currentIndex === index && (
        <View style={styles.thumbnailOverlay}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.6)', 'rgba(139, 92, 246, 0.3)']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const getThumbnailLayout = (_: any, index: number) => ({
    length: THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2,
    offset: (THUMBNAIL_SIZE + THUMBNAIL_MARGIN * 2) * index,
    index,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: controlsOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>

            <View style={styles.counterContainer}>
              <Text style={styles.counter}>
                {currentIndex + 1} / {images.length}
              </Text>
              {providerName && (
                <Text style={styles.providerName} numberOfLines={1}>
                  {providerName}
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleSaveToGallery}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Image Gallery */}
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Footer with Thumbnails and Pagination */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: controlsOpacity,
            transform: [{ translateY: footerTranslateY }],
          },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.footerGradient}
          >
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <FlatList
                ref={thumbnailListRef}
                data={images}
                renderItem={renderThumbnail}
                keyExtractor={(_, index) => `thumb_${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
                getItemLayout={getThumbnailLayout}
                initialScrollIndex={initialIndex}
              />
            )}

            {/* Pagination Dots (for small galleries) */}
            {images.length > 1 && images.length <= 10 && (
              <View style={styles.pagination}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleThumbnailPress(index)}
                    style={styles.dotTouchable}
                  >
                    <View
                      style={[
                        styles.dot,
                        currentIndex === index && styles.dotActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Navigation Hint */}
            <View style={styles.hintContainer}>
              <Ionicons name="hand-left-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.hintText}>Kaydırarak gezinin</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counter: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  providerName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    maxWidth: 200,
  },
  imageContainer: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height * 0.75,
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  footerBlur: {
    overflow: 'hidden',
  },
  footerGradient: {
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  thumbnailList: {
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginHorizontal: THUMBNAIL_MARGIN,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#8B5CF6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  dotTouchable: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
    width: 24,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

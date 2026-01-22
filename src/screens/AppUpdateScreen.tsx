import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';

interface AppUpdateScreenProps {
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string[];
  isForceUpdate?: boolean;
  onSkip?: () => void;
  storeUrl?: {
    ios?: string;
    android?: string;
  };
}

export function AppUpdateScreen({
  currentVersion,
  latestVersion,
  releaseNotes = [],
  isForceUpdate = false,
  onSkip,
  storeUrl = {
    ios: 'https://apps.apple.com/app/turing/id123456789',
    android: 'https://play.google.com/store/apps/details?id=com.turing.mobile',
  },
}: AppUpdateScreenProps) {
  const { colors, isDark } = useTheme();

  const handleUpdate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const url = Platform.OS === 'ios' ? storeUrl.ios : storeUrl.android;
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleSkip = () => {
    if (isForceUpdate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip?.();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100] },
          ]}
        >
          <Ionicons
            name={isForceUpdate ? 'cloud-download' : 'sparkles'}
            size={64}
            color={colors.brand[500]}
          />
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>YENi</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {isForceUpdate ? 'Guncelleme Gerekli' : 'Yeni Surum Mevcut'}
        </Text>

        {/* Version Info */}
        <View style={styles.versionRow}>
          <View style={[styles.versionBox, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.versionLabel, { color: colors.textMuted }]}>
              Mevcut
            </Text>
            <Text style={[styles.versionNumber, { color: colors.textSecondary }]}>
              v{currentVersion}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
          <View
            style={[
              styles.versionBox,
              {
                backgroundColor: isDark
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'rgba(124, 58, 237, 0.1)',
              },
            ]}
          >
            <Text style={[styles.versionLabel, { color: colors.brand[400] }]}>
              Yeni
            </Text>
            <Text style={[styles.versionNumber, { color: colors.brand[500] }]}>
              v{latestVersion}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isForceUpdate
            ? 'Bu guncelleme uygulamanin calisabilmesi icin zorunludur. Lutfen en son surume guncelleyin.'
            : 'Yeni ozellikler ve iyilestirmeler icin uygulamayi guncelleyin.'}
        </Text>

        {/* Release Notes */}
        {releaseNotes.length > 0 && (
          <View
            style={[
              styles.releaseNotes,
              {
                backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.releaseNotesHeader}>
              <Ionicons name="document-text" size={18} color={colors.textSecondary} />
              <Text style={[styles.releaseNotesTitle, { color: colors.text }]}>
                Yenilikler
              </Text>
            </View>
            {releaseNotes.map((note, index) => (
              <View key={index} style={styles.releaseNoteItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.brand[500] }]} />
                <Text style={[styles.releaseNoteText, { color: colors.textSecondary }]}>
                  {note}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Force Update Warning */}
        {isForceUpdate && (
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: isDark
                  ? 'rgba(251, 191, 36, 0.1)'
                  : 'rgba(251, 191, 36, 0.08)',
              },
            ]}
          >
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              Bu guncelleme zorunludur. Guncelleme yapilmadan uygulama kullanilamaz.
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Update Button */}
        <TouchableOpacity onPress={handleUpdate} activeOpacity={0.8}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.updateButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.updateButtonText}>
              {Platform.OS === 'ios' ? "App Store'dan Guncelle" : "Play Store'dan Guncelle"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip Button (only for optional updates) */}
        {!isForceUpdate && onSkip && (
          <TouchableOpacity
            style={[
              styles.skipButton,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
              Daha Sonra Hatırlat
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  versionBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  releaseNotes: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  releaseNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  releaseNotesTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  releaseNoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  releaseNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AppUpdateScreen;

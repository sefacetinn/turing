import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { gradients } from '../../theme/colors';

interface QuickCreateCardProps {
  onPress: () => void;
}

export function QuickCreateCard({ onPress }: QuickCreateCardProps) {
  const { colors, isDark, helpers } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.3)',
          ...(isDark ? {} : helpers.getShadow('md')),
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(75, 48, 184, 0.1)', 'rgba(75, 48, 184, 0.1)']
            : ['rgba(75, 48, 184, 0.08)', 'rgba(75, 48, 184, 0.05)']
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.left}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={12} color={colors.brand[400]} />
              <Text style={[styles.badgeText, { color: colors.brand[400] }]}>Hızlı Başla</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Etkinlik Oluştur</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tüm hizmetleri tek yerden yönet
            </Text>
          </View>
          <LinearGradient colors={gradients.primary} style={styles.iconButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(75, 48, 184, 0.15)',
    borderRadius: 20,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

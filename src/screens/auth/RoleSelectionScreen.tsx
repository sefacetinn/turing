import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { UserRole } from '../../types/auth';
import { AuthNavigationProp } from '../../types/navigation';

export function RoleSelectionScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { colors, isDark } = useTheme();

  const handleSelectRole = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (role === 'organizer') {
      navigation.navigate('OrganizerRegistration');
    } else {
      navigation.navigate('ProviderRegistration');
    }
  };

  const roles = [
    {
      id: 'organizer' as UserRole,
      title: 'Organizatör',
      description: 'Etkinlik düzenleyin, sağlayıcılardan teklif alın',
      icon: 'people',
      gradient: ['#4b30b8', '#a855f7'] as const,
      features: [
        'Etkinlik oluşturma',
        'Teklif karşılaştırma',
        'Sözleşme yönetimi',
      ],
    },
    {
      id: 'provider' as UserRole,
      title: 'Sağlayıcı',
      description: 'Hizmetlerinizi sunun, müşteri bulun',
      icon: 'construct',
      gradient: ['#059669', '#34d399'] as const,
      features: [
        'Teklif gönderme',
        'Hizmet yönetimi',
        'Müşteri ilişkileri',
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../../assets/turing-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Nasıl Kullanmak İstiyorsunuz?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Hesap türünüzü seçin. Daha sonra değiştirebilirsiniz.
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleSelectRole(role.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={role.gradient}
              style={styles.roleIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={role.icon as any} size={32} color="white" />
            </LinearGradient>

            <View style={styles.roleInfo}>
              <Text style={[styles.roleTitle, { color: colors.text }]}>
                {role.title}
              </Text>
              <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                {role.description}
              </Text>

              <View style={styles.featuresList}>
                {role.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={role.gradient[0]}
                    />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textMuted}
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Zaten hesabınız var mı?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.loginLink, { color: colors.brand[500] }]}>
            Giriş Yap
          </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

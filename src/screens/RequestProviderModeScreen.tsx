import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

export function RequestProviderModeScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [reason, setReason] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = [
    {
      icon: 'briefcase',
      title: 'Hizmet Sunun',
      description: 'Ses, ışık, sanatçı ve daha fazla hizmet sunun',
    },
    {
      icon: 'cash',
      title: 'Gelir Kazanın',
      description: 'Etkinliklere hizmet sağlayarak gelir elde edin',
    },
    {
      icon: 'swap-horizontal',
      title: 'Çift Yönlü Kullanım',
      description: 'Aynı hesapla hem hizmet verin hem etkinlik düzenleyin',
    },
    {
      icon: 'star',
      title: 'Değerlendirme Alın',
      description: 'Hizmet kalitesini değerlendirmelerle sergileyin',
    },
  ];

  const serviceTypes = [
    { id: 'sound-light', label: 'Ses & Işık', icon: 'volume-high' },
    { id: 'artist', label: 'Sanatçı / Booking', icon: 'musical-notes' },
    { id: 'transport', label: 'Ulaşım', icon: 'car' },
    { id: 'accommodation', label: 'Konaklama', icon: 'bed' },
    { id: 'catering', label: 'Catering', icon: 'restaurant' },
    { id: 'security', label: 'Güvenlik', icon: 'shield-checkmark' },
    { id: 'other', label: 'Diğer', icon: 'ellipsis-horizontal' },
  ];

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('Hata', 'Lütfen hizmet sağlayıcı modunu neden kullanmak istediğinizi açıklayın.');
      return;
    }
    if (!serviceType) {
      Alert.alert('Hata', 'Lütfen sunmak istediğiniz hizmet türünü seçin.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Talebiniz Alındı',
        'Hizmet sağlayıcı modu talebiniz incelemeye alındı. En kısa sürede size dönüş yapılacaktır.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Hizmet Sağlayıcı Modu</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroIconContainer}>
            <Ionicons name="briefcase" size={32} color="white" />
          </View>
          <Text style={styles.heroTitle}>Hizmet Sağlayıcı Olun</Text>
          <Text style={styles.heroSubtitle}>
            Organizatör olarak mevcut hesabınızı kullanarak aynı zamanda etkinliklere hizmet sunabilirsiniz.
          </Text>
        </LinearGradient>

        {/* Benefits */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ne Kazanırsınız?</Text>
        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
                },
              ]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name={benefit.icon as any} size={20} color="#10b981" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>{benefit.title}</Text>
                <Text style={[styles.benefitDescription, { color: colors.textMuted }]}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Service Type Selection */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hangi Hizmeti Sunmak İstiyorsunuz?</Text>
        <View style={styles.serviceTypeGrid}>
          {serviceTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.serviceTypeCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
                  borderColor: serviceType === type.id ? '#10b981' : (isDark ? 'rgba(255,255,255,0.08)' : colors.border),
                },
                serviceType === type.id && { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' },
              ]}
              onPress={() => setServiceType(type.id)}
            >
              <View style={[
                styles.serviceTypeIcon,
                { backgroundColor: serviceType === type.id ? 'rgba(16, 185, 129, 0.15)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }
              ]}>
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={serviceType === type.id ? '#10b981' : colors.textMuted}
                />
              </View>
              <Text style={[
                styles.serviceTypeLabel,
                { color: serviceType === type.id ? colors.text : colors.textMuted }
              ]}>
                {type.label}
              </Text>
              {serviceType === type.id && (
                <View style={styles.serviceTypeCheck}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Hizmet sağlayıcı modu aktifleştiğinde, profil sayfanızdan modlar arasında kolayca geçiş yapabilirsiniz.
          </Text>
        </View>

        {/* Reason Input */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Neden Hizmet Sağlayıcı Olmak İstiyorsunuz?</Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Örn: Ses ve ışık sistemleri alanında 5 yıllık deneyimim var..."
            placeholderTextColor={colors.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>{reason.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isSubmitting ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <Text style={styles.submitText}>Gönderiliyor...</Text>
            ) : (
              <>
                <Text style={styles.submitText}>Talep Gönder</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  serviceTypeCard: {
    width: '31%',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
  },
  serviceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceTypeLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  serviceTypeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  textInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

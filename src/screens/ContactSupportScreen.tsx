import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';

interface ContactOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action: () => void;
  color: string;
}

const supportCategories = [
  { id: 'general', label: 'Genel Soru', icon: 'help-circle' },
  { id: 'payment', label: 'Odeme Sorunu', icon: 'card' },
  { id: 'account', label: 'Hesap Problemi', icon: 'person' },
  { id: 'technical', label: 'Teknik Sorun', icon: 'bug' },
  { id: 'offer', label: 'Teklif/Sozlesme', icon: 'document-text' },
  { id: 'complaint', label: 'Sikayet', icon: 'warning' },
];

export function ContactSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleCall = () => {
    Linking.openURL('tel:+902121234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:destek@turing.app');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/905551234567');
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert('Uyari', 'Lutfen bir kategori secin');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Uyari', 'Lutfen mesajinizi yazin');
      return;
    }

    Alert.alert(
      'Basarili',
      'Mesajiniz alindi. En kisa surede size donecegiz.',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const contactOptions: ContactOption[] = [
    {
      id: 'phone',
      icon: 'call',
      title: 'Telefon',
      subtitle: '+90 212 123 45 67',
      action: handleCall,
      color: colors.success,
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'E-posta',
      subtitle: 'destek@turing.app',
      action: handleEmail,
      color: colors.info,
    },
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: '+90 555 123 45 67',
      action: handleWhatsApp,
      color: '#25D366',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bize Ulasin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="headset" size={48} color="white" />
          <Text style={styles.heroTitle}>Nasil Yardimci Olabiliriz?</Text>
          <Text style={styles.heroSubtitle}>
            7/24 destek ekibimiz sorularinizi yanitmaya hazir
          </Text>
        </LinearGradient>

        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hizli Iletisim</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.contactCard, {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  ...(isDark ? {} : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 })
                }]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconBox, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={[styles.contactTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Destek Talebi Olustur</Text>

          {/* Category Selection */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Kategori Secin</Text>
          <View style={styles.categoryGrid}>
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category.id
                      ? colors.brand[500]
                      : (isDark ? colors.zinc[800] : colors.zinc[100]),
                    borderColor: selectedCategory === category.id
                      ? colors.brand[500]
                      : colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? 'white' : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? 'white' : colors.text }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email Input */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>E-posta Adresiniz</Text>
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder
          }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Message Input */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Mesajiniz</Text>
          <View style={[styles.textAreaContainer, {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder
          }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Sorununuzu veya sorunuzu detayli olarak aciklayin..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Gonder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={[styles.workingHoursCard, {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border
        }]}>
          <Ionicons name="time-outline" size={24} color={colors.brand[400]} />
          <View style={styles.workingHoursInfo}>
            <Text style={[styles.workingHoursTitle, { color: colors.text }]}>Calisma Saatleri</Text>
            <Text style={[styles.workingHoursText, { color: colors.textSecondary }]}>
              Pazartesi - Cuma: 09:00 - 18:00{'\n'}
              Cumartesi: 10:00 - 14:00{'\n'}
              Pazar: Kapali
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  heroSection: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  workingHoursCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  workingHoursInfo: {
    flex: 1,
  },
  workingHoursTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  workingHoursText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

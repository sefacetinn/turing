import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme/ThemeContext';
import { gradients } from '../theme/colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ContactOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action: () => void;
  color: string;
}

interface AttachmentFile {
  name: string;
  size: number;
  uri: string;
  type: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const supportCategories = [
  { id: 'general', label: 'Genel Soru', icon: 'help-circle', responseTime: '24 saat' },
  { id: 'payment', label: 'Ödeme Sorunu', icon: 'card', responseTime: '4 saat' },
  { id: 'account', label: 'Hesap Problemi', icon: 'person', responseTime: '12 saat' },
  { id: 'technical', label: 'Teknik Sorun', icon: 'bug', responseTime: '8 saat' },
  { id: 'offer', label: 'Teklif/Sözleşme', icon: 'document-text', responseTime: '24 saat' },
  { id: 'complaint', label: 'Şikayet', icon: 'warning', responseTime: '48 saat' },
];

const faqData: FAQItem[] = [
  {
    id: 'faq1',
    question: 'Nasıl teklif gönderebilirim?',
    answer: 'Etkinlik detay sayfasından "Teklif Ver" butonuna tıklayarak teklif formunu doldurabilir ve organizatöre teklif gönderebilirsiniz.',
  },
  {
    id: 'faq2',
    question: 'Ödeme ne zaman yapılır?',
    answer: 'Ödemeler, etkinlik tamamlandıktan sonra 3-5 iş günü içinde tanımlı banka hesabınıza aktarılır.',
  },
  {
    id: 'faq3',
    question: 'Teklifimi nasıl iptal edebilirim?',
    answer: 'Onaylanmamış teklifleri "Tekliflerim" sayfasından iptal edebilirsiniz. Onaylanmış teklifler için destek ekibiyle iletişime geçmeniz gerekir.',
  },
  {
    id: 'faq4',
    question: 'Hesabımı nasıl doğrularım?',
    answer: 'Profil ayarlarından kimlik belgelerinizi yükleyerek hesap doğrulama sürecini başlatabilirsiniz. Doğrulama 24-48 saat içinde tamamlanır.',
  },
];

export function ContactSupportScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSupportOnline, setIsSupportOnline] = useState(true);

  // Animation refs
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const MAX_MESSAGE_LENGTH = 1000;
  const MAX_ATTACHMENTS = 3;

  // Online status pulse animation
  useEffect(() => {
    if (isSupportOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSupportOnline]);

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('tel:+902121234567');
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:destek@turing.app');
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://wa.me/905551234567');
  };

  const handleLiveChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Canlı Destek', 'Canlı destek yakında aktif olacak!');
  };

  const toggleFAQ = (faqId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleCategorySelect = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  };

  const handleAddAttachment = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', `En fazla ${MAX_ATTACHMENTS} dosya ekleyebilirsiniz.`);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size || 0,
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
        }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Dosya seçilemedi');
    }
  };

  const removeAttachment = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const playSuccessAnimation = () => {
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin');
      return;
    }
    if (!message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen mesajınızı yazın');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Uyarı', 'Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      playSuccessAnimation();
    }, 1500);
  };

  const getSelectedCategoryInfo = () => {
    return supportCategories.find(c => c.id === selectedCategory);
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

  // Success Overlay
  if (showSuccess) {
    return (
      <View style={[styles.successOverlay, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.successContent,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim }],
            }
          ]}
        >
          <Animated.View
            style={[
              styles.successCircle,
              {
                backgroundColor: '#10B981',
                transform: [{ scale: checkmarkAnim }],
              }
            ]}
          >
            <Ionicons name="checkmark" size={48} color="white" />
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Mesajınız Gönderildi!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
            Talebiniz #{Math.floor(Math.random() * 90000) + 10000} numarası ile kaydedildi.
            {'\n'}En kısa sürede size dönüş yapacağız.
          </Text>
          <View style={[styles.successInfoBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
            <Ionicons name="time-outline" size={18} color="#10B981" />
            <Text style={styles.successInfoText}>
              Tahmini yanıt süresi: {getSelectedCategoryInfo()?.responseTime || '24 saat'}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bize Ulaşın</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Online Status */}
        <LinearGradient
          colors={gradients.primary}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.onlineStatusBadge}>
            <Animated.View
              style={[
                styles.onlinePulse,
                {
                  backgroundColor: isSupportOnline ? '#10B981' : '#EF4444',
                  transform: [{ scale: pulseAnim }],
                }
              ]}
            />
            <View style={[styles.onlineDot, { backgroundColor: isSupportOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.onlineText}>
              {isSupportOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </Text>
          </View>
          <Ionicons name="headset" size={48} color="white" />
          <Text style={styles.heroTitle}>Nasıl Yardımcı Olabiliriz?</Text>
          <Text style={styles.heroSubtitle}>
            7/24 destek ekibimiz sorularınızı yanıtlamaya hazır
          </Text>

          {/* Live Chat Button */}
          <TouchableOpacity
            style={styles.liveChatButton}
            onPress={handleLiveChat}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={18} color={colors.brand[500]} />
            <Text style={[styles.liveChatText, { color: colors.brand[500] }]}>Canlı Destek Başlat</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hızlı İletişim</Text>
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

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sık Sorulan Sorular</Text>
          <View style={[styles.faqContainer, {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }]}>
            {faqData.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <View style={[styles.faqIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#F3E8FF' }]}>
                      <Ionicons name="help" size={16} color={colors.brand[500]} />
                    </View>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]} numberOfLines={2}>
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                  {expandedFAQ === faq.id && (
                    <View style={[styles.faqAnswer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB' }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {index < faqData.length - 1 && (
                  <View style={[styles.faqDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Destek Talebi Oluştur</Text>

          {/* Category Selection */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Kategori Seçin</Text>
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
                onPress={() => handleCategorySelect(category.id)}
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

          {/* Response Time Indicator */}
          {selectedCategory && (
            <View style={[styles.responseTimeBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
              <Text style={styles.responseTimeText}>
                Tahmini yanıt süresi: {getSelectedCategoryInfo()?.responseTime}
              </Text>
            </View>
          )}

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
          <View style={styles.messageLabelRow}>
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>Mesajınız</Text>
            <Text style={[
              styles.charCounter,
              { color: message.length > MAX_MESSAGE_LENGTH ? '#EF4444' : colors.textMuted }
            ]}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          </View>
          <View style={[styles.textAreaContainer, {
            backgroundColor: colors.inputBackground,
            borderColor: message.length > MAX_MESSAGE_LENGTH ? '#EF4444' : colors.inputBorder
          }]}>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Sorununuzu veya sorunuzu detaylı olarak açıklayın..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={(text) => setMessage(text.slice(0, MAX_MESSAGE_LENGTH + 50))}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Attachments */}
          <View style={styles.attachmentsSection}>
            <View style={styles.attachmentHeader}>
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 0, marginBottom: 0 }]}>
                Ekler (Opsiyonel)
              </Text>
              <Text style={[styles.attachmentHint, { color: colors.textMuted }]}>
                {attachments.length}/{MAX_ATTACHMENTS}
              </Text>
            </View>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((file, index) => (
                  <View
                    key={index}
                    style={[styles.attachmentItem, {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
                    }]}
                  >
                    <View style={[styles.attachmentIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#F3E8FF' }]}>
                      <Ionicons
                        name={file.type.includes('image') ? 'image' : 'document'}
                        size={16}
                        color={colors.brand[500]}
                      />
                    </View>
                    <View style={styles.attachmentInfo}>
                      <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={[styles.attachmentSize, { color: colors.textMuted }]}>
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeAttachment(index)}
                      style={styles.removeAttachment}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Attachment Button */}
            <TouchableOpacity
              style={[styles.addAttachmentButton, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                opacity: attachments.length >= MAX_ATTACHMENTS ? 0.5 : 1,
              }]}
              onPress={handleAddAttachment}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={20} color={colors.brand[500]} />
              <Text style={[styles.addAttachmentText, { color: colors.brand[500] }]}>
                Dosya Ekle
              </Text>
              <Text style={[styles.addAttachmentHint, { color: colors.textMuted }]}>
                (Resim veya PDF)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={isSubmitting ? ['#9CA3AF', '#6B7280'] : gradients.primary}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <>
                  <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
                    <Ionicons name="sync" size={20} color="white" />
                  </Animated.View>
                  <Text style={styles.submitButtonText}>Gönderiliyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Gönder</Text>
                </>
              )}
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
            <Text style={[styles.workingHoursTitle, { color: colors.text }]}>Çalışma Saatleri</Text>
            <Text style={[styles.workingHoursText, { color: colors.textSecondary }]}>
              Pazartesi - Cuma: 09:00 - 18:00{'\n'}
              Cumartesi: 10:00 - 14:00{'\n'}
              Pazar: Kapalı
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
  onlineStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlinePulse: {
    position: 'absolute',
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  liveChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  liveChatText: {
    fontSize: 14,
    fontWeight: '600',
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
  // FAQ Styles
  faqContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  faqAnswer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 0,
    marginLeft: 44,
    marginRight: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 20,
    padding: 10,
  },
  faqDivider: {
    height: 1,
    marginHorizontal: 14,
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
  responseTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  responseTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
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
  messageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '500',
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
  // Attachment Styles
  attachmentsSection: {
    marginTop: 16,
  },
  attachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  attachmentHint: {
    fontSize: 12,
  },
  attachmentsList: {
    gap: 8,
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  attachmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 11,
    marginTop: 2,
  },
  removeAttachment: {
    padding: 4,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addAttachmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addAttachmentHint: {
    fontSize: 12,
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
  // Success Overlay Styles
  successOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  successInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  successInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
});

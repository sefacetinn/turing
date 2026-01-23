import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useRBAC } from '../context/RBACContext';
import { RoleSelector } from '../components/team';
import { PermissionList, PermissionState, PermissionKey, getDefaultPermissionsFromRole } from '../components/team/PermissionList';
import { getRoleById } from '../config/roles';
import type { ProfileStackNavigationProp } from '../types';

const MAX_MESSAGE_LENGTH = 500;

export default function InviteMemberScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileStackNavigationProp>();
  const { availableRoles, inviteMember } = useRBAC();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Custom permissions state - allows editing permissions after role selection
  const [customPermissions, setCustomPermissions] = useState<PermissionState | null>(null);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);

  // Email validation
  const [emailTouched, setEmailTouched] = useState(false);

  // Animation refs
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const selectedRole = selectedRoleId ? getRoleById(selectedRoleId) : null;

  // Pulse animation for hero icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = email.trim() && validateEmail(email.trim());

  const shakeError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const playSuccessAnimation = () => {
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const handleInvite = useCallback(async () => {
    if (!email.trim()) {
      shakeError();
      Alert.alert('Hata', 'Lütfen e-posta adresi girin.');
      return;
    }

    if (!validateEmail(email.trim())) {
      shakeError();
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }

    if (!selectedRoleId) {
      shakeError();
      Alert.alert('Hata', 'Lütfen bir rol seçin.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await inviteMember(email.trim(), selectedRoleId, name.trim() || undefined, message.trim() || undefined);
      playSuccessAnimation();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Davet gönderilemedi. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  }, [email, name, selectedRoleId, message, inviteMember, navigation]);

  const handleRoleSelect = (roleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoleId(roleId);

    // Set default permissions from the selected role
    const role = getRoleById(roleId);
    if (role) {
      setCustomPermissions(getDefaultPermissionsFromRole(role));
    }
  };

  // Handle individual permission toggle
  const handlePermissionChange = (key: PermissionKey, value: boolean) => {
    if (!customPermissions) return;
    setCustomPermissions(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handlePermissionToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPermissions(!showPermissions);
  };

  const isFormValid = email.trim() && validateEmail(email.trim()) && selectedRoleId;

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
              { transform: [{ scale: checkmarkScale }] }
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successGradient}
            >
              <Ionicons name="checkmark" size={48} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Davet Gönderildi!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
            {email} adresine davet e-postası gönderildi.
          </Text>
          <View style={[styles.successInfoBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
            <Ionicons name="mail-outline" size={18} color="#10B981" />
            <Text style={styles.successInfoText}>
              Davetli kişi e-postayı aldığında katılabilir
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Yeni Üye Davet Et
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9']}
              style={styles.heroIcon}
            >
              <Ionicons name="person-add" size={32} color="white" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Ekibinize Yeni Bir Üye Ekleyin
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Davetli kişi e-posta adresine gelen linke tıklayarak ekibinize katılabilir.
          </Text>
        </View>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                E-posta Adresi
              </Text>
              <Text style={[styles.required, { color: '#EF4444' }]}>*</Text>
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                  borderColor: emailFocused
                    ? colors.brand[500]
                    : (emailTouched && !isEmailValid && email.length > 0)
                      ? '#EF4444'
                      : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'),
                  borderWidth: emailFocused ? 2 : 1,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocused ? colors.brand[500] : colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  setEmailTouched(true);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email.length > 0 && (
                <View style={[
                  styles.validationIcon,
                  { backgroundColor: isEmailValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                ]}>
                  <Ionicons
                    name={isEmailValid ? 'checkmark' : 'close'}
                    size={14}
                    color={isEmailValid ? '#10B981' : '#EF4444'}
                  />
                </View>
              )}
            </View>
            {emailTouched && !isEmailValid && email.length > 0 && (
              <Text style={styles.errorText}>Geçerli bir e-posta adresi girin</Text>
            )}
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>
                İsim
              </Text>
              <Text style={[styles.optional, { color: colors.textMuted }]}>(Opsiyonel)</Text>
            </View>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                  borderColor: nameFocused ? colors.brand[500] : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'),
                  borderWidth: nameFocused ? 2 : 1,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={nameFocused ? colors.brand[500] : colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ad Soyad"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>
        </Animated.View>

        {/* Role Selection */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Rol Seçin</Text>
            <Text style={[styles.required, { color: '#EF4444' }]}>*</Text>
          </View>
          <RoleSelector
            roles={availableRoles}
            selectedRoleId={selectedRoleId}
            onSelectRole={handleRoleSelect}
            showDescriptions={true}
          />
        </View>

        {/* Permission Preview */}
        {selectedRole && (
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.permissionToggle, {
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
              }]}
              onPress={handlePermissionToggle}
              activeOpacity={0.7}
            >
              <View style={[styles.permissionIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.brand[500]}
                />
              </View>
              <Text style={[styles.permissionToggleText, { color: colors.brand[500] }]}>
                {showPermissions ? 'Yetkileri Gizle' : 'Yetkileri Düzenle'}
              </Text>
              <Ionicons
                name={showPermissions ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.brand[500]}
              />
            </TouchableOpacity>

            {showPermissions && (
              <View style={styles.permissionContainer}>
                <PermissionList
                  role={selectedRole}
                  editable={true}
                  customPermissions={customPermissions || undefined}
                  onPermissionToggle={handlePermissionChange}
                />
              </View>
            )}
          </View>
        )}

        {/* Message Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>
              Kişisel Mesaj
            </Text>
            <Text style={[styles.optional, { color: colors.textMuted }]}>(Opsiyonel)</Text>
          </View>
          <View style={styles.charCounterRow}>
            <Text style={[
              styles.charCounter,
              { color: message.length > MAX_MESSAGE_LENGTH ? '#EF4444' : colors.textMuted }
            ]}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          </View>
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: messageFocused
                  ? colors.brand[500]
                  : message.length > MAX_MESSAGE_LENGTH
                    ? '#EF4444'
                    : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'),
                borderWidth: messageFocused ? 2 : 1,
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Davet mesajınızı yazın..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={(text) => setMessage(text.slice(0, MAX_MESSAGE_LENGTH + 50))}
              onFocus={() => setMessageFocused(true)}
              onBlur={() => setMessageFocused(false)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Davetli kişi 7 gün içinde daveti kabul etmezse, davet otomatik olarak iptal edilir.
          </Text>
        </View>

        {/* Bottom Spacer - extra space for fixed button and tab bar */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: insets.bottom + 90, // Extra space for tab bar
            backgroundColor: colors.background,
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            { opacity: isFormValid && !isLoading ? 1 : 0.5 },
          ]}
          onPress={handleInvite}
          disabled={!isFormValid || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormValid ? ['#8B5CF6', '#6D28D9'] : ['#9CA3AF', '#6B7280']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#ffffff" />
                <Text style={styles.submitButtonText}>Davet Gönder</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    fontSize: 14,
    fontWeight: '600',
  },
  optional: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  validationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
  charCounterRow: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  charCounter: {
    fontSize: 12,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  textArea: {
    fontSize: 15,
    minHeight: 80,
    lineHeight: 22,
  },
  permissionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  permissionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionToggleText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  permissionContainer: {
    marginTop: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Success overlay styles
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
    marginBottom: 24,
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  successInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  successInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
});

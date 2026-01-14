import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme as defaultColors, gradients } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const colors = defaultColors;

export function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark, helpers } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = [
    { id: 'length', label: 'En az 8 karakter', met: newPassword.length >= 8 },
    { id: 'uppercase', label: 'En az 1 büyük harf', met: /[A-Z]/.test(newPassword) },
    { id: 'lowercase', label: 'En az 1 küçük harf', met: /[a-z]/.test(newPassword) },
    { id: 'number', label: 'En az 1 rakam', met: /[0-9]/.test(newPassword) },
    { id: 'special', label: 'En az 1 özel karakter', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];

  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert('Hata', 'Mevcut şifrenizi girin');
      return;
    }
    if (!allRequirementsMet) {
      Alert.alert('Hata', 'Yeni şifre tüm gereksinimleri karşılamalıdır');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    // API call to change password
    Alert.alert(
      'Başarılı',
      'Şifreniz başarıyla değiştirildi',
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Şifre Değiştir</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.iconBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="key" size={32} color="white" />
            </LinearGradient>
          </View>

          <Text style={[styles.description, { color: colors.textMuted }]}>
            Güvenliğiniz için güçlü bir şifre seçin. Şifreniz en az 8 karakter uzunluğunda olmalı ve farklı karakter türleri içermelidir.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Mevcut Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Mevcut şifrenizi girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre</Text>
              <View style={[styles.inputContainer, {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Yeni şifrenizi girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={[styles.requirementsCard, {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.cardBackground,
              ...(isDark ? {} : helpers.getShadow('sm'))
            }]}>
              <Text style={[styles.requirementsTitle, { color: colors.textMuted }]}>Şifre Gereksinimleri</Text>
              {requirements.map((req) => (
                <View key={req.id} style={styles.requirementRow}>
                  <Ionicons
                    name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={req.met ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.requirementText, { color: colors.textMuted }, req.met && { color: colors.success }]}>
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Yeni Şifre (Tekrar)</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.inputBorder
                },
                confirmPassword.length > 0 && (passwordsMatch ? styles.inputSuccess : styles.inputError)
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Yeni şifrenizi tekrar girin"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={[styles.errorText, { color: colors.error }]}>Şifreler eşleşmiyor</Text>
              )}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleChangePassword}
            activeOpacity={0.8}
            disabled={!allRequirementsMet || !passwordsMatch || !currentPassword}
          >
            <LinearGradient
              colors={allRequirementsMet && passwordsMatch && currentPassword ? gradients.primary : ['#374151', '#374151']}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.submitButtonText}>Şifreyi Değiştir</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
    marginBottom: 32,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputSuccess: {
    borderColor: colors.success,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 14,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  requirementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
  },
  requirementMet: {
    color: colors.success,
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

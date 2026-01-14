import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useRBAC } from '../context/RBACContext';
import { RoleSelector, PermissionList } from '../components/team';
import { getRoleById } from '../config/roles';
import type { ProfileStackNavigationProp } from '../types';

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

  const selectedRole = selectedRoleId ? getRoleById(selectedRoleId) : null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresi girin.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }

    if (!selectedRoleId) {
      Alert.alert('Hata', 'Lütfen bir rol seçin.');
      return;
    }

    setIsLoading(true);
    try {
      await inviteMember(email.trim(), selectedRoleId, name.trim() || undefined, message.trim() || undefined);
      Alert.alert(
        'Başarılı',
        `${email} adresine davet gönderildi.`,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Davet gönderilemedi. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  }, [email, name, selectedRoleId, message, inviteMember, navigation]);

  const isFormValid = email.trim() && validateEmail(email.trim()) && selectedRoleId;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            E-posta Adresi *
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              },
            ]}
          >
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            İsim (Opsiyonel)
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              },
            ]}
          >
            <Ionicons name="person-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ad Soyad"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Role Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Rol Seçin *</Text>
          <RoleSelector
            roles={availableRoles}
            selectedRoleId={selectedRoleId}
            onSelectRole={setSelectedRoleId}
            showDescriptions={true}
          />
        </View>

        {/* Permission Preview */}
        {selectedRole && (
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.permissionToggle}
              onPress={() => setShowPermissions(!showPermissions)}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#6366f1"
              />
              <Text style={styles.permissionToggleText}>
                {showPermissions ? 'Yetkileri Gizle' : 'Yetkileri Görüntüle'}
              </Text>
              <Ionicons
                name={showPermissions ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#6366f1"
              />
            </TouchableOpacity>

            {showPermissions && (
              <View style={styles.permissionContainer}>
                <PermissionList role={selectedRole} />
              </View>
            )}
          </View>
        )}

        {/* Message Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Kişisel Mesaj (Opsiyonel)
          </Text>
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              placeholder="Davet mesajınızı yazın..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.background,
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isFormValid ? '#6366f1' : colors.textMuted,
              opacity: isFormValid ? 1 : 0.5,
            },
          ]}
          onPress={handleInvite}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#ffffff" />
              <Text style={styles.submitButtonText}>Davet Gönder</Text>
            </>
          )}
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  textAreaContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 15,
    minHeight: 80,
  },
  permissionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  permissionToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    flex: 1,
  },
  permissionContainer: {
    marginTop: 12,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

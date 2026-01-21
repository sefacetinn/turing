import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  icon?: string;
  iconColor?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ActionModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  confirmColor,
  requireReason = false,
  reasonPlaceholder = 'Açıklama yazın...',
  icon,
  iconColor,
  isDestructive = false,
  isLoading = false,
}: ActionModalProps) {
  const { colors, isDark } = useTheme();
  const [reason, setReason] = useState('');

  const effectiveConfirmColor = confirmColor || (isDestructive ? '#ef4444' : colors.brand[500]);
  const effectiveIconColor = iconColor || effectiveConfirmColor;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1a1a1a' : colors.cardBackground },
          ]}
        >
          {/* Icon */}
          {icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${effectiveIconColor}20` },
              ]}
            >
              <Ionicons name={icon as any} size={32} color={effectiveIconColor} />
            </View>
          )}

          {/* Title & Message */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          {/* Reason Input */}
          {requireReason && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.background,
                    color: colors.text,
                    borderColor: reason.trim() ? colors.brand[400] : colors.border,
                  },
                ]}
                placeholder={reasonPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {requireReason && !reason.trim() && (
                <Text style={styles.requiredText}>Bu alan zorunludur</Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: colors.border },
              ]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: effectiveConfirmColor },
                (requireReason && !reason.trim()) && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={isLoading || (requireReason && !reason.trim())}
            >
              {isLoading ? (
                <Text style={styles.confirmButtonText}>...</Text>
              ) : (
                <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  requiredText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {},
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ActionModal;

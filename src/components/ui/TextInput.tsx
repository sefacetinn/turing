import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      showPasswordToggle = false,
      required = false,
      disabled = false,
      containerStyle,
      inputStyle,
      secureTextEntry,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const getBorderColor = () => {
      if (error) return colors.error;
      if (isFocused) return colors.brand[500];
      return isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border;
    };

    const getBackgroundColor = () => {
      if (disabled) {
        return isDark ? colors.zinc[900] : colors.zinc[100];
      }
      return isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
    };

    const shouldShowPasswordToggle = showPasswordToggle && secureTextEntry !== undefined;
    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {label}
              {required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
            isFocused && styles.inputContainerFocused,
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={18}
              color={colors.textMuted}
              style={styles.leftIcon}
            />
          )}

          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              { color: disabled ? colors.textMuted : colors.text },
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || shouldShowPasswordToggle) && styles.inputWithRightIcon,
              inputStyle,
            ]}
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint}
            {...props}
          />

          {shouldShowPasswordToggle && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.rightButton}
              accessibilityLabel={isPasswordVisible ? 'Sifreyi gizle' : 'Sifreyi goster'}
              accessibilityRole="button"
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !shouldShowPasswordToggle && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightButton}
              disabled={!onRightIconPress}
            >
              <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {(error || hint) && (
          <Text
            style={[
              styles.helperText,
              { color: error ? colors.error : colors.textMuted },
            ]}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  leftIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  rightButton: {
    position: 'absolute',
    right: 0,
    padding: 14,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default TextInput;

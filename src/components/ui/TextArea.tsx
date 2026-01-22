import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface TextAreaProps extends Omit<RNTextInputProps, 'style' | 'multiline'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const TextArea = forwardRef<RNTextInput, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      required = false,
      disabled = false,
      minHeight = 100,
      maxHeight = 200,
      maxLength,
      showCharacterCount = false,
      containerStyle,
      inputStyle,
      value = '',
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [height, setHeight] = useState(minHeight);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleContentSizeChange = (e: any) => {
      const contentHeight = e.nativeEvent.contentSize.height;
      const newHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
      setHeight(newHeight);
      props.onContentSizeChange?.(e);
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

    const characterCount = value?.length || 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

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
              minHeight,
            },
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              { color: disabled ? colors.textMuted : colors.text, height },
              inputStyle,
            ]}
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            multiline
            textAlignVertical="top"
            value={value}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onContentSizeChange={handleContentSizeChange}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint}
            {...props}
          />
        </View>

        <View style={styles.footer}>
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

          {showCharacterCount && maxLength && (
            <Text
              style={[
                styles.characterCount,
                { color: isOverLimit ? colors.error : colors.textMuted },
              ]}
            >
              {characterCount}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';

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
    borderRadius: 16,
    borderWidth: 1.5,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default TextArea;

import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface VerificationCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export function VerificationCodeInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
}: VerificationCodeInputProps) {
  const { colors, isDark } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');

    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.slice(0, length).replace(/[^0-9]/g, '');
      onChange(pastedCode);
      if (pastedCode.length === length) {
        Keyboard.dismiss();
      } else if (inputRefs.current[pastedCode.length]) {
        inputRefs.current[pastedCode.length]?.focus();
      }
      return;
    }

    // Handle single character
    const digit = text.replace(/[^0-9]/g, '');
    newValue[index] = digit;
    const newCode = newValue.join('').slice(0, length);
    onChange(newCode);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Dismiss keyboard when complete
    if (newCode.length === length) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // If focusing on an empty cell, focus on the first empty cell instead
    const firstEmptyIndex = value.length;
    if (index > firstEmptyIndex && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
              borderColor: value[index]
                ? colors.brand[500]
                : isDark
                ? colors.zinc[700]
                : colors.zinc[300],
              color: colors.text,
            },
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1}
          selectTextOnFocus
          selectionColor={colors.brand[500]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});

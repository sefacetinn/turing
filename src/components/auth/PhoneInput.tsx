import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

export function PhoneInput({
  value,
  onChange,
  error,
  label = 'Telefon Numarası',
  placeholder = '5XX XXX XX XX',
}: PhoneInputProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const formatPhoneInput = (text: string): string => {
    // Remove all non-digits
    let digits = text.replace(/\D/g, '');

    // If starts with 90, remove it
    if (digits.startsWith('90')) {
      digits = digits.slice(2);
    }

    // If starts with 0, remove it for formatting
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // Limit to 10 digits
    digits = digits.slice(0, 10);

    // Format: XXX XXX XX XX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    }
  };

  const handleChange = (text: string) => {
    const formatted = formatPhoneInput(text);
    // Store with 0 prefix for validation
    const rawValue = '0' + formatted.replace(/\s/g, '');
    onChange(rawValue);
  };

  // Display value without leading 0
  const displayValue = value.startsWith('0')
    ? formatPhoneInput(value.slice(1))
    : formatPhoneInput(value);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label} <Text style={{ color: colors.error }}>*</Text>
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.zinc[800] : colors.zinc[100],
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.brand[500]
              : isDark
              ? colors.zinc[700]
              : colors.zinc[300],
          },
        ]}
      >
        <View style={[styles.prefix, { borderRightColor: isDark ? colors.zinc[700] : colors.zinc[300] }]}>
          <Text style={[styles.prefixText, { color: colors.textSecondary }]}>
            +90
          </Text>
        </View>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={displayValue}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={14} // XXX XXX XX XX format
        />
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

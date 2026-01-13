import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

interface InputLabelProps {
  label: string;
  marginTop?: boolean;
}

export function InputLabel({ label, marginTop }: InputLabelProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.inputLabel, { color: colors.textSecondary }, marginTop && { marginTop: 16 }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
});

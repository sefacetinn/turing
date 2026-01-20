import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { validatePassword, getPasswordStrength } from '../../utils/validation';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { colors, isDark } = useTheme();
  const requirements = validatePassword(password);
  const strength = getPasswordStrength(password);

  const getStrengthColor = () => {
    if (strength < 40) return colors.error;
    if (strength < 80) return colors.warning;
    return colors.success;
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength < 40) return 'Zayıf';
    if (strength < 80) return 'Orta';
    return 'Güçlü';
  };

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barBackground,
            { backgroundColor: isDark ? colors.zinc[700] : colors.zinc[200] },
          ]}
        >
          <View
            style={[
              styles.barFill,
              {
                width: `${strength}%`,
                backgroundColor: getStrengthColor(),
              },
            ]}
          />
        </View>
        {strength > 0 && (
          <Text
            style={[styles.strengthLabel, { color: getStrengthColor() }]}
          >
            {getStrengthLabel()}
          </Text>
        )}
      </View>

      {/* Requirements List */}
      {showRequirements && (
        <View style={styles.requirements}>
          {requirements.map((req) => (
            <View key={req.id} style={styles.requirementRow}>
              <Ionicons
                name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={req.met ? colors.success : colors.textMuted}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: req.met ? colors.success : colors.textSecondary,
                    textDecorationLine: req.met ? 'line-through' : 'none',
                  },
                ]}
              >
                {req.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  requirements: {
    marginTop: 12,
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
  },
});

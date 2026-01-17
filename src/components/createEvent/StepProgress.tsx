import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Step, steps } from '../../data/createEventData';

interface StepProgressProps {
  currentStep: Step;
  onStepPress: (step: Step) => void;
}

export function StepProgress({ currentStep, onStepPress }: StepProgressProps) {
  const { colors, isDark } = useTheme();
  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <TouchableOpacity
            style={[
              styles.progressStep,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' },
              index <= currentStepIndex && {
                backgroundColor: isDark ? 'rgba(75, 48, 184, 0.2)' : 'rgba(75, 48, 184, 0.15)'
              },
            ]}
            onPress={() => index < currentStepIndex && onStepPress(step.key)}
            disabled={index > currentStepIndex}
          >
            <Ionicons
              name={step.icon as any}
              size={16}
              color={index <= currentStepIndex ? colors.brand[400] : colors.textMuted}
            />
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.progressLine,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border },
                index < currentStepIndex && { backgroundColor: colors.brand[400] },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
});

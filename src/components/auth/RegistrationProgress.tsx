import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { RegistrationStep } from '../../types/auth';

interface RegistrationProgressProps {
  steps: RegistrationStep[];
  currentStep: number;
  showLabels?: boolean;
}

export function RegistrationProgress({
  steps,
  currentStep,
  showLabels = false,
}: RegistrationProgressProps) {
  const { colors, isDark } = useTheme();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress}%`, { damping: 15, stiffness: 100 }),
  }));

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBackground,
            { backgroundColor: isDark ? colors.zinc[700] : colors.zinc[200] },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.brand[500] },
              progressStyle,
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentStep + 1}/{steps.length}
        </Text>
      </View>

      {/* Step Labels */}
      {showLabels && (
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      index <= currentStep
                        ? colors.brand[500]
                        : isDark
                        ? colors.zinc[700]
                        : colors.zinc[300],
                  },
                ]}
              />
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        index < currentStep
                          ? colors.brand[500]
                          : isDark
                          ? colors.zinc[700]
                          : colors.zinc[300],
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Current Step Info */}
      <View style={styles.currentStepInfo}>
        <Text style={[styles.currentStepTitle, { color: colors.text }]}>
          {steps[currentStep]?.title}
        </Text>
        <Text style={[styles.currentStepDesc, { color: colors.textSecondary }]}>
          {steps[currentStep]?.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 36,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  currentStepInfo: {
    marginTop: 16,
  },
  currentStepTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentStepDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});

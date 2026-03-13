import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

export function Stepper({ value, min, max, onChange, label }: StepperProps) {
  const haptics = useHaptics();

  const decrement = () => {
    if (value > min) {
      haptics.light();
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      haptics.light();
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepper}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.button, value <= min && styles.buttonDisabled]}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          onPress={increment}
          style={[styles.button, value >= max && styles.buttonDisabled]}
          disabled={value >= max}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, value >= max && styles.buttonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  button: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: Colors.textMuted,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
});

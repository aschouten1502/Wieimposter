import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
import { IconMinus, IconPlus } from '@/components/icons';
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
      <View style={[styles.stepper, Platform.OS === 'web' && (GlassStyle as any)]}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.button, value <= min && styles.buttonDisabled]}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <IconMinus size={22} color={value <= min ? Colors.textMuted : Colors.primary} />
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
          <IconPlus size={22} color={value >= max ? Colors.textMuted : Colors.primary} />
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
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  button: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontSize: 34,
    letterSpacing: 1,
  },
});

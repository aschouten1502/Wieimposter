import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, ButtonHeight } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const haptics = useHaptics();

  const handlePress = () => {
    if (disabled || loading) return;
    haptics.light();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text
          style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    height: ButtonHeight.sm,
    paddingHorizontal: Spacing.md,
  },
  size_md: {
    height: ButtonHeight.md,
    paddingHorizontal: Spacing.lg,
  },
  size_lg: {
    height: ButtonHeight.lg,
    paddingHorizontal: Spacing.xl,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  text_primary: {
    color: Colors.text,
  },
  text_secondary: {
    color: Colors.text,
  },
  text_danger: {
    color: Colors.text,
  },
  text_ghost: {
    color: Colors.textSecondary,
  },
  text_sm: {
    fontSize: FontSize.md,
  },
  text_md: {
    fontSize: FontSize.lg,
  },
  text_lg: {
    fontSize: FontSize.xl,
    letterSpacing: 2,
  },
});

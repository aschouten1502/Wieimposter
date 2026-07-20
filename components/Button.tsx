import React, { useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, ButtonHeight } from '@/constants/theme';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    haptics.light();
    onPress();
  };

  const spinnerColor = variant === 'primary' ? Colors.inkDeep : Colors.text;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} />
        ) : (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`], textStyle]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  danger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
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
    fontFamily: Fonts.sansBold,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  text_primary: {
    color: Colors.inkDeep,
  },
  text_secondary: {
    color: Colors.text,
  },
  text_danger: {
    color: Colors.text,
  },
  text_ghost: {
    color: Colors.textMuted,
  },
  text_sm: {
    fontSize: FontSize.xs,
  },
  text_md: {
    fontSize: 13,
  },
  text_lg: {
    fontSize: FontSize.sm,
  },
});

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing, GlassStyle } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 'medium', noPadding }: GlassCardProps) {
  const bgMap = {
    light: Colors.glass,
    medium: Colors.surface,
    strong: Colors.surfaceLight,
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bgMap[intensity] },
        Platform.OS === 'web' && (GlassStyle as ViewStyle),
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  padding: {
    padding: Spacing.lg,
  },
});

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing } from '@/constants/theme';
import { PatternBackdrop } from '@/components/Ornaments';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export function ScreenContainer({ children, style, centered }: ScreenContainerProps) {
  return (
    <LinearGradient
      colors={['#0C1714', '#0A1412', '#071010']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <PatternBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.container, centered && styles.centered, style]}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

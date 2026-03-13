import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export function ScreenContainer({ children, style, centered }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, centered && styles.centered, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

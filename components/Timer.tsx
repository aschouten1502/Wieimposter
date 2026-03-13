import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface TimerDisplayProps {
  seconds: number;
  progress: number;
}

export function TimerDisplay({ seconds, progress }: TimerDisplayProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = minutes > 0
    ? `${minutes}:${secs.toString().padStart(2, '0')}`
    : `${secs}s`;

  const isLow = seconds <= 10;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }, isLow && styles.progressBarLow]} />
      </View>
      <Text style={[styles.time, isLow && styles.timeLow]}>{timeString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressBarLow: {
    backgroundColor: Colors.danger,
  },
  time: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timeLow: {
    color: Colors.danger,
  },
});

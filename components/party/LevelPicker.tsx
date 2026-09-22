import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { ContentLevel, LEVEL_LABEL } from '@/types/party';
import { useHaptics } from '@/hooks/useHaptics';

const LEVELS: ContentLevel[] = ['mild', 'heet', 'extra'];

interface LevelPickerProps {
  value: ContentLevel;
  onChange: (level: ContentLevel) => void;
}

/** Drie-standen keuze voor hoe pittig de kaarten mogen zijn. */
export function LevelPicker({ value, onChange }: LevelPickerProps) {
  const haptics = useHaptics();
  return (
    <View style={styles.wrap}>
      {LEVELS.map((lvl) => {
        const active = lvl === value;
        return (
          <TouchableOpacity
            key={lvl}
            activeOpacity={0.8}
            onPress={() => {
              haptics.light();
              onChange(lvl);
            }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{LEVEL_LABEL[lvl]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: Colors.inkDeep,
  },
});

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { IconCross } from '@/components/icons';

interface PlayerInputProps {
  index: number;
  value: string;
  onChange: (text: string) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function PlayerInput({ index, value, onChange, onRemove, showRemove }: PlayerInputProps) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

  return (
    <View style={[styles.container, Platform.OS === 'web' && (GlassStyle as any)]}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={`Speler ${index + 1}`}
        placeholderTextColor={Colors.textMuted}
        maxLength={20}
        autoCorrect={false}
      />
      {showRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton} activeOpacity={0.7}>
          <IconCross size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  indicator: {
    width: 9,
    height: 9,
    marginLeft: Spacing.md,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  removeButton: {
    padding: Spacing.md,
  },
});

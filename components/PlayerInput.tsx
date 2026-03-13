import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';

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
          <Text style={styles.removeText}>✕</Text>
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
    width: 4,
    height: '100%',
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontWeight: '500',
  },
  removeButton: {
    padding: Spacing.md,
  },
  removeText: {
    color: Colors.textMuted,
    fontSize: FontSize.lg,
  },
});

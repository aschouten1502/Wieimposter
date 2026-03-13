import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { Category } from '@/types/game';
import { useHaptics } from '@/hooks/useHaptics';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onPress?: (id: string) => void;
}

export function CategoryCard({ category, selected, onPress }: CategoryCardProps) {
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light();
    onPress?.(category.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{category.name}</Text>
      <Text style={styles.count}>{category.words.length} woorden</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 110,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  count: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});

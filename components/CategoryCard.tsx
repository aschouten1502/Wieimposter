import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
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
      style={[
        styles.card,
        selected && styles.cardSelected,
        Platform.OS === 'web' && (GlassStyle as any),
      ]}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={styles.name}>{category.name}</Text>
      <Text style={styles.count}>{category.words.length} woorden</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 110,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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

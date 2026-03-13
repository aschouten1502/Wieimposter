import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
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
      {selected && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.name, selected && styles.nameSelected]}>{category.name}</Text>
      <Text style={styles.count}>{category.words.length} woorden</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    minHeight: 120,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  nameSelected: {
    color: Colors.text,
  },
  count: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});

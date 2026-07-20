import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
import { Category } from '@/types/game';
import { CategoryIcons, IconCards, IconCheck } from '@/components/icons';
import { useHaptics } from '@/hooks/useHaptics';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onPress?: (id: string) => void;
}

export function CategoryCard({ category, selected, onPress }: CategoryCardProps) {
  const haptics = useHaptics();
  const Icon = CategoryIcons[category.icon] ?? IconCards;

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
          <IconCheck size={13} color={Colors.inkDeep} strokeWidth={2.2} />
        </View>
      )}
      <View style={styles.iconWrap}>
        <Icon size={28} color={selected ? Colors.accent : Colors.textSecondary} />
      </View>
      <Text
        style={[styles.name, selected && styles.nameSelected]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {category.name}
      </Text>
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
  iconWrap: {
    marginBottom: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: 14,
    textAlign: 'center',
  },
  nameSelected: {
    color: Colors.text,
  },
  count: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginTop: 3,
  },
});

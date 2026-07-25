import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { CategoryIcons, IconCards, IconChevronLeft } from '@/components/icons';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
import { categories } from '@/data/categories';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <IconChevronLeft size={18} color={Colors.textSecondary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.overline}>Woordenlijst</Text>
          <Text style={styles.title}>Categorieën</Text>
        </View>

        {categories.map((cat) => {
          const Icon = CategoryIcons[cat.icon] ?? IconCards;
          return (
            <View
              key={cat.id}
              style={[styles.card, Platform.OS === 'web' && (GlassStyle as any)]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconTile}>
                  <Icon size={26} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{cat.name}</Text>
                  <Text style={styles.cardCount}>{cat.words.length} woorden</Text>
                </View>
              </View>
              <View style={styles.wordTags}>
                {cat.words.slice(0, 6).map((word) => (
                  <View key={word.id} style={styles.tag}>
                    <Text style={styles.tagText}>{word.value}</Text>
                  </View>
                ))}
                {cat.words.length > 6 && (
                  <View style={[styles.tag, styles.tagMore]}>
                    <Text style={styles.tagTextMore}>+{cat.words.length - 6}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  backText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerBlock: {
    marginBottom: Spacing.xl,
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 42,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 26,
    letterSpacing: 0.5,
  },
  cardCount: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  wordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
  },
  tagMore: {
    backgroundColor: Colors.primary,
  },
  tagTextMore: {
    color: Colors.inkDeep,
    fontFamily: Fonts.sansBold,
    fontSize: 13,
  },
});

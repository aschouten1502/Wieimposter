import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { categories } from '@/data/categories';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Terug</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Categorieën</Text>

        {categories.map((cat) => (
          <View key={cat.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{cat.icon}</Text>
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
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  cardCount: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
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
    fontSize: FontSize.sm,
  },
  tagMore: {
    backgroundColor: Colors.primary,
  },
  tagTextMore: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

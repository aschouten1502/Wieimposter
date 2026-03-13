import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

const RULES = [
  {
    emoji: '👥',
    title: 'Rollen verdelen',
    description: 'Geef de telefoon door zodat iedereen privé zijn rol ziet. Burgers of imposter!',
  },
  {
    emoji: '🔤',
    title: 'Het geheime woord',
    description: 'Burgers kennen het geheime woord. De imposter weet niet welk woord het is!',
  },
  {
    emoji: '💡',
    title: 'Hints geven',
    description: 'Geef om de beurt 2 woorden als hint in de groep. Wees subtiel genoeg zodat de imposter het niet raadt!',
  },
  {
    emoji: '👉',
    title: 'Wijzen',
    description: 'Tel tot 3 en wijs tegelijk naar wie jij denkt dat de imposter is. De persoon met de meeste stemmen vliegt eruit!',
  },
  {
    emoji: '🏆',
    title: 'Winnen',
    description: 'Burgers winnen als de imposter wordt gevonden. De imposter wint door niet ontmaskerd te worden, of door het woord te raden als laatste kans!',
  },
];

export default function HowToPlayScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Terug</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Hoe te Spelen</Text>

        {RULES.map((rule, index) => (
          <View key={index} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleEmoji}>{rule.emoji}</Text>
              <View style={styles.ruleNumber}>
                <Text style={styles.ruleNumberText}>{index + 1}</Text>
              </View>
            </View>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleDescription}>{rule.description}</Text>
          </View>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pro tip</Text>
          <Text style={styles.tipText}>
            Als imposter: probeer hints te geven die vaag genoeg zijn om niet op te vallen, maar specifiek genoeg om verdacht over te komen als burger.
          </Text>
        </View>
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
  ruleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  ruleEmoji: {
    fontSize: 28,
  },
  ruleNumber: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  ruleTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  ruleDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  tipTitle: {
    color: Colors.accent,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
});

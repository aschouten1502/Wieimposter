import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { GlassCard } from '@/components/GlassCard';
import {
  IconChevronLeft,
  IconEye,
  IconProps,
  IconQuestion,
  IconSparkle,
  IconTrophy,
  IconUsers,
  IconVote,
} from '@/components/icons';
import { Colors, Fonts, Spacing } from '@/constants/theme';

interface Rule {
  Icon: React.ComponentType<IconProps>;
  title: string;
  description: string;
}

const RULES: Rule[] = [
  {
    Icon: IconUsers,
    title: 'Rollen verdelen',
    description:
      'De telefoon gaat rond en iedereen bekijkt privé zijn rol. Houd je scherm verborgen voor de rest.',
  },
  {
    Icon: IconEye,
    title: 'Het geheime woord',
    description:
      'De burgers kennen het geheime woord. De imposter krijgt alleen een vage hint en moet zich staande houden.',
  },
  {
    Icon: IconQuestion,
    title: 'Hints geven',
    description:
      'Om de beurt geef je één woord als hint, in de aangegeven volgorde. Verraad het woord niet, maar laat merken dat je het kent.',
  },
  {
    Icon: IconVote,
    title: 'Aanwijzen',
    description:
      'Tel hardop af: drie, twee, één — en wijs allemaal tegelijk één persoon aan. Zeg het woord nog niet hardop. Bij gelijkspel ontsnapt de imposter.',
  },
  {
    Icon: IconTrophy,
    title: 'Winnen',
    description:
      'Is de imposter aangewezen, dan krijgt die nog één kans: hardop het geheime woord noemen. Klopt het, dan wint de imposter alsnog. Anders winnen de burgers.',
  },
];

export default function HowToPlayScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconChevronLeft size={16} color={Colors.textSecondary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <Text style={styles.overline}>UITLEG</Text>
        <Text style={styles.title}>De spelregels</Text>

        {RULES.map((rule, index) => (
          <GlassCard key={rule.title} intensity="light" style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <rule.Icon size={26} color={Colors.primary} />
              <Text style={styles.ruleNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleDescription}>{rule.description}</Text>
          </GlassCard>
        ))}

        <GlassCard intensity="light" style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <IconSparkle size={18} color={Colors.primary} />
            <Text style={styles.tipTitle}>PRO-TIP</Text>
          </View>
          <Text style={styles.tipText}>
            Als imposter: luister goed naar de hints vóór jou en beweeg mee. Blijf vaag genoeg om
            niet op te vallen, maar net specifiek genoeg om voor burger door te gaan.
          </Text>
        </GlassCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  backText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 0.5,
  },
  ruleCard: {
    marginBottom: Spacing.md,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  ruleNumber: {
    color: Colors.primary,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 30,
    lineHeight: 34,
  },
  ruleTitle: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 24,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  ruleDescription: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  tipCard: {
    marginTop: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  tipText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
});

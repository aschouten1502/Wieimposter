import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Medallion } from '@/components/Ornaments';
import { IconMask } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { fitFontSize } from '@/utils/helpers';

export default function GuessScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const applyImposterGuessed = useGameStore((s) => s.applyImposterGuessed);

  if (!round) {
    router.replace('/');
    return null;
  }

  const imposters = players.filter((p) => round.imposterIds.includes(p.id));
  const names = imposters.map((p) => p.name).join(' & ');
  const isPlural = imposters.length > 1;

  const handleCorrect = () => {
    haptics.success();
    applyImposterGuessed();
    router.replace('/game/results');
  };

  const handleWrong = () => {
    haptics.error();
    router.replace('/game/results');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Medallion size={104}>
            <IconMask size={36} color={Colors.imposter} />
          </Medallion>
        </Animated.View>

        <Animated.Text entering={FadeIn.duration(400).delay(200)} style={styles.overline}>
          Ontmaskerd
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.duration(500).delay(300)}
          style={[styles.name, { fontSize: fitFontSize(names, { max: 40, min: 22, maxChars: 14, lines: 2 }) }]}
          numberOfLines={2}
        >
          {names}
        </Animated.Text>

        <Animated.Text entering={FadeIn.duration(400).delay(500)} style={styles.lead}>
          {isPlural ? 'Zij waren de imposters.' : 'Was de imposter.'}
        </Animated.Text>

        <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.card}>
          <Text style={styles.cardTitle}>Laatste kans</Text>
          <Text style={styles.cardText}>
            {isPlural ? 'De imposters noemen' : 'De imposter noemt'} nu hardop welk woord het
            volgens {isPlural ? 'hen' : 'hem of haar'} was. Klopt het? Dan {isPlural ? 'winnen zij' : 'wint de imposter'} alsnog.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.duration(400).delay(700)} style={styles.actions}>
        <Button title="GOED GERADEN" onPress={handleCorrect} size="lg" />
        <Button title="Fout — burgers winnen" onPress={handleWrong} variant="secondary" size="md" />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    color: Colors.imposter,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    letterSpacing: 0.5,
    lineHeight: 46,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  lead: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  card: {
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  cardTitle: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_COLORS } from '@/constants/config';

export default function VotePassScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const getVoteOrder = useGameStore((s) => s.getVoteOrder);

  if (!round) {
    router.replace('/');
    return null;
  }

  const voteOrder = getVoteOrder();
  const currentVoter =
    round.currentVoterIndex < voteOrder.length ? voteOrder[round.currentVoterIndex] : null;

  if (!currentVoter) {
    router.replace('/');
    return null;
  }

  const playerIndex = players.findIndex((p) => p.id === currentVoter.id);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Animated.Text entering={FadeIn.duration(300)} style={styles.overline}>
          Stemronde
        </Animated.Text>
        <Animated.Text entering={FadeIn.duration(400).delay(100)} style={styles.instruction}>
          Geef de telefoon aan
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(150)}
          style={[styles.playerName, { color }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currentVoter.name}
        </Animated.Text>
        <Animated.Text entering={FadeIn.duration(400).delay(400)} style={styles.warning}>
          Stem in stilte — niemand mag meekijken.
        </Animated.Text>

        <Animated.View
          entering={FadeIn.duration(300).delay(500)}
          style={[styles.progress, Platform.OS === 'web' && (GlassStyle as any)]}
        >
          <Text style={styles.progressText}>
            Stem {round.currentVoterIndex + 1} van {voteOrder.length}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.buttonContainer}>
        <Button
          title="IK GA STEMMEN"
          onPress={() => router.replace('/game/vote')}
          size="lg"
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  instruction: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.18,
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  warning: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    letterSpacing: 0.3,
    marginTop: Spacing.lg,
  },
  progress: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.glass,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  progressText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

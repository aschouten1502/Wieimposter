import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
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
        <Animated.Text entering={FadeIn.duration(300)} style={styles.instruction}>Geef de telefoon aan</Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(150)}
          style={[styles.playerName, { color, textShadowColor: color + '40' }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currentVoter.name}
        </Animated.Text>
        <Animated.Text entering={FadeIn.duration(400).delay(400)} style={styles.warning}>Stem in stilte — niemand mag meekijken.</Animated.Text>

        <Animated.View entering={FadeIn.duration(300).delay(500)} style={[styles.progress, Platform.OS === 'web' && (GlassStyle as any)]}>
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
  instruction: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  warning: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  progress: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.glass,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

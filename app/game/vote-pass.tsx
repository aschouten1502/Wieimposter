import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_COLORS } from '@/constants/config';

export default function VotePassScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);

  if (!round) {
    router.replace('/');
    return null;
  }

  const currentPlayer = players[round.currentPlayerIndex];
  if (!currentPlayer) {
    router.replace('/');
    return null;
  }

  const color = PLAYER_COLORS[round.currentPlayerIndex % PLAYER_COLORS.length];

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Text style={styles.icon}>🗳️</Text>
        <Text style={styles.instruction}>Geef de telefoon aan</Text>
        <Text style={[styles.playerName, { color }]}>{currentPlayer.name}</Text>
        <Text style={styles.subtitle}>om te stemmen</Text>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Stem {round.currentPlayerIndex + 1} van {players.length}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="IK BEN KLAAR"
          onPress={() => router.replace('/game/vote')}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  instruction: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '500',
  },
  playerName: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '500',
  },
  progress: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
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

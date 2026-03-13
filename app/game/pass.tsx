import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_COLORS } from '@/constants/config';

export default function PassScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const currentPlayer = round && round.currentPlayerIndex < players.length
    ? players[round.currentPlayerIndex] : null;

  if (!currentPlayer || !round) {
    router.replace('/');
    return null;
  }

  const playerIndex = players.findIndex((p) => p.id === currentPlayer.id);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Text style={styles.instruction}>Geef de telefoon aan</Text>
        <Text style={[styles.playerName, { color }]} adjustsFontSizeToFit numberOfLines={1}>{currentPlayer.name}</Text>
        <Text style={styles.warning}>Zorg dat niemand meekijkt!</Text>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Speler {round.currentPlayerIndex + 1} van {players.length}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="IK BEN KLAAR"
          onPress={() => router.replace('/game/reveal')}
          size="lg"
        />
      </View>
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
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { TimerDisplay } from '@/components/Timer';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTimer } from '@/hooks/useTimer';
import { useHaptics } from '@/hooks/useHaptics';
import { PLAYER_COLORS } from '@/constants/config';

export default function HintsScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const markHintGiven = useGameStore((s) => s.markHintGiven);
  const nextPlayer = useGameStore((s) => s.nextPlayer);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCurrentPlayerIndex = useGameStore((s) => s.setCurrentPlayerIndex);

  const timerEnabled = useSettingsStore((s) => s.timerEnabled);
  const hintTimer = useSettingsStore((s) => s.hintTimer);

  const currentPlayerIndex = round?.currentPlayerIndex ?? 0;
  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex >= players.length - 1;

  const { seconds, progress, reset } = useTimer({
    initialSeconds: hintTimer,
    autoStart: timerEnabled,
    onExpire: () => {
      haptics.warning();
      handleNext();
    },
  });

  if (!round || !currentPlayer) {
    router.replace('/');
    return null;
  }

  const color = PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length];

  const handleNext = () => {
    haptics.light();
    markHintGiven(currentPlayer.id);

    if (isLastPlayer) {
      setPhase('discussion');
      router.replace('/game/discussion');
    } else {
      nextPlayer();
      reset();
    }
  };

  return (
    <ScreenContainer centered>
      <View style={styles.header}>
        <Text style={styles.phase}>HINT RONDE</Text>
        {timerEnabled && <TimerDisplay seconds={seconds} progress={progress} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.turnLabel}>Aan de beurt:</Text>
        <Text style={[styles.playerName, { color }]}>{currentPlayer.name}</Text>
        <Text style={styles.instruction}>Geef een hint met één woord</Text>
      </View>

      <View style={styles.progressDots}>
        {players.map((p, i) => (
          <View
            key={p.id}
            style={[
              styles.dot,
              { backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] },
              i <= currentPlayerIndex && styles.dotActive,
              i > currentPlayerIndex && styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="VOLGENDE SPELER" onPress={handleNext} size="lg" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  phase: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  playerName: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: Spacing.md,
    textAlign: 'center',
  },
  instruction: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontStyle: 'italic',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    opacity: 0.3,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

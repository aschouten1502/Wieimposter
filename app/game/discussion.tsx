import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { TimerDisplay } from '@/components/Timer';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTimer } from '@/hooks/useTimer';
import { useHaptics } from '@/hooks/useHaptics';

export default function DiscussionScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCurrentPlayerIndex = useGameStore((s) => s.setCurrentPlayerIndex);

  const timerEnabled = useSettingsStore((s) => s.timerEnabled);
  const discussionTimer = useSettingsStore((s) => s.discussionTimer);
  const votingMode = useSettingsStore((s) => s.votingMode);

  const { seconds, progress } = useTimer({
    initialSeconds: discussionTimer,
    autoStart: timerEnabled,
    onExpire: () => {
      haptics.warning();
      handleGoToVote();
    },
  });

  if (!round) {
    router.replace('/');
    return null;
  }

  const handleGoToVote = () => {
    haptics.medium();
    setCurrentPlayerIndex(0);
    if (votingMode === 'secret') {
      setPhase('vote-passing');
      router.replace('/game/vote-pass');
    } else {
      setPhase('vote-passing');
      router.replace('/game/vote-pass');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.phase}>DISCUSSIE</Text>
        {timerEnabled && <TimerDisplay seconds={seconds} progress={progress} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Bespreek wie de imposter is!</Text>
        <Text style={styles.subtitle}>Wie gaf een verdachte hint?</Text>

        <View style={styles.playerList}>
          {players.map((player, index) => (
            <PlayerBadge
              key={player.id}
              name={player.name}
              index={index}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="GA NAAR STEMMEN" onPress={handleGoToVote} size="lg" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
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
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  playerList: {
    gap: Spacing.xs,
  },
  buttonContainer: {
    paddingBottom: Spacing.lg,
  },
});

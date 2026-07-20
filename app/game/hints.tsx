import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';

export default function HintsScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const startVoting = useGameStore((s) => s.startVoting);
  const [hintRound, setHintRound] = useState(1);

  if (!round) {
    router.replace('/');
    return null;
  }

  // Reorder players starting from hintStartIndex
  const startIdx = round.hintStartIndex;
  const orderedPlayers = [
    ...players.slice(startIdx),
    ...players.slice(0, startIdx),
  ];

  const handleNextHintRound = () => {
    setHintRound(hintRound + 1);
  };

  const handleDone = () => {
    startVoting();
    router.replace('/game/vote-pass');
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, Platform.OS === 'web' && (GlassStyle as any)]}>
        <Text style={styles.phase}>HINT RONDE {hintRound}</Text>
        <Text style={styles.title}>Eén woord per persoon</Text>
        <Text style={styles.subtitle}>
          Begin bij de eerste speler en ga de kring rond.{'\n'}
          Subtiel — niet te makkelijk.
        </Text>
      </View>

      <View style={styles.playerList}>
        <Text style={styles.orderLabel}>VOLGORDE</Text>
        {orderedPlayers.map((player) => {
          const originalIndex = players.findIndex((p) => p.id === player.id);
          return (
            <PlayerBadge
              key={player.id}
              name={player.name}
              index={originalIndex}
            />
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="NOG EEN RONDE"
          onPress={handleNextHintRound}
          variant="secondary"
          size="md"
        />
        <Button
          title="GA STEMMEN"
          onPress={handleDone}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  phase: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontSize: FontSize.xxl,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  playerList: {
    flex: 1,
  },
  orderLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  buttonContainer: {
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
});

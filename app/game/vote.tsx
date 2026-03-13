import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { PLAYER_COLORS } from '@/constants/config';

export default function VoteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const castVote = useGameStore((s) => s.castVote);
  const nextPlayer = useGameStore((s) => s.nextPlayer);
  const setPhase = useGameStore((s) => s.setPhase);
  const calculateResults = useGameStore((s) => s.calculateResults);

  if (!round) {
    router.replace('/');
    return null;
  }

  const currentPlayer = players[round.currentPlayerIndex];
  if (!currentPlayer) {
    router.replace('/');
    return null;
  }

  const isLastVoter = round.currentPlayerIndex >= players.length - 1;
  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);
  const color = PLAYER_COLORS[round.currentPlayerIndex % PLAYER_COLORS.length];

  const handleVote = () => {
    if (!selectedId) return;
    haptics.medium();

    castVote(currentPlayer.id, selectedId);

    if (isLastVoter) {
      calculateResults();
      router.replace('/game/results');
    } else {
      nextPlayer();
      router.replace('/game/vote-pass');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.phase}>STEMMEN</Text>
        <Text style={[styles.voterName, { color }]}>{currentPlayer.name}</Text>
        <Text style={styles.instruction}>Op wie stem je?</Text>
      </View>

      <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
        {otherPlayers.map((player) => {
          const playerIndex = players.findIndex((p) => p.id === player.id);
          return (
            <PlayerBadge
              key={player.id}
              name={player.name}
              index={playerIndex}
              selected={selectedId === player.id}
              onPress={() => {
                haptics.light();
                setSelectedId(player.id);
              }}
            />
          );
        })}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="BEVESTIG STEM"
          onPress={handleVote}
          disabled={!selectedId}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  phase: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  voterName: {
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    letterSpacing: 2,
  },
  instruction: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    marginTop: Spacing.sm,
  },
  playerList: {
    flex: 1,
  },
  buttonContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

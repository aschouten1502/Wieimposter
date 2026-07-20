import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';

export default function VoteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const getVoteOrder = useGameStore((s) => s.getVoteOrder);
  const castVote = useGameStore((s) => s.castVote);

  if (!round) {
    router.replace('/');
    return null;
  }

  const voteOrder = getVoteOrder();
  const currentVoter =
    round.phase === 'voting' && round.currentVoterIndex < voteOrder.length
      ? voteOrder[round.currentVoterIndex]
      : null;

  if (!currentVoter) {
    // Voting already finished (or state is stale) — nothing to do here.
    if (round.phase === 'results') {
      router.replace('/game/results');
    } else {
      router.replace('/');
    }
    return null;
  }

  const voterIndex = players.findIndex((p) => p.id === currentVoter.id);
  const voterColor = PLAYER_COLORS[voterIndex % PLAYER_COLORS.length];
  const candidates = players.filter((p) => p.id !== currentVoter.id);

  const handleConfirm = () => {
    if (!selectedId) return;
    haptics.heavy();
    castVote(selectedId);

    const updatedRound = useGameStore.getState().round;
    if (updatedRound?.phase === 'results') {
      router.replace('/game/results');
    } else {
      router.replace('/game/vote-pass');
    }
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, Platform.OS === 'web' && (GlassStyle as any)]}>
        <Text style={styles.phase}>STEMMEN</Text>
        <Text
          style={[styles.voterName, { color: voterColor }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currentVoter.name}
        </Text>
        <Text style={styles.subtitle}>
          Wie is volgens jou de imposter?{'\n'}
          Jouw stem blijft geheim.
        </Text>
      </View>

      <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
        {candidates.map((player) => {
          const originalIndex = players.findIndex((p) => p.id === player.id);
          return (
            <PlayerBadge
              key={player.id}
              name={player.name}
              index={originalIndex}
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
          title="STEM"
          onPress={handleConfirm}
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
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  phase: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  voterName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  playerList: {
    flex: 1,
  },
  buttonContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

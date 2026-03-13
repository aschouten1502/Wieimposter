import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';

export default function VoteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const setPhase = useGameStore((s) => s.setPhase);

  if (!round) {
    router.replace('/');
    return null;
  }

  const handleConfirm = () => {
    if (!selectedId) return;
    haptics.heavy();

    const isImposter = round.imposterIds.includes(selectedId);
    const result = isImposter ? 'civilians_win' : 'imposter_wins';

    const updatedPlayers = players.map((p) => {
      if (result === 'civilians_win' && p.role === 'civilian') {
        return { ...p, score: p.score + 1 };
      }
      if (result === 'imposter_wins' && p.role === 'imposter') {
        return { ...p, score: p.score + 2 };
      }
      return p;
    });

    useGameStore.setState({
      players: updatedPlayers,
      round: { ...round, roundResult: result, votedPlayerId: selectedId, phase: 'results' },
    });

    router.replace('/game/results');
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, Platform.OS === 'web' && (GlassStyle as any)]}>
        <Text style={styles.phase}>STEMMEN</Text>
        <Text style={styles.emoji}>👆</Text>
        <Text style={styles.title}>Wijs tegelijk aan!</Text>
        <Text style={styles.subtitle}>
          Tel op 3... 1, 2, 3 — WIJS!{'\n'}
          Selecteer wie de meeste stemmen kreeg.
        </Text>
      </View>

      <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
        {players.map((player, index) => (
          <PlayerBadge
            key={player.id}
            name={player.name}
            index={index}
            selected={selectedId === player.id}
            onPress={() => {
              haptics.light();
              setSelectedId(player.id);
            }}
          />
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="BEVESTIG"
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
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
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

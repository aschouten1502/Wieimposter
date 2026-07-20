import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';

const NONE = '__none__';

export default function VoteScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const resolveVote = useGameStore((s) => s.resolveVote);

  if (!round) {
    router.replace('/');
    return null;
  }

  const handleConfirm = () => {
    if (!selectedId) return;
    haptics.heavy();
    resolveVote(selectedId === NONE ? null : selectedId);
    router.replace('/game/results');
  };

  return (
    <ScreenContainer>
      <View style={[styles.header, Platform.OS === 'web' && (GlassStyle as any)]}>
        <Text style={styles.phase}>STEMMEN</Text>
        <Text style={styles.emoji}>👆</Text>
        <Text style={styles.title}>Wijs tegelijk aan!</Text>
        <Text style={styles.subtitle}>
          Tel af — 1, 2, 3 — en wijs allemaal tegelijk.{'\n'}
          Kies wie de meeste vingers kreeg. Gelijkspel? Dan ontsnapt de imposter.
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            haptics.light();
            setSelectedId(NONE);
          }}
        >
          <View
            style={[
              styles.noneRow,
              selectedId === NONE && styles.noneRowSelected,
              Platform.OS === 'web' && (GlassStyle as any),
            ]}
          >
            <Text style={styles.noneEmoji}>🤝</Text>
            <Text style={styles.noneText}>Gelijkspel / niemand eruit</Text>
          </View>
        </TouchableOpacity>
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
  noneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  noneRowSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
    borderStyle: 'solid',
  },
  noneEmoji: {
    fontSize: FontSize.lg,
    marginRight: Spacing.sm,
  },
  noneText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

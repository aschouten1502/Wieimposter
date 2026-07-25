import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { OrnamentDivider } from '@/components/Ornaments';
import { IconEye } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';

const NOBODY = '__nobody__';

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
    resolveVote(selectedId === NOBODY ? null : selectedId);

    // The imposter only gets a last-chance guess when the group caught them.
    const updated = useGameStore.getState().round;
    if (updated?.roundResult === 'civilians_win') {
      router.replace('/game/guess');
    } else {
      router.replace('/game/results');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.overline}>Stemmen</Text>
        <Text style={styles.title}>Tel hardop af</Text>
        <Text style={styles.subtitle}>
          Drie, twee, één — en wijs allemaal tegelijk één persoon aan.
        </Text>

        <View style={styles.notice}>
          <IconEye size={18} color={Colors.accent} />
          <Text style={styles.noticeText}>
            Zeg het woord nog niet hardop. De imposter mag het straks nog raden.
          </Text>
        </View>

        <OrnamentDivider style={styles.divider} />
        <Text style={styles.pickLabel}>Wie kreeg de meeste vingers?</Text>
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
            setSelectedId(NOBODY);
          }}
        >
          <View style={[styles.nobodyRow, selectedId === NOBODY && styles.nobodyRowSelected]}>
            <Text style={styles.nobodyText}>Gelijkspel — niemand eruit</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="BEVESTIG" onPress={handleConfirm} disabled={!selectedId} size="lg" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 23,
    paddingHorizontal: Spacing.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.accentGlow,
  },
  noticeText: {
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.sansMedium,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  divider: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.xl,
  },
  pickLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
  playerList: {
    flex: 1,
    marginTop: Spacing.md,
  },
  nobodyRow: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    backgroundColor: Colors.glass,
  },
  nobodyRowSelected: {
    borderColor: Colors.primary,
    borderStyle: 'solid',
    backgroundColor: Colors.surfaceLight,
  },
  nobodyText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.md,
  },
  buttonContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

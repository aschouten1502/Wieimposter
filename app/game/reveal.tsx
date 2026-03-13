import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { PLAYER_COLORS } from '@/constants/config';
import { getCategoryById } from '@/data/categories';

export default function RevealScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [revealed, setRevealed] = useState(false);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const currentPlayer = round && round.currentPlayerIndex < players.length
    ? players[round.currentPlayerIndex] : null;
  const markPlayerRevealed = useGameStore((s) => s.markPlayerRevealed);
  const nextPlayer = useGameStore((s) => s.nextPlayer);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCurrentPlayerIndex = useGameStore((s) => s.setCurrentPlayerIndex);

  if (!currentPlayer || !round) {
    router.replace('/');
    return null;
  }

  const isImposter = round.imposterIds.includes(currentPlayer.id);
  const isTrollRound = round.trollRound === true;
  const category = getCategoryById(round.categoryId);
  const categoryName = category?.name ?? '';
  const playerIndex = players.findIndex((p) => p.id === currentPlayer.id);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  const isLastPlayer = round.currentPlayerIndex >= players.length - 1;

  const handleReveal = () => {
    setRevealed(true);
    if (isImposter) {
      haptics.error();
    } else {
      haptics.success();
    }
  };

  const handleHide = () => {
    markPlayerRevealed(currentPlayer.id);

    if (isLastPlayer) {
      setCurrentPlayerIndex(0);
      setPhase('hints');
      router.replace('/game/hints');
    } else {
      nextPlayer();
      router.replace('/game/pass');
    }
  };

  return (
    <ScreenContainer centered>
      <Text style={[styles.playerName, { color }]}>{currentPlayer.name}</Text>

      {!revealed ? (
        <TouchableOpacity
          style={styles.revealArea}
          onPress={handleReveal}
          activeOpacity={0.8}
        >
          <Text style={styles.revealIcon}>👁️</Text>
          <Text style={styles.revealText}>TAP OM JE ROL TE ZIEN</Text>
          <Text style={styles.revealHint}>Houd je scherm verborgen!</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.roleContainer}>
          {isImposter ? (
            <>
              <Text style={styles.imposterIcon}>🕵️</Text>
              <Text style={styles.imposterText}>JIJ BENT DE</Text>
              <Text style={styles.imposterTitle}>IMPOSTER</Text>
              {isTrollRound ? (
                <Text style={styles.imposterHint}>Plot twist: iedereen is imposter!</Text>
              ) : (
                <>
                  <Text style={styles.categoryHint}>Categorie: {categoryName}</Text>
                  <Text style={styles.imposterHint}>Je kent het woord niet. Bluf mee!</Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.civilianIcon}>✅</Text>
              <Text style={styles.civilianText}>Je bent een burger</Text>
              <Text style={styles.secretWord}>{round.secretWord}</Text>
              <Text style={styles.civilianHint}>Geef subtiele hints zonder het weg te geven</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {revealed ? (
          <Button
            title="VERBERG & GEEF DOOR"
            onPress={handleHide}
            size="lg"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  playerName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: Spacing.xl,
  },
  revealArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  revealIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  revealText: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: 2,
  },
  revealHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imposterIcon: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  imposterText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
  imposterTitle: {
    color: Colors.imposter,
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 4,
  },
  categoryHint: {
    color: Colors.accent,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  imposterHint: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  civilianIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  civilianText: {
    color: Colors.civilian,
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  secretWord: {
    color: Colors.text,
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  civilianHint: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  placeholder: {
    height: 64,
  },
});

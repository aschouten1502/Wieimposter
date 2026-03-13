import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
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
  const [showBack, setShowBack] = useState(false);
  const flipProgress = useSharedValue(0);

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

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value > 0.5 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value > 0.5 ? 1 : 0,
    };
  });

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);

    // Show back content right before it becomes visible
    setTimeout(() => setShowBack(true), 250);

    flipProgress.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

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
      <Animated.Text
        entering={FadeIn.duration(400)}
        style={[styles.playerName, { color }]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {currentPlayer.name}
      </Animated.Text>

      <Pressable style={styles.cardWrapper} onPress={handleReveal} disabled={revealed}>
        {/* Front of card */}
        <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
          <Text style={styles.revealIcon}>🃏</Text>
          <Text style={styles.revealText} adjustsFontSizeToFit numberOfLines={1}>TAP OM TE DRAAIEN</Text>
          <Text style={styles.revealHint}>Houd je scherm verborgen!</Text>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
          {showBack && (
            isImposter ? (
              <View style={styles.roleContent}>
                <Text style={styles.imposterIcon}>🕵️</Text>
                <Text style={styles.imposterText}>JIJ BENT DE</Text>
                <Text style={styles.imposterTitle} adjustsFontSizeToFit numberOfLines={1}>IMPOSTER</Text>
                {isTrollRound ? (
                  <Text style={styles.imposterHint}>Plot twist: iedereen is imposter!</Text>
                ) : (
                  <>
                    <Text style={styles.categoryHint}>Categorie: {categoryName}</Text>
                    <Text style={styles.imposterHint}>Je kent het woord niet. Bluf mee!</Text>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.roleContent}>
                <Text style={styles.civilianIcon}>✅</Text>
                <Text style={styles.civilianText}>Je bent een burger</Text>
                <Text style={styles.secretWord} adjustsFontSizeToFit numberOfLines={1}>{round.secretWord}</Text>
                <Text style={styles.civilianHint}>Geef subtiele hints zonder het weg te geven</Text>
              </View>
            )
          )}
        </Animated.View>
      </Pressable>

      <View style={styles.buttonContainer}>
        {revealed ? (
          <Animated.View entering={FadeInUp.duration(400).delay(800)}>
            <Button
              title="VERBERG EN GEEF DOOR"
              onPress={handleHide}
              size="lg"
            />
          </Animated.View>
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
  cardWrapper: {
    flex: 1,
    width: '100%',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  cardFront: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardBack: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  revealIcon: {
    fontSize: 72,
    marginBottom: Spacing.lg,
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
  roleContent: {
    alignItems: 'center',
    justifyContent: 'center',
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

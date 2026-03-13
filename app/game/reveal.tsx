import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { PLAYER_COLORS } from '@/constants/config';
import { getCategoryById } from '@/data/categories';

export default function RevealScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [revealed, setRevealed] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

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
  const category = getCategoryById(round.sourceCategoryId);
  const categoryName = category?.name ?? '';
  const hasMultipleCategories = round.categoryIds.length > 1;
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
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
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

  // Front of card (unrevealed) - rotates from 0deg to 90deg
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5],
    outputRange: [1, 0, 0],
  });

  // Back of card (revealed) - rotates from -90deg to 0deg
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.5, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  const roleColor = isImposter ? Colors.imposter : Colors.civilian;

  return (
    <ScreenContainer centered>
      {/* Player name pill */}
      <View style={[styles.namePill, Platform.OS === 'web' && (GlassStyle as any)]}>
        <View style={[styles.nameDot, { backgroundColor: color }]} />
        <Text style={[styles.playerName, { color }]}>{currentPlayer.name}</Text>
      </View>

      {/* Card container */}
      <View style={styles.cardWrapper}>
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            Platform.OS === 'web' && (GlassStyle as any),
            { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }], opacity: frontOpacity },
          ]}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleReveal}
            activeOpacity={0.9}
            disabled={revealed}
          >
            <View style={styles.cardPattern}>
              <Text style={styles.cardQuestionMark}>?</Text>
            </View>
            <View style={styles.cardFrontContent}>
              <Text style={styles.tapIcon}>👁️</Text>
              <Text style={styles.tapText}>TAP OM TE ONTHULLEN</Text>
              <Text style={styles.tapHint}>Houd je scherm verborgen!</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Back of card (role) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            Platform.OS === 'web' && (GlassStyle as any),
            { borderColor: roleColor },
            { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          <View style={[styles.roleGlow, { shadowColor: roleColor }]} />
          {isImposter ? (
            <View style={styles.roleContent}>
              <Text style={styles.roleEmoji}>🕵️</Text>
              <Text style={styles.roleLabel}>JIJ BENT DE</Text>
              <Text style={[styles.roleTitle, { color: Colors.imposter }]}>IMPOSTER</Text>
              {isTrollRound ? (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>Plot twist: iedereen is imposter!</Text>
                </View>
              ) : hasMultipleCategories ? (
                <>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{categoryName}</Text>
                  </View>
                  <View style={styles.hintBox}>
                    <Text style={styles.hintText}>Het woord komt uit deze categorie. Bluf mee!</Text>
                  </View>
                </>
              ) : (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>Je kent het woord niet. Bluf mee!</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.roleContent}>
              <Text style={styles.roleEmoji}>✅</Text>
              <Text style={styles.civilianLabel}>Je bent een burger</Text>
              <View style={styles.wordContainer}>
                <Text style={styles.secretWord}>{round.secretWord}</Text>
              </View>
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>Geef subtiele hints zonder het weg te geven</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom button */}
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
  namePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  nameDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  playerName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    aspectRatio: 0.65,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.04,
  },
  cardQuestionMark: {
    fontSize: 280,
    fontWeight: '900',
    color: Colors.text,
  },
  cardFrontContent: {
    alignItems: 'center',
  },
  tapIcon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  tapText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tapHint: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  roleGlow: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    borderRadius: 200,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 0,
  },
  roleContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  roleEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  roleLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    letterSpacing: 1,
  },
  roleTitle: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 4,
  },
  civilianLabel: {
    color: Colors.civilian,
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  wordContainer: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  secretWord: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  categoryPill: {
    backgroundColor: Colors.accentGlow,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  categoryText: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  hintBox: {
    marginTop: Spacing.md,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
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

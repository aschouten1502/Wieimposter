import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { CornerFrame, Medallion, PatternBackdrop } from '@/components/Ornaments';
import { IconEye, IconMask } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { PLAYER_COLORS } from '@/constants/config';

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
      router.replace('/game/hint-start');
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

  // Gedeeld kaartchroom: watermerk, binnenkader en hoektikjes.
  const cardChrome = (
    <>
      <PatternBackdrop opacity={0.03} />
      <View pointerEvents="none" style={styles.innerFrame} />
      <CornerFrame inset={18} size={14} />
    </>
  );

  return (
    <ScreenContainer centered>
      {/* Naamplaatje */}
      <View style={[styles.namePill, Platform.OS === 'web' && (GlassStyle as any)]}>
        <View style={[styles.nameDiamond, { backgroundColor: color }]} />
        <Text style={styles.playerName} numberOfLines={1}>{currentPlayer.name}</Text>
      </View>

      {/* Card container */}
      <View style={styles.cardWrapper}>
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }], opacity: frontOpacity },
          ]}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleReveal}
            activeOpacity={0.9}
            disabled={revealed}
          >
            {cardChrome}
            <View pointerEvents="none" style={styles.watermark}>
              <Text style={styles.watermarkMark}>?</Text>
            </View>
            <View style={styles.cardFrontContent}>
              <Medallion size={116}>
                <IconEye size={36} color={Colors.text} />
              </Medallion>
              <Text style={styles.frontOverline}>TIK OM TE ONTHULLEN</Text>
              <Text style={styles.frontSub}>Houd je scherm verborgen.</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Back of card (role) */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }], opacity: backOpacity },
          ]}
        >
          {cardChrome}
          <View style={[styles.roleGlow, { shadowColor: roleColor }]} />
          {isImposter ? (
            <View style={styles.roleContent}>
              <Medallion size={104}>
                <IconMask size={38} color={Colors.imposter} />
              </Medallion>
              <Text style={styles.backOverline}>JIJ BENT DE</Text>
              <Text
                style={styles.imposterTitle}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                Imposter
              </Text>
              {/* Ook in een trollronde toont de kaart een gewone imposterkaart —
                  de verrassing dat iedereen imposter was, valt pas op het uitslagscherm. */}
              {round.hintsEnabled ? (
                <>
                  <View style={styles.hintPill}>
                    <Text style={styles.hintPillText}>{round.imposterHint}</Text>
                  </View>
                  <Text style={styles.subText}>Dit is je enige aanwijzing. Bluf mee.</Text>
                </>
              ) : (
                <Text style={styles.subText}>
                  Geen hint deze ronde. Luister goed naar de anderen en bluf mee.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.roleContent}>
              <Text style={styles.backOverline}>JOUW WOORD</Text>
              <Text
                style={styles.secretWord}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {round.secretWord}
              </Text>
              <View style={styles.jadeHairline} />
              <Text style={styles.subText}>Geef straks één woord als hint — subtiel.</Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom button */}
      <View style={styles.buttonContainer}>
        {revealed ? (
          <Button
            title="GEEF DOOR"
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
  nameDiamond: {
    width: 9,
    height: 9,
    marginRight: Spacing.sm,
    transform: [{ rotate: '45deg' }],
  },
  playerName: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.md,
    letterSpacing: 1,
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
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.inkDeep,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  innerFrame: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.xxl - 10,
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
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.05,
  },
  watermarkMark: {
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 260,
    color: Colors.text,
  },
  cardFrontContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  frontOverline: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  frontSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  roleGlow: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    borderRadius: 200,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 0,
  },
  roleContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
  },
  backOverline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  imposterTitle: {
    color: Colors.imposter,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 54,
    lineHeight: 62,
    letterSpacing: 1,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  secretWord: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 46,
    lineHeight: 56,
    letterSpacing: 1,
    marginTop: Spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  jadeHairline: {
    width: 56,
    height: 1,
    backgroundColor: Colors.civilian,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  hintPill: {
    backgroundColor: Colors.accentGlow,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  hintPillText: {
    color: Colors.accent,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
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

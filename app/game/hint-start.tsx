import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { CornerFrame } from '@/components/Ornaments';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_COLORS } from '@/constants/config';

export default function HintStartScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCurrentPlayerIndex = useGameStore((s) => s.setCurrentPlayerIndex);

  if (!round || !players.length) {
    router.replace('/');
    return null;
  }

  const startIndex = round.hintStartIndex;
  const startPlayer = players[startIndex];
  const color = PLAYER_COLORS[startIndex % PLAYER_COLORS.length];

  const handleStart = () => {
    setCurrentPlayerIndex(0);
    setPhase('hints');
    router.replace('/game/hints');
  };

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Animated.Text entering={FadeIn.duration(400)} style={styles.allRevealed}>
          Iedereen heeft zijn kaart gezien.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={[styles.startBox, Platform.OS === 'web' && (GlassStyle as any)]}
        >
          <CornerFrame inset={8} size={14} />
          <Text style={styles.startLabel}>BEGINT MET HINTS</Text>
          <View style={[styles.nameDiamond, { backgroundColor: color }]} />
          <Text
            style={[styles.startName, { color }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {startPlayer.name}
          </Text>
        </Animated.View>

        <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.hint}>
          Geef om de beurt één woord als hint.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInUp.duration(400).delay(700)} style={styles.buttonContainer}>
        <Button
          title="START HINTS"
          onPress={handleStart}
          size="lg"
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  allRevealed: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
    marginBottom: Spacing.xxl,
  },
  startBox: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  startLabel: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  nameDiamond: {
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    marginBottom: Spacing.md,
  },
  startName: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSize.display,
    letterSpacing: 1,
    textAlign: 'center',
  },
  hint: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

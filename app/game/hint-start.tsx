import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
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
          Iedereen heeft zijn kaart gezien!
        </Animated.Text>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={[styles.startBox, Platform.OS === 'web' && (GlassStyle as any)]}>
          <Text style={styles.startLabel}>BEGINT MET HINTS</Text>
          <View style={[styles.nameDot, { backgroundColor: color }]} />
          <Text
            style={[styles.startName, { color }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {startPlayer.name}
          </Text>
        </Animated.View>

        <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.hint}>
          Geef om de beurt 2 woorden als hint
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
    fontSize: FontSize.lg,
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: Spacing.xxl,
  },
  startBox: {
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  startLabel: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  nameDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: Spacing.sm,
  },
  startName: {
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

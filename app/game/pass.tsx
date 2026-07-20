import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { PLAYER_COLORS } from '@/constants/config';

export default function PassScreen() {
  const router = useRouter();
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const currentPlayer = round && round.currentPlayerIndex < players.length
    ? players[round.currentPlayerIndex] : null;

  if (!currentPlayer || !round) {
    router.replace('/');
    return null;
  }

  const playerIndex = players.findIndex((p) => p.id === currentPlayer.id);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Animated.Text entering={FadeIn.duration(400)} style={styles.overline}>
          GEEF DE TELEFOON AAN
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(120)}
          style={[styles.playerName, { color, textShadowColor: color + '55' }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currentPlayer.name}
        </Animated.Text>
        <Animated.Text entering={FadeIn.duration(400).delay(320)} style={styles.sub}>
          Zorg dat niemand meekijkt.
        </Animated.Text>

        <Animated.View
          entering={FadeIn.duration(400).delay(450)}
          style={[styles.progress, Platform.OS === 'web' && (GlassStyle as any)]}
        >
          <Text style={styles.progressText}>
            Speler {round.currentPlayerIndex + 1} van {players.length}
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.duration(500).delay(550)} style={styles.buttonContainer}>
        <Button
          title="IK BEN KLAAR"
          onPress={() => router.replace('/game/reveal')}
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
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  playerName: {
    fontFamily: Fonts.displayBold,
    fontSize: 60,
    lineHeight: 70,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  sub: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    marginTop: Spacing.lg,
  },
  progress: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.glass,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  progressText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
});

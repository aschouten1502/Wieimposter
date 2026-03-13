import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { useHaptics } from '@/hooks/useHaptics';

export default function ResultsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [showFinalGuess, setShowFinalGuess] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [guessResult, setGuessResult] = useState<boolean | null>(null);
  const hapticsTriggered = useRef(false);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const imposterFinalGuess = useGameStore((s) => s.imposterFinalGuess);
  const nextRound = useGameStore((s) => s.nextRound);
  const resetGame = useGameStore((s) => s.resetGame);
  const recordGame = useStatsStore((s) => s.recordGame);

  const votedPlayer = useMemo(() => {
    if (!round?.votedPlayerId) return null;
    return players.find((p) => p.id === round.votedPlayerId) ?? null;
  }, [players, round]);

  const imposters = useMemo(() => {
    if (!round) return [];
    return players.filter((p) => round.imposterIds.includes(p.id));
  }, [players, round]);

  useEffect(() => {
    if (round?.roundResult && !hapticsTriggered.current) {
      haptics.heavy();
      hapticsTriggered.current = true;
    }
  }, [round?.roundResult, haptics]);

  if (!round) {
    router.replace('/');
    return null;
  }

  const civiliansWon = round.roundResult === 'civilians_win';
  const imposterGuessed = round.roundResult === 'imposter_guessed';
  const isTrollRound = round.trollRound === true;

  const handleFinalGuess = () => {
    const correct = imposterFinalGuess(guessText);
    setGuessResult(correct);
    if (correct) {
      haptics.error();
    } else {
      haptics.success();
    }
  };

  const recordAndProceed = (callback: () => void) => {
    if (round.roundResult) {
      recordGame(
        round.roundResult,
        players.map((p) => ({ name: p.name, role: p.role }))
      );
    }
    callback();
  };

  const handleNextRound = () => {
    recordAndProceed(() => {
      nextRound();
      router.replace('/game/pass');
    });
  };

  const handleNewGame = () => {
    recordAndProceed(() => {
      resetGame();
      router.replace('/game/setup');
    });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Result Header */}
        <View style={styles.resultHeader}>
          {isTrollRound ? (
            <>
              <Animated.Text entering={ZoomIn.duration(600)} style={styles.resultEmoji}>🤡</Animated.Text>
              <Animated.Text
                entering={FadeInDown.duration(500).delay(300)}
                style={[styles.resultTitle, { color: Colors.accent, textShadowColor: Colors.accentGlow }]}
              >
                TROLL RONDE!
              </Animated.Text>
              <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.trollSubtitle}>
                Iedereen was imposter — niemand kende het woord!
              </Animated.Text>
            </>
          ) : imposterGuessed ? (
            <>
              <Animated.Text entering={ZoomIn.duration(600)} style={styles.resultEmoji}>🧠</Animated.Text>
              <Animated.Text
                entering={FadeInDown.duration(500).delay(300)}
                style={[styles.resultTitle, { color: Colors.imposter, textShadowColor: Colors.primaryGlow }]}
              >
                IMPOSTER RAADT HET!
              </Animated.Text>
            </>
          ) : civiliansWon ? (
            <>
              <Animated.Text entering={ZoomIn.duration(600)} style={styles.resultEmoji}>🎉</Animated.Text>
              <Animated.Text
                entering={FadeInDown.duration(500).delay(300)}
                style={[styles.resultTitle, { color: Colors.civilian }]}
              >
                BURGERS WINNEN!
              </Animated.Text>
            </>
          ) : (
            <>
              <Animated.Text entering={ZoomIn.duration(600)} style={styles.resultEmoji}>🕵️</Animated.Text>
              <Animated.Text
                entering={FadeInDown.duration(500).delay(300)}
                style={[styles.resultTitle, { color: Colors.imposter, textShadowColor: Colors.primaryGlow }]}
              >
                IMPOSTER WINT!
              </Animated.Text>
            </>
          )}
        </View>

        {/* Secret Word */}
        <Animated.View entering={FadeInUp.duration(500).delay(600)}>
          <GlassCard style={styles.wordCard}>
            <Text style={styles.wordLabel}>Het geheime woord was:</Text>
            <Text style={styles.wordValue} adjustsFontSizeToFit numberOfLines={1}>{round.secretWord}</Text>
          </GlassCard>
        </Animated.View>

        {/* Imposter Reveal */}
        <Animated.View entering={FadeInUp.duration(400).delay(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>De Imposter{imposters.length > 1 ? 's' : ''}</Text>
          {imposters.map((imp) => {
            const index = players.findIndex((p) => p.id === imp.id);
            return (
              <PlayerBadge
                key={imp.id}
                name={imp.name}
                index={index}
                isImposter={true}
                showRole={true}
              />
            );
          })}
        </Animated.View>

        {/* Voted Out */}
        {votedPlayer && !isTrollRound && (
          <Animated.View entering={FadeInUp.duration(400).delay(1000)} style={styles.section}>
            <Text style={styles.sectionTitle}>Uitgestemd</Text>
            <PlayerBadge
              name={votedPlayer.name}
              index={players.findIndex((p) => p.id === votedPlayer.id)}
              isImposter={round.imposterIds.includes(votedPlayer.id)}
              showRole={true}
            />
          </Animated.View>
        )}

        {/* Final Guess */}
        {civiliansWon && guessResult === null && !showFinalGuess && (
          <Animated.View entering={FadeIn.duration(400).delay(1200)}>
            <Button
              title="IMPOSTER MAG RADEN"
              onPress={() => setShowFinalGuess(true)}
              variant="secondary"
              size="md"
            />
          </Animated.View>
        )}

        {showFinalGuess && guessResult === null && (
          <GlassCard style={styles.guessCard}>
            <Text style={styles.guessLabel}>Imposter, raad het woord:</Text>
            <TextInput
              style={styles.guessInput}
              value={guessText}
              onChangeText={setGuessText}
              placeholder="Typ je gok..."
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Button
              title="BEVESTIG"
              onPress={handleFinalGuess}
              disabled={!guessText.trim()}
              size="md"
            />
          </GlassCard>
        )}

        {guessResult !== null && (
          <Animated.View entering={ZoomIn.duration(400)}>
            <GlassCard style={styles.guessResultCard}>
              <Text style={[styles.guessResultText, guessResult ? styles.guessCorrect : styles.guessWrong]}>
                {guessResult ? 'CORRECT! Imposter wint alsnog!' : 'FOUT! Het was niet het juiste woord.'}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Scores */}
        <Animated.View entering={FadeInUp.duration(400).delay(1200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          {[...players].sort((a, b) => b.score - a.score).map((player) => (
            <View
              key={player.id}
              style={[styles.scoreRow, Platform.OS === 'web' && (GlassStyle as any)]}
            >
              <View style={[styles.scoreDot, { backgroundColor: Colors.text }]} />
              <Text style={styles.scoreName}>{player.name}</Text>
              <Text style={styles.scoreValue}>{player.score}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.duration(400).delay(1400)} style={styles.actions}>
          <Button title="VOLGENDE RONDE" onPress={handleNextRound} size="lg" />
          <Button
            title="NIEUW SPEL"
            onPress={handleNewGame}
            variant="secondary"
            size="md"
          />
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  resultHeader: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  trollSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  wordCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  wordLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  wordValue: {
    color: Colors.accent,
    fontSize: FontSize.xxxl,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: Colors.accentGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  guessCard: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  guessLabel: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  guessInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    fontSize: FontSize.xl,
    padding: Spacing.md,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  guessResultCard: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  guessResultText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  guessCorrect: {
    color: Colors.imposter,
  },
  guessWrong: {
    color: Colors.civilian,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  scoreName: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  scoreValue: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
});

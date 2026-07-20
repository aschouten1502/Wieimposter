import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { GlassCard } from '@/components/GlassCard';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { useHaptics } from '@/hooks/useHaptics';

type GuessOutcome = 'correct' | 'wrong' | 'unrecognized' | null;

export default function ResultsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [showFinalGuess, setShowFinalGuess] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [guessOutcome, setGuessOutcome] = useState<GuessOutcome>(null);
  const hapticsTriggered = useRef(false);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const checkImposterGuess = useGameStore((s) => s.checkImposterGuess);
  const applyImposterGuessed = useGameStore((s) => s.applyImposterGuessed);
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

  const scoreboard = useMemo(() => {
    return players
      .map((p) => ({ ...p, originalIndex: players.findIndex((pp) => pp.id === p.id) }))
      .sort((a, b) => b.score - a.score);
  }, [players]);

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
  const nobodyVoted = !round.votedPlayerId;

  const acceptGuess = () => {
    applyImposterGuessed();
    setGuessOutcome('correct');
    haptics.success();
  };

  const handleFinalGuess = () => {
    if (checkImposterGuess(guessText)) {
      acceptGuess();
    } else {
      // Not an exact match — let the group decide if it counts.
      setGuessOutcome('unrecognized');
      haptics.warning();
    }
  };

  const recordAndProceed = (callback: () => void) => {
    const result = useGameStore.getState().round?.roundResult;
    if (result) {
      recordGame(
        result,
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

  const handleExit = () => {
    recordAndProceed(() => {
      resetGame();
      router.replace('/');
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
              <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.subLine}>
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
              <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.subLine}>
                Gepakt, maar het woord toch geraden — de imposter steelt de winst!
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
              <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.subLine}>
                De imposter is ontmaskerd.
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
              <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.subLine}>
                {nobodyVoted
                  ? 'Niemand werd eruit gestemd — de imposter ontsnapt.'
                  : 'De verkeerde persoon is eruit gestemd.'}
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
          <Animated.View entering={FadeInUp.duration(400).delay(900)} style={styles.section}>
            <Text style={styles.sectionTitle}>Uitgestemd</Text>
            <PlayerBadge
              name={votedPlayer.name}
              index={players.findIndex((p) => p.id === votedPlayer.id)}
              isImposter={round.imposterIds.includes(votedPlayer.id)}
              showRole={true}
            />
          </Animated.View>
        )}

        {/* Final Guess (only when the imposter got caught) */}
        {civiliansWon && guessOutcome === null && !showFinalGuess && (
          <Animated.View entering={FadeIn.duration(400).delay(1000)}>
            <Button
              title="IMPOSTER MAG RADEN"
              onPress={() => setShowFinalGuess(true)}
              variant="secondary"
              size="md"
            />
          </Animated.View>
        )}

        {showFinalGuess && (guessOutcome === null || guessOutcome === 'unrecognized') && (
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
              editable={guessOutcome === null}
            />
            {guessOutcome === null ? (
              <Button
                title="BEVESTIG"
                onPress={handleFinalGuess}
                disabled={!guessText.trim()}
                size="md"
              />
            ) : (
              <View style={styles.overrideBox}>
                <Text style={styles.overrideText}>
                  "{guessText.trim()}" komt niet exact overeen. Vond de groep dit tóch goed?
                </Text>
                <View style={styles.overrideButtons}>
                  <Button
                    title="JA, TELT"
                    onPress={acceptGuess}
                    size="md"
                    style={styles.overrideButton}
                  />
                  <Button
                    title="NEE, FOUT"
                    onPress={() => {
                      setGuessOutcome('wrong');
                      haptics.error();
                    }}
                    variant="secondary"
                    size="md"
                    style={styles.overrideButton}
                  />
                </View>
              </View>
            )}
          </GlassCard>
        )}

        {(guessOutcome === 'correct' || guessOutcome === 'wrong') && (
          <Animated.View entering={ZoomIn.duration(400)}>
            <GlassCard style={styles.guessResultCard}>
              <Text style={[styles.guessResultText, guessOutcome === 'correct' ? styles.guessCorrect : styles.guessWrong]}>
                {guessOutcome === 'correct'
                  ? 'CORRECT! De imposter wint alsnog!'
                  : 'FOUT! De burgers houden de winst.'}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Scoreboard */}
        <Animated.View entering={FadeInUp.duration(400).delay(1100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Scorebord</Text>
          {scoreboard.map((p, i) => {
            const color = PLAYER_COLORS[p.originalIndex % PLAYER_COLORS.length];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            return (
              <View
                key={p.id}
                style={[styles.scoreRow, Platform.OS === 'web' && (GlassStyle as any)]}
              >
                <Text style={styles.scoreRank}>{medal}</Text>
                <View style={[styles.scoreDot, { backgroundColor: color }]} />
                <Text style={styles.scoreName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.scorePts}>{p.score}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.duration(400).delay(1200)} style={styles.actions}>
          <Button title="VOLGENDE RONDE" onPress={handleNextRound} size="lg" />
          <View style={styles.actionRow}>
            <Button
              title="Nieuw spel"
              onPress={handleNewGame}
              variant="secondary"
              size="md"
              style={styles.actionHalf}
            />
            <Button
              title="Stoppen"
              onPress={handleExit}
              variant="ghost"
              size="md"
              style={styles.actionHalf}
            />
          </View>
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
  subLine: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
  overrideBox: {
    gap: Spacing.md,
  },
  overrideText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  overrideButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  overrideButton: {
    flex: 1,
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
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scoreRank: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    width: 34,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  scoreName: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  scorePts: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
});

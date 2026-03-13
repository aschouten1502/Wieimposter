import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { useHaptics } from '@/hooks/useHaptics';

export default function ResultsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [showFinalGuess, setShowFinalGuess] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [guessResult, setGuessResult] = useState<boolean | null>(null);
  const [statsRecorded, setStatsRecorded] = useState(false);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const getVoteResults = useGameStore((s) => s.getVoteResults);
  const getImposters = useGameStore((s) => s.getImposters);
  const imposterFinalGuess = useGameStore((s) => s.imposterFinalGuess);
  const nextRound = useGameStore((s) => s.nextRound);
  const resetGame = useGameStore((s) => s.resetGame);
  const recordGame = useStatsStore((s) => s.recordGame);

  const voteResults = getVoteResults();
  const imposters = getImposters();

  // Record stats on mount (initial result)
  useEffect(() => {
    if (round?.roundResult && !statsRecorded) {
      haptics.heavy();
      setStatsRecorded(true);
    }
  }, []);

  if (!round) {
    router.replace('/');
    return null;
  }

  const civiliansWon = round.roundResult === 'civilians_win';
  const imposterGuessed = round.roundResult === 'imposter_guessed';

  const handleFinalGuess = () => {
    const correct = imposterFinalGuess(guessText);
    setGuessResult(correct);
    if (correct) {
      haptics.error();
    } else {
      haptics.success();
    }
  };

  // Record stats when leaving (captures final guess result too)
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
          {imposterGuessed ? (
            <>
              <Text style={styles.resultEmoji}>🧠</Text>
              <Text style={[styles.resultTitle, { color: Colors.imposter }]}>
                IMPOSTER RAADT HET WOORD!
              </Text>
            </>
          ) : civiliansWon ? (
            <>
              <Text style={styles.resultEmoji}>🎉</Text>
              <Text style={[styles.resultTitle, { color: Colors.civilian }]}>
                BURGERS WINNEN!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.resultEmoji}>🕵️</Text>
              <Text style={[styles.resultTitle, { color: Colors.imposter }]}>
                IMPOSTER WINT!
              </Text>
            </>
          )}
        </View>

        {/* Secret Word */}
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>Het geheime woord was:</Text>
          <Text style={styles.wordValue}>{round.secretWord}</Text>
        </View>

        {/* Imposter Reveal */}
        <View style={styles.section}>
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
        </View>

        {/* Vote Tally */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stemresultaten</Text>
          {voteResults.map((result) => {
            const index = players.findIndex((p) => p.id === result.playerId);
            const isImp = round.imposterIds.includes(result.playerId);
            return (
              <PlayerBadge
                key={result.playerId}
                name={result.playerName}
                index={index}
                voteCount={result.voteCount}
                isImposter={isImp}
                showRole={true}
              />
            );
          })}
        </View>

        {/* Final Guess (only if civilians won) */}
        {civiliansWon && guessResult === null && !showFinalGuess && (
          <Button
            title="IMPOSTER MAG RADEN"
            onPress={() => setShowFinalGuess(true)}
            variant="secondary"
            size="md"
          />
        )}

        {showFinalGuess && guessResult === null && (
          <View style={styles.guessContainer}>
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
          </View>
        )}

        {guessResult !== null && (
          <View style={styles.guessResultContainer}>
            <Text style={[styles.guessResultText, guessResult ? styles.guessCorrect : styles.guessWrong]}>
              {guessResult ? 'CORRECT! Imposter wint alsnog!' : 'FOUT! Het was niet het juiste woord.'}
            </Text>
          </View>
        )}

        {/* Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          {[...players].sort((a, b) => b.score - a.score).map((player) => {
            const index = players.findIndex((p) => p.id === player.id);
            return (
              <View key={player.id} style={styles.scoreRow}>
                <View style={[styles.scoreDot, { backgroundColor: Colors.text }]} />
                <Text style={styles.scoreName}>{player.name}</Text>
                <Text style={styles.scoreValue}>{player.score}</Text>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="VOLGENDE RONDE" onPress={handleNextRound} size="lg" />
          <Button
            title="NIEUW SPEL"
            onPress={handleNewGame}
            variant="secondary"
            size="md"
          />
        </View>
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
  },
  wordCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
  guessContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
  },
  guessResultContainer: {
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
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

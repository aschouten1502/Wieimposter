import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerBadge } from '@/components/PlayerBadge';
import { GlassCard } from '@/components/GlassCard';
import { Medallion } from '@/components/Ornaments';
import { IconMask, IconLeaf, IconSparkle, IconCrown } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { useGameStore } from '@/store/gameStore';
import { fitFontSize } from '@/utils/helpers';
import { useStatsStore } from '@/store/statsStore';
import { useHaptics } from '@/hooks/useHaptics';

function fitWord(word: string) {
  const fontSize = fitFontSize(word, { max: 40, min: 18, maxChars: 11, lines: 2 });
  return { fontSize, lineHeight: Math.round(fontSize * 1.2) };
}

export default function ResultsScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const hapticsTriggered = useRef(false);

  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
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

  const header = isTrollRound
    ? {
        Icon: IconSparkle,
        iconColor: Colors.primary,
        title: 'Iedereen was de imposter.',
        titleColor: Colors.accent,
        sub: 'Niemand kende het woord.',
      }
    : imposterGuessed
      ? {
          Icon: IconMask,
          iconColor: Colors.imposter,
          title: 'De imposter raadt het woord.',
          titleColor: Colors.imposter,
          sub: 'Gepakt, maar het woord toch geraden — de imposter steelt de winst.',
        }
      : civiliansWon
        ? {
            Icon: IconLeaf,
            iconColor: Colors.civilian,
            title: 'De burgers winnen.',
            titleColor: Colors.civilian,
            sub: 'De imposter is ontmaskerd.',
          }
        : {
            Icon: IconMask,
            iconColor: Colors.imposter,
            title: 'De imposter wint.',
            titleColor: Colors.imposter,
            sub: nobodyVoted
              ? 'Gelijkspel — niemand werd weggestemd. De imposter ontsnapt.'
              : 'De verkeerde persoon is eruit gestemd.',
          };
  const HeaderIcon = header.Icon;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Uitslagkop */}
        <View style={styles.resultHeader}>
          <Animated.View entering={ZoomIn.duration(600)}>
            <Medallion size={108}>
              <HeaderIcon size={36} color={header.iconColor} />
            </Medallion>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(300)}
            style={[styles.resultTitle, { color: header.titleColor }]}
          >
            {header.title}
          </Animated.Text>
          <Animated.Text entering={FadeIn.duration(400).delay(600)} style={styles.subLine}>
            {header.sub}
          </Animated.Text>
        </View>

        {/* Het geheime woord */}
        <Animated.View entering={FadeInUp.duration(500).delay(600)}>
          <GlassCard style={styles.wordCard}>
            <Text style={styles.wordLabel}>Het geheime woord</Text>
            <Text style={[styles.wordValue, fitWord(round.secretWord)]} numberOfLines={2}>
              {round.secretWord}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* De imposter(s) */}
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

        {/* Aangewezen — alleen tonen als de groep de verkeerde koos,
            anders herhaalt het simpelweg de imposterregel hierboven. */}
        {votedPlayer && !isTrollRound && !round.imposterIds.includes(votedPlayer.id) && (
          <Animated.View entering={FadeInUp.duration(400).delay(900)} style={styles.section}>
            <Text style={styles.sectionTitle}>Aangewezen</Text>
            <PlayerBadge
              name={votedPlayer.name}
              index={players.findIndex((p) => p.id === votedPlayer.id)}
              isImposter={false}
              showRole={true}
            />
          </Animated.View>
        )}

        {/* Scorebord */}
        <Animated.View entering={FadeInUp.duration(400).delay(1100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Scorebord</Text>
          {scoreboard.map((p, i) => {
            const color = PLAYER_COLORS[p.originalIndex % PLAYER_COLORS.length];
            return (
              <View
                key={p.id}
                style={[styles.scoreRow, Platform.OS === 'web' && (GlassStyle as any)]}
              >
                <View style={styles.scoreRankCell}>
                  <Text style={styles.scoreRank}>{i + 1}</Text>
                  {i === 0 && <IconCrown size={14} color={Colors.primary} />}
                </View>
                <View style={[styles.scoreDiamond, { backgroundColor: color }]} />
                <Text style={styles.scoreName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.scorePts}>{p.score}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Acties */}
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
  resultTitle: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  subLine: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  wordCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  wordLabel: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  wordValue: {
    color: Colors.accent,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  guessCard: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  guessOverline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  guessLabel: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.25,
  },
  guessInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  overrideBox: {
    gap: Spacing.md,
  },
  overrideText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    lineHeight: 21,
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
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.3,
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
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scoreRankCell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 44,
    gap: 4,
  },
  scoreRank: {
    color: Colors.primary,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.2,
  },
  scoreDiamond: {
    width: 10,
    height: 10,
    marginRight: Spacing.md,
    transform: [{ rotate: '45deg' }],
  },
  scoreName: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: FontSize.md,
    flex: 1,
  },
  scorePts: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.lg,
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

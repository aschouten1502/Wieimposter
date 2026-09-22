import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { DeckCard } from '@/components/party/DeckCard';
import { Colors, Fonts, Spacing, FontSize } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { getPartyGame } from '@/data/games';
import { heetDeck } from '@/data/party/heet';
import { usePartyStore } from '@/store/partyStore';
import { filterByLevel, drawNext, penalty } from '@/utils/party';
import { fitFontSize, shuffleArray } from '@/utils/helpers';
import { DeckItem } from '@/types/party';

const GAME_ID = 'heet';
/** Elke zoveelste vraag is een groepsvraag: iedereen antwoordt. */
const GROUP_EVERY = 5;

const RULES = [
  'De telefoon wijst iemand aan. Die persoon leest de vraag hardop voor en antwoordt.',
  'Eerlijk antwoorden, of je neemt de straf: twee slokken of een opdracht.',
  'De groep mag één doorvraag stellen. Elke vijfde vraag is een groepsvraag waarop iedereen kort antwoordt.',
];

interface Turn {
  item: DeckItem;
  /** Index in playerNames, of null bij een groepsvraag. */
  player: number | null;
  /** Hoeveelste vraag van deze sessie (1-based). */
  count: number;
}

function fitName(name: string) {
  const fontSize = fitFontSize(name, { max: 52, min: 26, maxChars: 10, lines: 2 });
  return { fontSize, lineHeight: Math.round(fontSize * 1.16) };
}

export default function HeetScreen() {
  const game = getPartyGame(GAME_ID)!;

  const playerNames = usePartyStore((s) => s.playerNames);
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const level = usePartyStore((s) => s.level);
  const markSeen = usePartyStore((s) => s.markSeen);
  const resetSeen = usePartyStore((s) => s.resetSeen);

  const [phase, setPhase] = useState<'intro' | 'play'>('intro');
  const [turn, setTurn] = useState<Turn | null>(null);
  const [exhausted, setExhausted] = useState(false);

  // Beurtvolgorde en teller leven in refs, zodat start() direct kan doortrekken.
  const orderRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const countRef = useRef(0);

  const pool = useMemo(() => filterByLevel(heetDeck, level), [level]);

  /** Trek een nog niet geziene vraag; null als de stapel op is. */
  const nextItem = useCallback((): DeckItem | null => {
    const seenIds = usePartyStore.getState().seen[GAME_ID] ?? [];
    const unseen = pool.filter((it) => !seenIds.includes(it.id));
    if (unseen.length === 0) return null;
    const item = drawNext(unseen, seenIds);
    if (item) markSeen(GAME_ID, item.id);
    return item;
  }, [pool, markSeen]);

  const step = useCallback(() => {
    const item = nextItem();
    if (!item) {
      setExhausted(true);
      return;
    }
    const count = countRef.current + 1;
    countRef.current = count;

    let player: number | null = null;
    if (count % GROUP_EVERY !== 0) {
      if (posRef.current >= orderRef.current.length) {
        orderRef.current = shuffleArray(playerNames.map((_, i) => i));
        posRef.current = 0;
      }
      player = orderRef.current[posRef.current] ?? null;
      posRef.current += 1;
    }
    setTurn({ item, player, count });
  }, [nextItem, playerNames]);

  const start = useCallback(() => {
    orderRef.current = shuffleArray(playerNames.map((_, i) => i));
    posRef.current = 0;
    countRef.current = 0;
    setExhausted(false);
    setPhase('play');
    step();
  }, [playerNames, step]);

  const restart = useCallback(() => {
    resetSeen(GAME_ID);
    setExhausted(false);
    step();
  }, [resetSeen, step]);

  const stop = useCallback(() => {
    setPhase('intro');
    setTurn(null);
    setExhausted(false);
  }, []);

  // Straf-teksten per kaart vastzetten, anders wisselt een opdracht bij elke render.
  const passPenalty = useMemo(() => penalty(drinkMode, 2), [drinkMode, turn?.item.id]);
  const groupPenalty = useMemo(() => penalty(drinkMode, 1), [drinkMode, turn?.item.id]);

  if (phase === 'intro') {
    return (
      <ScreenContainer>
        <PartyIntro game={game} rules={RULES} onStart={start} />
      </ScreenContainer>
    );
  }

  if (exhausted) {
    return (
      <ScreenContainer>
        <PartyHeader title={game.name} showLevel />
        <View style={styles.center}>
          <Animated.Text entering={FadeIn.duration(400)} style={styles.overline}>
            Stapel leeg
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(500).delay(100)} style={styles.doneTitle}>
            Alle vragen zijn geweest.
          </Animated.Text>
          <Animated.Text entering={FadeIn.duration(400).delay(250)} style={styles.doneSub}>
            Zet het niveau hoger voor meer vragen, of schud de stapel opnieuw.
          </Animated.Text>
        </View>
        <View style={styles.buttons}>
          <Button title="Opnieuw" onPress={restart} size="lg" />
          <Button title="Stoppen" onPress={stop} variant="ghost" size="sm" />
        </View>
      </ScreenContainer>
    );
  }

  if (!turn) {
    return (
      <ScreenContainer>
        <PartyHeader title={game.name} showLevel />
      </ScreenContainer>
    );
  }

  const isGroup = turn.player === null;
  const name = turn.player !== null ? playerNames[turn.player] ?? '' : '';
  const color = turn.player !== null ? PLAYER_COLORS[turn.player % PLAYER_COLORS.length] : game.accent;
  const untilGroup = GROUP_EVERY - (turn.count % GROUP_EVERY);

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} showLevel />

      <View style={styles.top}>
        {isGroup ? (
          <Animated.View key={`g-${turn.count}`} entering={FadeInDown.duration(400)} style={styles.topInner}>
            <Text style={[styles.overline, { color: game.accent }]}>Iedereen antwoordt</Text>
            <Text style={[styles.groupTitle, { color: game.accent, textShadowColor: game.accent + '55' }]}>
              Groepsvraag
            </Text>
            <Text style={styles.caption}>Vraag {turn.count}</Text>
          </Animated.View>
        ) : (
          <Animated.View key={`p-${turn.count}`} entering={FadeInDown.duration(400)} style={styles.topInner}>
            <Text style={styles.overline}>Aan de beurt</Text>
            <Text
              style={[styles.playerName, { color, textShadowColor: color + '55' }, fitName(name)]}
              numberOfLines={2}
            >
              {name}
            </Text>
            <Text style={styles.caption}>
              Vraag {turn.count} · groepsvraag over {untilGroup}
            </Text>
          </Animated.View>
        )}
      </View>

      <DeckCard
        cardKey={turn.item.id}
        overline="Hete vraag"
        text={turn.item.text}
        accent={game.accent}
        footer={isGroup ? `Om de beurt, kort. Wie weigert: ${groupPenalty}` : undefined}
      />

      <View style={styles.buttons}>
        <Button title="Beantwoord" onPress={step} size="lg" />
        {!isGroup && (
          <Button title={`Ik pas — ${passPenalty}`} onPress={step} variant="secondary" size="md" />
        )}
        <Button title="Stoppen" onPress={stop} variant="ghost" size="sm" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    minHeight: 120,
    justifyContent: 'center',
  },
  topInner: {
    alignItems: 'center',
    width: '100%',
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  playerName: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    letterSpacing: 1,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  groupTitle: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  caption: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  doneTitle: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  doneSub: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  buttons: {
    width: '100%',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

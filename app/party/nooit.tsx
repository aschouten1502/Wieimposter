import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { DeckCard } from '@/components/party/DeckCard';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getPartyGame } from '@/data/games';
import { nooitDeck } from '@/data/party/nooit';
import { usePartyStore } from '@/store/partyStore';
import { drawNext, filterByLevel, penaltyVerb } from '@/utils/party';
import { DeckItem } from '@/types/party';

const game = getPartyGame('nooit')!;
const GAME_ID = 'nooit';
/** Elke zoveelste kaart is een verhaalronde: wie het deed, vertelt kort hoe. */
const STORY_EVERY = 8;

const RULES = [
  'Lees de stelling hardop voor, met "Ik heb nog nooit" ervoor.',
  'Wie het wél heeft gedaan, drinkt of doet een opdracht.',
  'Tik op de kaart of op Volgende voor de volgende stelling.',
];

type Phase = 'intro' | 'play';

export default function NooitScreen() {
  const [phase, setPhase] = useState<Phase>('intro');
  /** null tijdens het spelen = de stapel is op. */
  const [current, setCurrent] = useState<DeckItem | null>(null);

  const level = usePartyStore((s) => s.level);
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const markSeen = usePartyStore((s) => s.markSeen);
  const resetSeen = usePartyStore((s) => s.resetSeen);
  const seenIds = usePartyStore((s) => s.seen[GAME_ID]);

  const deck = useMemo(() => filterByLevel(nooitDeck, level), [level]);
  const shown = seenIds?.length ?? 0;
  const isStoryRound = shown > 0 && shown % STORY_EVERY === 0;

  const drawCard = useCallback(() => {
    // Direct uit de store lezen zodat een resetSeen vlak ervoor al meetelt.
    const seen = usePartyStore.getState().seen[GAME_ID] ?? [];
    if (seen.length >= deck.length) {
      setCurrent(null);
      return;
    }
    const item = drawNext(deck, seen);
    if (!item) {
      setCurrent(null);
      return;
    }
    markSeen(GAME_ID, item.id);
    setCurrent(item);
  }, [deck, markSeen]);

  const start = useCallback(() => {
    resetSeen(GAME_ID);
    drawCard();
    setPhase('play');
  }, [resetSeen, drawCard]);

  const stop = useCallback(() => {
    setCurrent(null);
    setPhase('intro');
  }, []);

  if (phase === 'intro') {
    return (
      <ScreenContainer>
        <PartyIntro game={game} rules={RULES} onStart={start} />
      </ScreenContainer>
    );
  }

  const footer = isStoryRound
    ? 'Wie het wél deed, vertelt in één zin hoe.'
    : `Wel gedaan? Dan ${penaltyVerb(drinkMode)}.`;

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} showLevel />

      <View style={styles.body}>
        {current ? (
          <DeckCard
            cardKey={current.id}
            overline="Ik heb nog nooit…"
            text={current.text}
            footer={footer}
            accent={game.accent}
            onPress={drawCard}
          />
        ) : (
          <DeckCard
            cardKey="einde"
            overline="Einde van de stapel"
            text="Alle kaarten zijn geweest."
            footer="Nog een rondje? Dan schudden we opnieuw."
            accent={game.accent}
          />
        )}

        <View style={styles.meta}>
          {current && isStoryRound ? (
            <Text style={[styles.storyLabel, { color: game.accent }]}>Verhaalronde</Text>
          ) : null}
          <Text style={styles.counter}>
            {shown} van {deck.length}
          </Text>
        </View>

        <View style={styles.actions}>
          {current ? (
            <Button title="Volgende" onPress={drawCard} size="lg" />
          ) : (
            <Button title="Opnieuw" onPress={start} size="lg" />
          )}
          <Button title="Stoppen" onPress={stop} variant="ghost" size="sm" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  meta: {
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  storyLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  counter: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});

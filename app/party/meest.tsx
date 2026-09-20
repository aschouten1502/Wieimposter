import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { DeckCard } from '@/components/party/DeckCard';
import { Countdown } from '@/components/party/Countdown';
import { Colors, Fonts, Spacing, FontSize } from '@/constants/theme';
import { getPartyGame } from '@/data/games';
import { meestDeck } from '@/data/party/meest';
import { usePartyStore } from '@/store/partyStore';
import { filterByLevel, drawNext, penalty } from '@/utils/party';
import { DeckItem } from '@/types/party';

const GAME_KEY = 'meest';
/** Elke zoveelste kaart is een dubbelronde met een zwaardere straf. */
const DOUBLE_EVERY = 6;

const game = getPartyGame('meest')!;

const RULES = [
  'Lees de kaart hardop voor. Wie in de groep zou dit het eerst doen?',
  'Tel samen af: drie, twee, één. Op WIJS wijst iedereen tegelijk iemand aan.',
  'Wie de meeste vingers krijgt, krijgt de straf. Elke zesde kaart is een dubbelronde.',
];

type Phase = 'intro' | 'play';

export default function MeestScreen() {
  const level = usePartyStore((s) => s.level);
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const seenIds = usePartyStore((s) => s.seen[GAME_KEY] ?? []);
  const markSeen = usePartyStore((s) => s.markSeen);
  const resetSeen = usePartyStore((s) => s.resetSeen);

  const [phase, setPhase] = useState<Phase>('intro');
  const [card, setCard] = useState<DeckItem | null>(null);
  /** Aantal kaarten dat deze speelbeurt is getrokken (voor de dubbelronde). */
  const [round, setRound] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pointed, setPointed] = useState(false);
  const [penaltyText, setPenaltyText] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);

  const deck = useMemo(() => filterByLevel(meestDeck, level), [level]);
  const deckIds = useMemo(() => new Set(deck.map((it) => it.id)), [deck]);
  const seenCount = seenIds.filter((id) => deckIds.has(id)).length;

  const isDouble = round > 0 && round % DOUBLE_EVERY === 0;
  const overline = isDouble ? 'Dubbelronde · wie zou het eerst…' : 'Wie zou het eerst…';

  const drawCard = () => {
    const seen = usePartyStore.getState().seen[GAME_KEY] ?? [];
    const unseen = deck.filter((it) => !seen.includes(it.id));
    if (unseen.length === 0) {
      setCard(null);
      setExhausted(true);
      setPointed(false);
      setPenaltyText(null);
      return;
    }
    const next = drawNext(unseen, seen);
    if (!next) return;
    markSeen(GAME_KEY, next.id);
    setCard(next);
    setRound((r) => r + 1);
    setPointed(false);
    setPenaltyText(null);
  };

  const handleStart = () => {
    setRound(0);
    setExhausted(false);
    setShowCountdown(false);
    setPhase('play');
    drawCard();
  };

  const handleRestart = () => {
    // De store werkt synchroon bij, dus drawCard ziet de lege seen-lijst meteen.
    resetSeen(GAME_KEY);
    setRound(0);
    setExhausted(false);
    drawCard();
  };

  const handleStop = () => {
    setShowCountdown(false);
    setCard(null);
    setPointed(false);
    setPenaltyText(null);
    setExhausted(false);
    setPhase('intro');
  };

  const handleCountdownDone = () => {
    setShowCountdown(false);
    setPenaltyText(
      isDouble
        ? `Dubbelronde: ${penalty(drinkMode, 3)}`
        : `Meeste vingers? ${penalty(drinkMode, 2)}`
    );
    setPointed(true);
  };

  if (phase === 'intro') {
    return (
      <ScreenContainer>
        <PartyIntro game={game} rules={RULES} onStart={handleStart} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} showLevel />

      {exhausted ? (
        <View style={styles.done}>
          <Text style={styles.doneOverline}>Stapel leeg</Text>
          <Text style={styles.doneTitle}>Alle kaarten zijn geweest.</Text>
          <Text style={styles.doneSub}>
            {deck.length} kaarten op dit niveau. Schud de stapel en ga nog een rondje.
          </Text>
          <View style={styles.actions}>
            <Button title="Opnieuw" onPress={handleRestart} size="lg" />
            <Button title="Stoppen" onPress={handleStop} variant="ghost" size="md" />
          </View>
        </View>
      ) : card ? (
        <>
          <DeckCard
            cardKey={card.id}
            overline={overline}
            text={card.text}
            footer={penaltyText ?? undefined}
            accent={game.accent}
          />

          <Text style={styles.counter}>
            {seenCount} van {deck.length}
          </Text>

          <View style={styles.actions}>
            {pointed ? (
              <Button title="Volgende" onPress={drawCard} size="lg" />
            ) : (
              <Button
                title="3, 2, 1 — Wijs"
                onPress={() => setShowCountdown(true)}
                disabled={showCountdown}
                size="lg"
              />
            )}
            <Button title="Stoppen" onPress={handleStop} variant="ghost" size="md" />
          </View>
        </>
      ) : null}

      {showCountdown && (
        <Countdown finalWord="WIJS" color={game.accent} onDone={handleCountdownDone} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  counter: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  actions: {
    marginTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  done: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  doneOverline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  doneTitle: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  doneSub: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
});

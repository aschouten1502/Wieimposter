import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { DeckCard } from '@/components/party/DeckCard';
import { IconEye, IconHeart } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { getPartyGame } from '@/data/games';
import { waarheidDeck } from '@/data/party/waarheid';
import { opdrachtDeck } from '@/data/party/opdracht';
import { usePartyStore } from '@/store/partyStore';
import { drawNext, filterByLevel, penalty, penaltyVerb } from '@/utils/party';
import { fitFontSize, shuffleArray } from '@/utils/helpers';
import { useHaptics } from '@/hooks/useHaptics';
import type { DeckItem } from '@/types/party';

const game = getPartyGame('doe-of-drink')!;

type Phase = 'intro' | 'choose' | 'card';
type Stack = 'waarheid' | 'opdracht';

const DECKS: Record<Stack, DeckItem[]> = {
  waarheid: waarheidDeck,
  opdracht: opdrachtDeck,
};

const STACK_LABEL: Record<Stack, string> = {
  waarheid: 'Waarheid',
  opdracht: 'Opdracht',
};

/** Elke vierde beurt kiest niet de speler zelf, maar de rest van de tafel. */
const GROUP_EVERY = 4;

export default function WaarheidOfOpdrachtScreen() {
  const router = useRouter();
  const haptics = useHaptics();

  const playerNames = usePartyStore((s) => s.playerNames);
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const level = usePartyStore((s) => s.level);
  const seen = usePartyStore((s) => s.seen);
  const markSeen = usePartyStore((s) => s.markSeen);
  const resetSeen = usePartyStore((s) => s.resetSeen);

  const [phase, setPhase] = useState<Phase>('intro');
  const [order, setOrder] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [turn, setTurn] = useState(1);
  const [stack, setStack] = useState<Stack>('waarheid');
  const [item, setItem] = useState<DeckItem | null>(null);

  const currentName = order[pos] ?? playerNames[0] ?? '';
  const colorIndex = Math.max(0, playerNames.indexOf(currentName));
  const playerColor = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
  const groupChooses = turn % GROUP_EVERY === 0;

  // Straf één keer per kaart bepalen, anders wisselt de opdracht-straf bij elke render.
  const refuseText = useMemo(
    () => `Geweigerd — ${penalty(drinkMode, 3)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item?.id, drinkMode]
  );

  const start = () => {
    setOrder(shuffleArray(playerNames));
    setPos(0);
    setTurn(1);
    setItem(null);
    setPhase('choose');
  };

  const draw = (kind: Stack, seenIds: string[]) => {
    const pool = filterByLevel(DECKS[kind], level);
    const unseen = pool.filter((it) => !seenIds.includes(it.id));
    if (unseen.length === 0) {
      setItem(null);
      return;
    }
    const next = drawNext(unseen, seenIds);
    if (next) markSeen(kind, next.id);
    setItem(next);
  };

  const choose = (kind: Stack) => {
    haptics.light();
    setStack(kind);
    draw(kind, seen[kind] ?? []);
    setPhase('card');
  };

  const restartStack = () => {
    haptics.light();
    resetSeen(stack);
    draw(stack, []);
  };

  const nextTurn = () => {
    haptics.medium();
    let nextPos = pos + 1;
    if (nextPos >= order.length) {
      setOrder(shuffleArray(playerNames));
      nextPos = 0;
    }
    setPos(nextPos);
    setTurn((t) => t + 1);
    setItem(null);
    setPhase('choose');
  };

  const stop = () => router.replace('/');

  if (phase === 'intro') {
    return (
      <ScreenContainer>
        <PartyIntro
          game={game}
          rules={[
            'Om de beurt kies je een kaart: waarheid of opdracht. Wat erop staat, doe je.',
            `Weigeren mag, maar dan ${penaltyVerb(drinkMode)}.`,
            'Elke vierde beurt kiest niet de speler maar de groep.',
          ]}
          onStart={start}
        />
      </ScreenContainer>
    );
  }

  if (phase === 'choose') {
    const nameSize = fitFontSize(currentName, { max: 56, min: 28, maxChars: 10, lines: 2 });
    return (
      <ScreenContainer>
        <PartyHeader title={game.name} showLevel />

        <View style={styles.body}>
          <View style={styles.who}>
            <Text style={[styles.overline, groupChooses && { color: game.accent }]}>
              {groupChooses ? 'De groep kiest' : 'Aan de beurt'}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.playerName,
                { color: playerColor, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.15) },
              ]}
            >
              {currentName}
            </Text>
            <Text style={styles.hint}>
              {groupChooses ? 'De rest van de tafel beslist voor je.' : `Beurt ${turn} · kies zelf`}
            </Text>
          </View>

          <View style={styles.choices}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => choose('waarheid')} style={styles.choice}>
              <View style={styles.choiceIcon}>
                <IconEye size={34} color={Colors.primary} />
              </View>
              <Text style={styles.choiceLabel}>Waarheid</Text>
              <Text style={styles.choiceSub}>Een vraag, eerlijk antwoord</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => choose('opdracht')}
              style={[styles.choice, { borderColor: game.accent + '80' }]}
            >
              <View style={[styles.choiceIcon, { borderColor: game.accent + '66' }]}>
                <IconHeart size={34} color={game.accent} />
              </View>
              <Text style={[styles.choiceLabel, { color: game.accent }]}>Opdracht</Text>
              <Text style={styles.choiceSub}>Iets doen, hier en nu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Stoppen" onPress={stop} variant="ghost" size="md" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} showLevel />

      {item ? (
        <>
          <DeckCard cardKey={item.id} overline={STACK_LABEL[stack]} text={item.text} accent={game.accent} />
          <View style={styles.footer}>
            <Button title="GEDAAN" onPress={nextTurn} size="lg" />
            <Button title={refuseText} onPress={nextTurn} variant="secondary" size="md" style={styles.refuse} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.empty}>
            <Text style={[styles.emptyOverline, { color: game.accent }]}>{STACK_LABEL[stack]}</Text>
            <Text style={styles.emptyTitle}>Deze stapel is leeg.</Text>
            <Text style={styles.emptyText}>Alle kaarten op dit niveau zijn voorbijgekomen.</Text>
          </View>
          <View style={styles.footer}>
            <Button title="OPNIEUW" onPress={restartStack} size="lg" />
            <Button title="Terug" onPress={() => setPhase('choose')} variant="ghost" size="md" style={styles.refuse} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  who: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
    fontVariant: ['lining-nums'],
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
  choices: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  choice: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  choiceIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  choiceLabel: {
    color: Colors.text,
    fontFamily: Fonts.sansBold,
    fontSize: FontSize.sm,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  choiceSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 17,
  },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  refuse: {
    marginTop: Spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyOverline: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: FontSize.xxl,
    lineHeight: 38,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 23,
  },
});

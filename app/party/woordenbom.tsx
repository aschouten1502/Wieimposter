import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Reanimated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Medallion, OrnamentDivider } from '@/components/Ornaments';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { CategoryIcons, IconBomb, IconCards } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize } from '@/constants/theme';
import { getPartyGame } from '@/data/games';
import { categories } from '@/data/categories';
import { Category } from '@/types/game';
import { usePartyStore } from '@/store/partyStore';
import { useHaptics } from '@/hooks/useHaptics';
import { penalty, penaltyVerb } from '@/utils/party';

const game = getPartyGame('woordenbom')!;

type Phase = 'intro' | 'armed' | 'boom';

interface Round {
  id: number;
  category: Category;
  /** Kettingronde: elk woord begint met de laatste letter van het vorige. */
  chain: boolean;
  fuseMs: number;
}

const FUSE_MIN_MS = 20_000;
const FUSE_MAX_MS = 50_000;
/** Vanaf zoveel ms voor de knal tikt de bom sneller en trilt de telefoon. */
const HURRY_MS = 5_000;
const CHAIN_CHANCE = 0.25;

function newRound(prev: Round | null): Round {
  let category = categories[Math.floor(Math.random() * categories.length)];
  if (prev && categories.length > 1 && category.id === prev.category.id) {
    category = categories[(categories.indexOf(category) + 1) % categories.length];
  }
  return {
    id: (prev?.id ?? 0) + 1,
    category,
    chain: Math.random() < CHAIN_CHANCE,
    fuseMs: FUSE_MIN_MS + Math.random() * (FUSE_MAX_MS - FUSE_MIN_MS),
  };
}

export default function WoordenbomScreen() {
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const haptics = useHaptics();

  // Refs zodat de timers altijd de actuele haptics/drankmodus zien zonder te herstarten.
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const drinkRef = useRef(drinkMode);
  drinkRef.current = drinkMode;

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState<Round | null>(null);
  const [hurry, setHurry] = useState(false);
  const [boomPenalty, setBoomPenalty] = useState('');
  const scale = useRef(new Animated.Value(1)).current;

  const arm = () => {
    setRound((r) => newRound(r));
    setHurry(false);
    setPhase('armed');
    haptics.medium();
  };

  const stop = () => {
    setHurry(false);
    setPhase('intro');
  };

  // De lont: één timer voor de eindsprint (tikjes elke seconde), één voor de knal.
  useEffect(() => {
    if (phase !== 'armed' || !round) return;

    let tick: ReturnType<typeof setInterval> | undefined;
    const hurryTimer = setTimeout(() => {
      setHurry(true);
      hapticsRef.current.light();
      tick = setInterval(() => hapticsRef.current.light(), 1000);
    }, Math.max(0, round.fuseMs - HURRY_MS));

    const boomTimer = setTimeout(() => {
      hapticsRef.current.heavy();
      setBoomPenalty(penalty(drinkRef.current, 3));
      setPhase('boom');
    }, round.fuseMs);

    return () => {
      clearTimeout(hurryTimer);
      clearTimeout(boomTimer);
      if (tick) clearInterval(tick);
    };
  }, [phase, round]);

  // Pulserende bom: rustig tikken, in de laatste seconden sneller.
  useEffect(() => {
    if (phase !== 'armed') {
      scale.setValue(1);
      return;
    }
    const half = (hurry ? 300 : 700) / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, hurry, scale]);

  if (phase === 'intro' || !round) {
    return (
      <ScreenContainer>
        <PartyIntro
          game={game}
          rules={[
            'De telefoon noemt een categorie en de bom begint te tikken.',
            'Noem een woord dat erbij past en geef de telefoon meteen door.',
            `Gaat de bom af terwijl jij hem vasthoudt? Dan ${penaltyVerb(drinkMode)}.`,
          ]}
          onStart={arm}
        />
      </ScreenContainer>
    );
  }

  if (phase === 'boom') {
    return (
      <ScreenContainer>
        <View pointerEvents="none" style={styles.boomTint} />
        <PartyHeader title={game.name} />

        <View style={styles.body}>
          <Reanimated.View entering={ZoomIn.duration(320)}>
            <Medallion size={132}>
              <IconBomb size={52} color={Colors.imposter} />
            </Medallion>
          </Reanimated.View>
          <Reanimated.Text entering={FadeIn.duration(300).delay(120)} style={styles.boomTitle}>
            BOEM.
          </Reanimated.Text>
          <Reanimated.Text entering={FadeIn.duration(300).delay(260)} style={styles.subtitle}>
            Bij wie ging hij af? {boomPenalty}.
          </Reanimated.Text>
        </View>

        <View style={styles.actions}>
          <Button title="NOG EEN RONDE" onPress={arm} size="lg" />
          <Button title="Stoppen" onPress={stop} variant="ghost" size="md" />
        </View>
      </ScreenContainer>
    );
  }

  const CatIcon = CategoryIcons[round.category.icon] ?? IconCards;

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} />

      <Reanimated.View key={round.id} entering={FadeIn.duration(320)} style={styles.body}>
        <Medallion size={96}>
          <CatIcon size={34} color={Colors.primary} />
        </Medallion>
        <Text style={[styles.overline, { color: game.accent }]}>
          {round.chain ? 'Kettingronde · Noem iets uit' : 'Noem iets uit'}
        </Text>
        <Text style={styles.category}>{round.category.name}</Text>
        <Text style={styles.subtitle}>
          {round.chain
            ? 'Elk woord moet beginnen met de laatste letter van het vorige.'
            : 'Zeg een woord en geef door.'}
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Animated.View style={{ transform: [{ scale }] }}>
          <Medallion size={168}>
            <IconBomb size={72} color={game.accent} />
          </Medallion>
        </Animated.View>
      </Reanimated.View>

      <View style={styles.actions}>
        <Button title="Stoppen" onPress={stop} variant="ghost" size="md" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  category: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  divider: {
    marginVertical: Spacing.xl,
    marginHorizontal: Spacing.xxl,
  },
  boomTint: {
    position: 'absolute',
    top: -120,
    bottom: 0,
    left: -Spacing.lg,
    right: -Spacing.lg,
    backgroundColor: Colors.imposter,
    opacity: 0.18,
  },
  boomTitle: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 96,
    lineHeight: 104,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Medallion, OrnamentDivider } from '@/components/Ornaments';
import { PartyIntro } from '@/components/party/PartyIntro';
import { PartyHeader } from '@/components/party/PartyHeader';
import { Countdown } from '@/components/party/Countdown';
import { IconArrows } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { getPartyGame } from '@/data/games';
import { usePartyStore } from '@/store/partyStore';
import { penalty, penaltyVerb } from '@/utils/party';

const game = getPartyGame('links-rechts')!;

type Phase = 'intro' | 'ready' | 'countdown' | 'result';

/** Twaalf extra regels. Functies, zodat de straf ook zonder drankmodus klopt. */
const TWISTS: Array<(drinkMode: boolean) => string> = [
  (d) => `Omhoog of omlaag kijken telt ook. Dan ${penaltyVerb(d)}.`,
  () => 'Kijk je jezelf in een spiegel of raam aan? Dubbel.',
  (d) => `Lach je als eerste na het draaien? Dan ${penaltyVerb(d)}.`,
  () => 'Deze ronde draait iedereen twee keer: eerst links, dan rechts.',
  (d) => `Omgekeerde ronde: kijk je niemand aan, dan ${penaltyVerb(d)}.`,
  (d) => `Ogen open vóór het eindwoord? ${penalty(d, 1)}.`,
  () => 'Kijk je iemand aan? Wie het eerst wegkijkt, krijgt dubbel.',
  () => 'Kijk je je buurman of buurvrouw aan? Dubbel. De overkant telt enkel.',
  (d) => `Te laat gedraaid? Dan ${penaltyVerb(d)}, aangekeken of niet.`,
  (d) => `Stille ronde: praat je na het draaien? Dan ${penaltyVerb(d)}.`,
  () => 'Kijk je iemand aan? Jullie ruilen van plek voor de volgende ronde.',
  (d) => `Grote ronde: kijk je iemand aan? ${penalty(d, 3)}, allebei.`,
];

interface Twist {
  index: number;
  text: string;
}

function pickTwist(drinkMode: boolean, avoid: number): Twist {
  let index = Math.floor(Math.random() * TWISTS.length);
  if (TWISTS.length > 1 && index === avoid) index = (index + 1) % TWISTS.length;
  return { index, text: TWISTS[index](drinkMode) };
}

export default function LinksRechtsScreen() {
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [twist, setTwist] = useState<Twist>({ index: -1, text: '' });
  const [resultPenalty, setResultPenalty] = useState('');

  const startRound = (next: number) => {
    setTwist((t) => pickTwist(drinkMode, t.index));
    setRound(next);
    setPhase('ready');
  };

  const finishCountdown = () => {
    setResultPenalty(penalty(drinkMode, 2).toLowerCase());
    setPhase('result');
  };

  if (phase === 'intro') {
    return (
      <ScreenContainer>
        <PartyIntro
          game={game}
          rules={[
            'Iedereen zit in een kring en doet de ogen dicht.',
            'Op drie draait iedereen het hoofd naar links of naar rechts.',
            `Kijk je iemand recht aan? Dan ${penaltyVerb(drinkMode)}, en die ander ook.`,
          ]}
          onStart={() => startRound(1)}
        />
      </ScreenContainer>
    );
  }

  const isResult = phase === 'result';

  return (
    <ScreenContainer>
      <PartyHeader title={game.name} />

      <Animated.View
        key={`${isResult ? 'result' : 'ready'}-${round}`}
        entering={FadeIn.duration(320)}
        style={styles.body}
      >
        <Text style={styles.round}>Ronde {round}</Text>

        <Medallion size={120}>
          <IconArrows size={44} color={game.accent} />
        </Medallion>

        {isResult ? (
          <>
            <Text style={styles.title}>Kijk je iemand aan?</Text>
            <Text style={styles.subtitle}>Dan {resultPenalty} — allebei.</Text>

            <OrnamentDivider style={styles.divider} />
            <Text style={styles.smallLabel}>Extra regel</Text>
            <Text style={styles.smallText}>{twist.text}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Ogen dicht.</Text>
            <Text style={styles.subtitle}>
              Hoofd nog recht vooruit. Op het eindwoord draait iedereen tegelijk.
            </Text>

            <View style={styles.twistCard}>
              <Text style={[styles.twistLabel, { color: game.accent }]}>Extra regel deze ronde</Text>
              <Text style={styles.twistText}>{twist.text}</Text>
            </View>
          </>
        )}
      </Animated.View>

      <View style={styles.actions}>
        {isResult ? (
          <>
            <Button title="NOG EEN RONDE" onPress={() => startRound(round + 1)} size="lg" />
            <Button title="Stoppen" onPress={() => setPhase('intro')} variant="ghost" size="md" />
          </>
        ) : (
          <Button
            title="TEL AF"
            onPress={() => setPhase('countdown')}
            disabled={phase === 'countdown'}
            size="lg"
          />
        )}
      </View>

      {phase === 'countdown' && (
        <Countdown finalWord="KIJK" color={game.accent} onDone={finishCountdown} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: Spacing.lg,
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
  twistCard: {
    alignSelf: 'stretch',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  twistLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  twistText: {
    color: Colors.text,
    fontFamily: Fonts.sansMedium,
    fontSize: FontSize.md,
    lineHeight: 23,
    textAlign: 'center',
  },
  divider: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.xxl,
  },
  smallLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  smallText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});

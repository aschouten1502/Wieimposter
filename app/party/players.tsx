import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PlayerInput } from '@/components/PlayerInput';
import { Stepper } from '@/components/Stepper';
import { PartyHeader } from '@/components/party/PartyHeader';
import { Colors, Fonts, Spacing, FontSize } from '@/constants/theme';
import { usePartyStore } from '@/store/partyStore';

const MIN = 2;
const MAX = 12;

/** Gedeelde spelersinvoer voor alle party-spellen die namen nodig hebben. */
export default function PartyPlayersScreen() {
  const router = useRouter();
  const saved = usePartyStore((s) => s.playerNames);
  const setPlayerNames = usePartyStore((s) => s.setPlayerNames);

  const initial = saved.length >= MIN ? saved : Array.from({ length: 4 }, (_, i) => saved[i] ?? `Speler ${i + 1}`);
  const [names, setNames] = useState<string[]>(initial);

  const setCount = (count: number) => {
    setNames((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, (_, i) => `Speler ${prev.length + i + 1}`)];
      }
      return prev.slice(0, count);
    });
  };

  const handleSave = () => {
    // Lege namen krijgen een standaardnaam; dubbele namen krijgen een nummer.
    const seen = new Map<string, number>();
    const clean = names.map((n, i) => {
      const base = n.trim() || `Speler ${i + 1}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base} ${count + 1}`;
    });
    setPlayerNames(clean);
    router.back();
  };

  return (
    <ScreenContainer>
      <PartyHeader title="Spelers" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Wie speelt er mee?</Text>
        <Text style={styles.sub}>Eén keer invullen — geldt voor alle spellen.</Text>

        <Stepper label="Aantal spelers" value={names.length} min={MIN} max={MAX} onChange={setCount} />

        <View style={styles.list}>
          {names.map((name, i) => (
            <PlayerInput
              key={i}
              index={i}
              value={name}
              onChange={(text) => setNames((prev) => prev.map((n, j) => (j === i ? text : n)))}
              onRemove={() => setCount(names.length - 1)}
              showRemove={names.length > MIN && i === names.length - 1}
            />
          ))}
        </View>

        <Button title="Opslaan" onPress={handleSave} size="lg" style={styles.save} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 36,
    lineHeight: 42,
    marginTop: Spacing.sm,
  },
  sub: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  list: { marginTop: Spacing.lg, gap: Spacing.sm },
  save: { marginTop: Spacing.xl },
});

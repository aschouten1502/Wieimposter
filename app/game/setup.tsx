import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Stepper } from '@/components/Stepper';
import { PlayerInput } from '@/components/PlayerInput';
import { CategoryCard } from '@/components/CategoryCard';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { MIN_PLAYERS, MAX_PLAYERS } from '@/constants/config';
import { categories } from '@/data/categories';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getMaxImposters } from '@/utils/helpers';

export default function SetupScreen() {
  const router = useRouter();
  const initGame = useGameStore((s) => s.initGame);
  const defaultPlayerCount = useSettingsStore((s) => s.playerCount);
  const [playerCount, setPlayerCount] = useState(defaultPlayerCount);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: defaultPlayerCount }, (_, i) => `Speler ${i + 1}`)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('eten');
  const [impostersCount, setImpostersCount] = useState(1);

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayerCount(count);
    setPlayerNames((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, (_, i) => `Speler ${prev.length + i + 1}`)];
      }
      return prev.slice(0, count);
    });
    const maxImp = getMaxImposters(count);
    if (impostersCount > maxImp) {
      setImpostersCount(maxImp);
    }
  }, [impostersCount]);

  const handleNameChange = useCallback((index: number, text: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  }, []);

  const handleStart = () => {
    // Validate names
    const names = playerNames.map((n, i) => n.trim() || `Speler ${i + 1}`);

    // Check for duplicates and fix
    const seen = new Set<string>();
    const uniqueNames = names.map((name) => {
      let finalName = name;
      let counter = 2;
      while (seen.has(finalName)) {
        finalName = `${name} ${counter}`;
        counter++;
      }
      seen.add(finalName);
      return finalName;
    });

    initGame(uniqueNames, selectedCategory, impostersCount, false);
    router.replace('/game/pass');
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Nieuw Spel</Text>

        <Stepper
          label="Aantal Spelers"
          value={playerCount}
          min={MIN_PLAYERS}
          max={MAX_PLAYERS}
          onChange={handlePlayerCountChange}
        />

        <Text style={styles.sectionLabel}>Spelersnamen</Text>
        {playerNames.map((name, index) => (
          <PlayerInput
            key={index}
            index={index}
            value={name}
            onChange={(text) => handleNameChange(index, text)}
          />
        ))}

        <Text style={styles.sectionLabel}>Categorie</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <CategoryCard
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={setSelectedCategory}
              />
            </View>
          ))}
        </View>

        <Stepper
          label="Aantal Imposters"
          value={impostersCount}
          min={1}
          max={getMaxImposters(playerCount)}
          onChange={setImpostersCount}
        />

        <View style={styles.startButton}>
          <Button title="START SPEL" onPress={handleStart} size="lg" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryItem: {
    width: '48%',
  },
  startButton: {
    marginTop: Spacing.xl,
  },
});

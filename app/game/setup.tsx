import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Stepper } from '@/components/Stepper';
import { PlayerInput } from '@/components/PlayerInput';
import { CategoryCard } from '@/components/CategoryCard';
import { OrnamentDivider } from '@/components/Ornaments';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['eten']);
  const [impostersCount, setImpostersCount] = useState(1);
  const [trollMode, setTrollMode] = useState(false);

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

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleStart = () => {
    const names = playerNames.map((n, i) => n.trim() || `Speler ${i + 1}`);

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

    initGame(uniqueNames, selectedCategories, impostersCount, trollMode);
    router.replace('/game/pass');
  };

  const totalWords = selectedCategories.reduce((sum, id) => {
    const cat = categories.find((c) => c.id === id);
    return sum + (cat?.words.length ?? 0);
  }, 0);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerBlock}>
          <Text style={styles.overline}>Nieuwe ronde</Text>
          <Text style={styles.header}>Nieuw spel</Text>
        </View>

        <Stepper
          label="Aantal spelers"
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

        <View style={styles.categoryHeader}>
          <Text style={styles.sectionLabel}>Categorieën</Text>
          <Text style={styles.categoryCount}>
            {selectedCategories.length} geselecteerd · {totalWords} woorden
          </Text>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <CategoryCard
                category={cat}
                selected={selectedCategories.includes(cat.id)}
                onPress={toggleCategory}
              />
            </View>
          ))}
        </View>

        <Stepper
          label="Aantal imposters"
          value={impostersCount}
          min={1}
          max={getMaxImposters(playerCount)}
          onChange={setImpostersCount}
        />

        <View style={[styles.trollRow, Platform.OS === 'web' && (GlassStyle as any)]}>
          <View style={styles.trollInfo}>
            <Text style={styles.trollLabel}>Trollmodus</Text>
            <Text style={styles.trollDesc}>Kans dat iedereen imposter is</Text>
          </View>
          <Button
            title={trollMode ? 'AAN' : 'UIT'}
            onPress={() => setTrollMode(!trollMode)}
            variant={trollMode ? 'primary' : 'secondary'}
            size="sm"
            fullWidth={false}
            style={styles.trollButton}
          />
        </View>

        <OrnamentDivider style={styles.divider} />

        <View style={styles.startButton}>
          <Button title="Start het spel" onPress={handleStart} size="lg" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  headerBlock: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  header: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontSize: 42,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  categoryCount: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
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
  trollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  trollInfo: {
    flex: 1,
  },
  trollLabel: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: 15,
  },
  trollDesc: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginTop: 3,
  },
  trollButton: {
    width: 84,
  },
  divider: {
    marginTop: Spacing.xl,
  },
  startButton: {
    marginTop: Spacing.xl,
  },
});

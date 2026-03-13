import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer centered>
      <View style={styles.logoContainer}>
        <Text style={styles.emoji}>🕵️</Text>
        <Text style={styles.title}>WHO'S THE</Text>
        <Text style={styles.titleAccent}>IMPOSTER</Text>
        <Text style={styles.subtitle}>De ultieme party game</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="SPEEL"
          onPress={() => router.push('/game/setup')}
          size="lg"
        />
        <View style={styles.buttonRow}>
          <Button
            title="Uitleg"
            onPress={() => router.push('/how-to-play')}
            variant="secondary"
            size="md"
            style={styles.halfButton}
          />
          <Button
            title="Categorieën"
            onPress={() => router.push('/categories')}
            variant="secondary"
            size="md"
            style={styles.halfButton}
          />
        </View>
        <Button
          title="Instellingen"
          onPress={() => router.push('/settings')}
          variant="ghost"
          size="sm"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: FontSize.xxl,
    fontWeight: '300',
    letterSpacing: 6,
  },
  titleAccent: {
    color: Colors.primary,
    fontSize: FontSize.display,
    fontWeight: '900',
    letterSpacing: 6,
    marginTop: -4,
    textShadowColor: Colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: Spacing.md,
    letterSpacing: 2,
  },
  buttons: {
    width: '100%',
    gap: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});

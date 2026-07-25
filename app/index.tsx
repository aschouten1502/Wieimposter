import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Medallion, OrnamentDivider } from '@/components/Ornaments';
import { IconMask } from '@/components/icons';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer centered>
      <View style={styles.brand}>
        <Medallion size={116}>
          <IconMask size={46} color={Colors.primary} />
        </Medallion>
        <Text style={styles.overline}>HET GEZELSCHAPSSPEL</Text>
        <Text style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
          IMPOSTER
        </Text>
        <OrnamentDivider style={styles.divider} />
        <Text style={styles.tagline}>Wie bluft er aan tafel?</Text>
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
  brand: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  overline: {
    marginTop: Spacing.xl,
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: Spacing.sm,
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  divider: {
    alignSelf: 'center',
    width: 220,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  tagline: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 15,
    letterSpacing: 1,
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

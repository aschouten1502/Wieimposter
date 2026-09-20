import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { CornerFrame, PatternBackdrop } from '@/components/Ornaments';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { fitFontSize } from '@/utils/helpers';

interface DeckCardProps {
  /** Unieke sleutel zodat elke nieuwe kaart in-animeert. */
  cardKey: string;
  overline: string;
  text: string;
  /** Kleine regel onder de tekst, bv. de straf. */
  footer?: string;
  accent?: string;
  /** Tik op de kaart = volgende. */
  onPress?: () => void;
}

/**
 * De grote kaart in het midden van een party-spel. Tekst schaalt mee zodat
 * ook lange stellingen nooit worden afgekapt.
 */
export function DeckCard({ cardKey, overline, text, footer, accent = Colors.primary, onPress }: DeckCardProps) {
  const fontSize = fitFontSize(text, { max: 34, min: 20, maxChars: 16, lines: 5 });

  return (
    <Animated.View
      key={cardKey}
      entering={FadeInRight.duration(320)}
      exiting={FadeOutLeft.duration(200)}
      style={styles.wrap}
    >
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} disabled={!onPress} style={styles.card}>
        <PatternBackdrop opacity={0.03} />
        <View pointerEvents="none" style={styles.innerFrame} />
        <CornerFrame inset={16} size={14} />

        <Text style={[styles.overline, { color: accent }]}>{overline}</Text>
        <Text style={[styles.text, { fontSize, lineHeight: Math.round(fontSize * 1.28) }]}>{text}</Text>
        {footer ? (
          <>
            <View style={[styles.hairline, { backgroundColor: accent }]} />
            <Text style={styles.footer}>{footer}</Text>
          </>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  card: {
    minHeight: 360,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.inkDeep,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerFrame: {
    ...StyleSheet.absoluteFillObject,
    margin: 10,
    borderRadius: BorderRadius.xxl - 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  overline: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  text: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  hairline: {
    width: 48,
    height: 1,
    opacity: 0.7,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  footer: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

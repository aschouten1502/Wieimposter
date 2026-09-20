import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

interface CountdownProps {
  /** Vanaf welk getal (standaard 3). */
  from?: number;
  /** Tekst die na de laatste tel verschijnt, bv. "WIJS!" of "KIJK!". */
  finalWord: string;
  /** Aangeroepen kort nadat het eindwoord getoond is. */
  onDone: () => void;
  /** Kleur van de cijfers/het eindwoord. */
  color?: string;
}

/**
 * Fullscreen aftelling: 3 — 2 — 1 — [eindwoord]. Elke tel geeft een haptic.
 * Wordt over het scherm gelegd door de aanroeper (absolute fill).
 */
export function Countdown({ from = 3, finalWord, onDone, color = Colors.primary }: CountdownProps) {
  const haptics = useHaptics();
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count > 0) {
      haptics.medium();
      const t = setTimeout(() => setCount((c) => c - 1), 850);
      return () => clearTimeout(t);
    }
    haptics.heavy();
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.Text
        key={count}
        entering={ZoomIn.duration(260)}
        exiting={FadeOut.duration(150)}
        style={[styles.text, { color }, count === 0 && styles.final]}
      >
        {count > 0 ? String(count) : finalWord}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 16, 16, 0.86)',
    zIndex: 50,
  },
  text: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 160,
    lineHeight: 176,
    textAlign: 'center',
  },
  final: {
    fontSize: 64,
    lineHeight: 74,
    letterSpacing: 4,
    fontFamily: Fonts.sansExtra,
  },
});

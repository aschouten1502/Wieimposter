import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { Colors } from '@/constants/theme';

/**
 * Dunne gouden haarlijn met een klein geroteerd vierkant (ruit) in het midden.
 */
export function OrnamentDivider({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.dividerRow, style]}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerDiamond} />
      <View style={styles.dividerLine} />
    </View>
  );
}

interface CornerFrameProps {
  inset?: number;
  size?: number;
}

/**
 * Vier dunne L-vormige hoekstreepjes in goud, absoluut gepositioneerd.
 * Bedoeld voor hero-kaarten; de parent moet position relative hebben.
 */
export function CornerFrame({ inset = 10, size = 18 }: CornerFrameProps) {
  const corner = { width: size, height: size };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.corner, styles.cornerTL, corner, { top: inset, left: inset }]} />
      <View style={[styles.corner, styles.cornerTR, corner, { top: inset, right: inset }]} />
      <View style={[styles.corner, styles.cornerBL, corner, { bottom: inset, left: inset }]} />
      <View style={[styles.corner, styles.cornerBR, corner, { bottom: inset, right: inset }]} />
    </View>
  );
}

interface PatternBackdropProps {
  opacity?: number;
}

/**
 * Full-bleed ruit-raster in goud, nauwelijks zichtbaar. Absoluut gevuld,
 * pointerEvents none — leg dit achter de inhoud.
 */
export function PatternBackdrop({ opacity = 0.035 }: PatternBackdropProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="tempel-ruit" width={28} height={28} patternUnits="userSpaceOnUse">
            <Path
              d="M14 0 L28 14 L14 28 L0 14 Z"
              stroke={Colors.primary}
              strokeWidth={1}
              fill="none"
            />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#tempel-ruit)" />
      </Svg>
    </View>
  );
}

interface MedallionProps {
  size?: number;
  children?: React.ReactNode;
}

/**
 * Icoon gecentreerd binnen twee 45 graden geroteerde vierkante omlijningen
 * (concentrische ruiten) in gouden haarlijnen.
 */
export function Medallion({ size = 96, children }: MedallionProps) {
  const outer = size / Math.SQRT2;
  const inner = outer * 0.78;
  return (
    <View style={[styles.medallion, { width: size, height: size }]}>
      <View
        pointerEvents="none"
        style={[
          styles.medallionSquare,
          {
            width: outer,
            height: outer,
            borderColor: Colors.goldLine,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.medallionSquare,
          {
            width: inner,
            height: inner,
            borderColor: Colors.primaryGlow,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.goldLine,
  },
  dividerDiamond: {
    width: 7,
    height: 7,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  corner: {
    position: 'absolute',
    borderColor: Colors.primary,
    opacity: 0.5,
  },
  cornerTL: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  cornerTR: {
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  cornerBL: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  cornerBR: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  medallion: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionSquare: {
    position: 'absolute',
    borderWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
});

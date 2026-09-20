import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconChevronLeft, IconGlass, IconFlame } from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { usePartyStore } from '@/store/partyStore';
import { LEVEL_LABEL } from '@/types/party';

interface PartyHeaderProps {
  title: string;
  /** Toon de niveau-pil (alleen voor spellen met niveaus). */
  showLevel?: boolean;
  /** Terug naar de hub in plaats van router.back(). */
  onBack?: () => void;
}

/** Vaste kopregel voor party-spellen: terug, spelnaam en de actieve instellingen. */
export function PartyHeader({ title, showLevel = false, onBack }: PartyHeaderProps) {
  const router = useRouter();
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const level = usePartyStore((s) => s.level);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.replace('/'))}
        style={styles.back}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconChevronLeft size={16} color={Colors.textSecondary} />
        <Text style={styles.backText}>Hub</Text>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.pills}>
        {showLevel && (
          <View style={styles.pill}>
            <IconFlame size={12} color={Colors.accent} />
            <Text style={styles.pillText}>{LEVEL_LABEL[level]}</Text>
          </View>
        )}
        <View style={[styles.pill, !drinkMode && styles.pillOff]}>
          <IconGlass size={12} color={drinkMode ? Colors.accent : Colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    minHeight: 36,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    minWidth: 64,
  },
  backText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    flex: 1,
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginHorizontal: Spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    gap: Spacing.xs,
    minWidth: 64,
    justifyContent: 'flex-end',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  pillOff: {
    borderColor: Colors.borderLight,
  },
  pillText: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

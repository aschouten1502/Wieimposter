import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';
import { fitFontSize } from '@/utils/helpers';

interface PlayerBadgeProps {
  name: string;
  index: number;
  selected?: boolean;
  onPress?: () => void;
  voteCount?: number;
  isImposter?: boolean;
  showRole?: boolean;
  disabled?: boolean;
}

export function PlayerBadge({
  name,
  index,
  selected,
  onPress,
  voteCount,
  isImposter,
  showRole,
  disabled,
}: PlayerBadgeProps) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

  const content = (
    <View
      style={[
        styles.badge,
        selected && styles.badgeSelected,
        disabled && styles.badgeDisabled,
        Platform.OS === 'web' && (GlassStyle as any),
      ]}
    >
      <View style={[styles.diamond, { backgroundColor: color }]} />
      <Text
        style={[styles.name, { fontSize: fitFontSize(name, { max: 17, min: 13, maxChars: showRole ? 14 : 20 }) }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      {showRole && isImposter !== undefined && (
        <Text style={[styles.role, isImposter ? styles.roleImposter : styles.roleCivilian]}>
          {isImposter ? 'IMPOSTER' : 'BURGER'}
        </Text>
      )}
      {voteCount !== undefined && voteCount > 0 && (
        <View style={styles.voteBadge}>
          <Text style={styles.voteCount}>{voteCount}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  badgeSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentGlow,
  },
  badgeDisabled: {
    opacity: 0.4,
  },
  diamond: {
    width: 10,
    height: 10,
    marginLeft: 2,
    marginRight: Spacing.md,
    transform: [{ rotate: '45deg' }],
  },
  name: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: 17,
    letterSpacing: 0.3,
    flex: 1,
  },
  role: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: Spacing.sm,
  },
  roleImposter: {
    color: Colors.imposter,
  },
  roleCivilian: {
    color: Colors.civilian,
  },
  voteBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  voteCount: {
    color: Colors.inkDeep,
    fontFamily: Fonts.sansExtra,
    fontSize: 13,
  },
});

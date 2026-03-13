import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { PLAYER_COLORS } from '@/constants/config';

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
    <View style={[styles.badge, selected && styles.badgeSelected, disabled && styles.badgeDisabled]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.name}>{name}</Text>
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  badgeDisabled: {
    opacity: 0.4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  role: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
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
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteCount: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});

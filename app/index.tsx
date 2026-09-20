import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Medallion, OrnamentDivider } from '@/components/Ornaments';
import {
  IconArrows,
  IconBomb,
  IconFlame,
  IconGear,
  IconGlass,
  IconHand,
  IconHeart,
  IconMask,
  IconUsers,
} from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { PARTY_GAMES } from '@/data/games';
import { PartyGame } from '@/types/party';
import { useHaptics } from '@/hooks/useHaptics';

const ICONS = {
  mask: IconMask,
  glass: IconGlass,
  hand: IconHand,
  flame: IconFlame,
  heart: IconHeart,
  arrows: IconArrows,
  bomb: IconBomb,
};

function GameCard({ game, index }: { game: PartyGame; index: number }) {
  const router = useRouter();
  const haptics = useHaptics();
  const Icon = ICONS[game.icon];

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(80 + index * 60)}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          haptics.light();
          router.push(game.route as never);
        }}
      >
        <View style={[styles.card, Platform.OS === 'web' && (GlassStyle as any)]}>
          <View style={[styles.iconTile, { borderColor: game.accent + '66' }]}>
            <Icon size={26} color={game.accent} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>{game.name}</Text>
            <Text style={styles.cardBlurb} numberOfLines={2}>
              {game.blurb}
            </Text>
            <View style={styles.metaRow}>
              <IconUsers size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{game.minPlayers}+ spelers</Text>
              {game.hasLevels && (
                <>
                  <View style={styles.metaDot} />
                  <IconFlame size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>Niveaus</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.brand}>
          <Medallion size={96}>
            <IconMask size={38} color={Colors.primary} />
          </Medallion>
          <Text style={styles.overline}>SPELLETJES VOOR AAN TAFEL</Text>
          <Text style={styles.title}>Speelavond</Text>
          <OrnamentDivider style={styles.divider} />
          <Text style={styles.tagline}>Kies een spel. De telefoon doet de rest.</Text>
        </View>

        <View style={styles.list}>
          {PARTY_GAMES.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </View>

        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settings}>
          <IconGear size={14} color={Colors.textMuted} />
          <Text style={styles.settingsText}>Instellingen</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  brand: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 52,
    lineHeight: 58,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  divider: { width: 200, marginTop: Spacing.md },
  tagline: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    marginTop: Spacing.md,
  },
  list: { gap: Spacing.sm + 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inkDeep,
  },
  cardBody: { flex: 1 },
  cardName: {
    color: Colors.text,
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 24,
    lineHeight: 28,
  },
  cardBlurb: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.sm },
  metaText: { color: Colors.textMuted, fontFamily: Fonts.sansSemi, fontSize: 11, letterSpacing: 0.5 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textMuted, marginHorizontal: 4 },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  settingsText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

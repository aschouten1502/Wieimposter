import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Medallion, OrnamentDivider } from '@/components/Ornaments';
import { LevelPicker } from '@/components/party/LevelPicker';
import { PartyHeader } from '@/components/party/PartyHeader';
import {
  IconArrows,
  IconBomb,
  IconFlame,
  IconGlass,
  IconHand,
  IconHeart,
  IconMask,
  IconUsers,
} from '@/components/icons';
import { Colors, Fonts, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { PartyGame } from '@/types/party';
import { usePartyStore } from '@/store/partyStore';

const ICONS = {
  mask: IconMask,
  glass: IconGlass,
  hand: IconHand,
  flame: IconFlame,
  heart: IconHeart,
  arrows: IconArrows,
  bomb: IconBomb,
};

interface PartyIntroProps {
  game: PartyGame;
  /** Korte spelregels, één zin per regel. */
  rules: string[];
  onStart: () => void;
}

/**
 * Het startscherm dat elk party-spel deelt: uitleg, niveau, drankmodus,
 * spelers en de startknop. Zo voelt elk spel hetzelfde aan.
 */
export function PartyIntro({ game, rules, onStart }: PartyIntroProps) {
  const router = useRouter();
  const Icon = ICONS[game.icon];
  const drinkMode = usePartyStore((s) => s.drinkMode);
  const setDrinkMode = usePartyStore((s) => s.setDrinkMode);
  const level = usePartyStore((s) => s.level);
  const setLevel = usePartyStore((s) => s.setLevel);
  const playerNames = usePartyStore((s) => s.playerNames);

  const enoughPlayers = !game.needsPlayers || playerNames.length >= game.minPlayers;

  return (
    <>
      <PartyHeader title={game.name} showLevel={game.hasLevels} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Medallion size={104}>
            <Icon size={38} color={game.accent} />
          </Medallion>
          <Text style={styles.title}>{game.name}</Text>
          <Text style={styles.tagline}>{game.tagline}</Text>
        </View>

        <View style={styles.rules}>
          {rules.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={[styles.ruleNumber, { color: game.accent }]}>{i + 1}</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <OrnamentDivider style={styles.divider} />

        {game.hasLevels && (
          <View style={styles.block}>
            <Text style={styles.label}>Hoe pittig</Text>
            <LevelPicker value={level} onChange={setLevel} />
          </View>
        )}

        <View style={styles.block}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTitleRow}>
                <IconGlass size={16} color={Colors.primary} />
                <Text style={styles.toggleTitle}>Drankmodus</Text>
              </View>
              <Text style={styles.toggleDesc}>
                {drinkMode ? 'Straf is slokken drinken' : 'Straf is een leuke opdracht'}
              </Text>
            </View>
            <Button
              title={drinkMode ? 'AAN' : 'UIT'}
              onPress={() => setDrinkMode(!drinkMode)}
              variant={drinkMode ? 'primary' : 'secondary'}
              size="sm"
              fullWidth={false}
              style={styles.toggleButton}
            />
          </View>
        </View>

        {game.needsPlayers && (
          <View style={styles.block}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/party/players')}>
              <View style={styles.playersRow}>
                <IconUsers size={18} color={Colors.primary} />
                <View style={styles.playersInfo}>
                  <Text style={styles.toggleTitle}>
                    {playerNames.length > 0 ? `${playerNames.length} spelers` : 'Nog geen spelers'}
                  </Text>
                  <Text style={styles.toggleDesc} numberOfLines={1}>
                    {playerNames.length > 0 ? playerNames.join(', ') : `Minimaal ${game.minPlayers} namen invullen`}
                  </Text>
                </View>
                <Text style={styles.playersLink}>WIJZIG</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.start}>
          <Button
            title={enoughPlayers ? 'Start' : 'Vul eerst namen in'}
            onPress={enoughPlayers ? onStart : () => router.push('/party/players')}
            size="lg"
            variant={enoughPlayers ? 'primary' : 'secondary'}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 40,
    lineHeight: 46,
    marginTop: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  rules: { gap: Spacing.md, paddingHorizontal: Spacing.xs },
  ruleRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  ruleNumber: {
    fontFamily: Fonts.display,
    fontVariant: ['lining-nums'],
    fontSize: 26,
    lineHeight: 28,
    width: 22,
  },
  ruleText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  divider: { marginVertical: Spacing.xl, marginHorizontal: Spacing.xl },
  block: { marginBottom: Spacing.lg },
  label: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  toggleInfo: { flex: 1 },
  toggleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  toggleTitle: { color: Colors.text, fontFamily: Fonts.sansSemi, fontSize: FontSize.md },
  toggleDesc: { color: Colors.textMuted, fontFamily: Fonts.sans, fontSize: 13, marginTop: 2 },
  toggleButton: { minWidth: 72 },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.goldLine,
    backgroundColor: Colors.glass,
  },
  playersInfo: { flex: 1 },
  playersLink: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
  },
  start: { marginTop: Spacing.md },
});

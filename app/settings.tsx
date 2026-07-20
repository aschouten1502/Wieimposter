import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { OrnamentDivider } from '@/components/Ornaments';
import { IconChevronLeft } from '@/components/icons';
import { Colors, Fonts, Spacing, BorderRadius, GlassStyle } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <IconChevronLeft size={18} color={Colors.textSecondary} />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <Text style={styles.overline}>Voorkeuren</Text>
          <Text style={styles.title}>Instellingen</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>

          <View style={[styles.row, Platform.OS === 'web' && (GlassStyle as any)]}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Haptics</Text>
              <Text style={styles.rowDesc}>Subtiele trilling bij aanrakingen</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={settings.setHapticsEnabled}
              trackColor={{ false: Colors.glass, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        <OrnamentDivider style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Who's the Imposter v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  backText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerBlock: {
    marginBottom: Spacing.xl,
  },
  overline: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.displayBold,
    fontVariant: ['lining-nums'],
    fontSize: 42,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.goldLine,
  },
  rowInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowLabel: {
    color: Colors.text,
    fontFamily: Fonts.sansSemi,
    fontSize: 15,
  },
  rowDesc: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    marginTop: 3,
  },
  divider: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { TIMER_OPTIONS } from '@/constants/config';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Terug</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Instellingen</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geluid & Feedback</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Geluid</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={settings.setSoundEnabled}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Haptics</Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={settings.setHapticsEnabled}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Timer standaard aan</Text>
            <Switch
              value={settings.timerEnabled}
              onValueChange={settings.setTimerEnabled}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <Text style={styles.subLabel}>Hint timer (seconden)</Text>
          <View style={styles.timerOptions}>
            {TIMER_OPTIONS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.timerOption,
                  settings.hintTimer === seconds && styles.timerOptionSelected,
                ]}
                onPress={() => settings.setHintTimer(seconds)}
              >
                <Text
                  style={[
                    styles.timerOptionText,
                    settings.hintTimer === seconds && styles.timerOptionTextSelected,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Discussie timer (seconden)</Text>
          <View style={styles.timerOptions}>
            {TIMER_OPTIONS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.timerOption,
                  settings.discussionTimer === seconds && styles.timerOptionSelected,
                ]}
                onPress={() => settings.setDiscussionTimer(seconds)}
              >
                <Text
                  style={[
                    styles.timerOptionText,
                    settings.discussionTimer === seconds && styles.timerOptionTextSelected,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stemmen</Text>
          <View style={styles.votingOptions}>
            <TouchableOpacity
              style={[styles.votingOption, settings.votingMode === 'secret' && styles.votingOptionSelected]}
              onPress={() => settings.setVotingMode('secret')}
            >
              <Text style={styles.votingIcon}>🔒</Text>
              <Text style={[styles.votingText, settings.votingMode === 'secret' && styles.votingTextSelected]}>
                Geheim
              </Text>
              <Text style={styles.votingDesc}>Telefoon doorgeven</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.votingOption, settings.votingMode === 'open' && styles.votingOptionSelected]}
              onPress={() => settings.setVotingMode('open')}
            >
              <Text style={styles.votingIcon}>👆</Text>
              <Text style={[styles.votingText, settings.votingMode === 'open' && styles.votingTextSelected]}>
                Open
              </Text>
              <Text style={styles.votingDesc}>Wijs tegelijk aan</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  subLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timerOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timerOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  timerOptionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  timerOptionTextSelected: {
    color: Colors.text,
  },
  votingOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  votingOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  votingOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  votingIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  votingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  votingTextSelected: {
    color: Colors.text,
  },
  votingDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
});

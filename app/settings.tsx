import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Spacing, FontSize, BorderRadius, GlassStyle } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

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

          <View style={[styles.row, Platform.OS === 'web' && (GlassStyle as any)]}>
            <Text style={styles.rowLabel}>Geluid</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={settings.setSoundEnabled}
              trackColor={{ false: Colors.glass, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={[styles.row, Platform.OS === 'web' && (GlassStyle as any)]}>
            <Text style={styles.rowLabel}>Haptics</Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={settings.setHapticsEnabled}
              trackColor={{ false: Colors.glass, true: Colors.primary }}
              thumbColor={Colors.text}
            />
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
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowLabel: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
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

import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const light = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const medium = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavy = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const success = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const warning = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const error = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return { light, medium, heavy, success, warning, error };
}

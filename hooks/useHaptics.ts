import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

const isWeb = Platform.OS === 'web';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const light = () => {
    if (hapticsEnabled && !isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const medium = () => {
    if (hapticsEnabled && !isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavy = () => {
    if (hapticsEnabled && !isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const success = () => {
    if (hapticsEnabled && !isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const warning = () => {
    if (hapticsEnabled && !isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const error = () => {
    if (hapticsEnabled && !isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return { light, medium, heavy, success, warning, error };
}

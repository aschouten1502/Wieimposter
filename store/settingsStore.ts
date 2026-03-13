import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  playerCount: number;
  impostersCount: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setPlayerCount: (count: number) => void;
  setImpostersCount: (count: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      playerCount: 4,
      impostersCount: 1,
      soundEnabled: true,
      hapticsEnabled: true,
      setPlayerCount: (count) => set({ playerCount: count }),
      setImpostersCount: (count) => set({ impostersCount: count }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'wieimposter-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

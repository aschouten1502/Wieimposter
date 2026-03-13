import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, VotingMode } from '@/types/game';
import { DEFAULT_SETTINGS } from '@/constants/config';

interface SettingsStore extends GameSettings {
  setPlayerCount: (count: number) => void;
  setImpostersCount: (count: number) => void;
  setVotingMode: (mode: VotingMode) => void;
  setDiscussionTimer: (seconds: number) => void;
  setHintTimer: (seconds: number) => void;
  setTimerEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setPlayerCount: (count) => set({ playerCount: count }),
      setImpostersCount: (count) => set({ impostersCount: count }),
      setVotingMode: (mode) => set({ votingMode: mode }),
      setDiscussionTimer: (seconds) => set({ discussionTimer: seconds }),
      setHintTimer: (seconds) => set({ hintTimer: seconds }),
      setTimerEnabled: (enabled) => set({ timerEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'wieimposter-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

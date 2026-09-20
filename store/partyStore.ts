import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentLevel } from '@/types/party';

/**
 * Gedeelde instellingen voor alle party-spellen: één keer namen invullen,
 * één keer kiezen of er gedronken wordt en hoe pittig het mag.
 */
interface PartyStore {
  playerNames: string[];
  /** Aan = "drink 2 slokken"; uit = een leuke niet-drank-straf. */
  drinkMode: boolean;
  level: ContentLevel;
  /** Kaart-ids die deze sessie al voorbij zijn gekomen, per spel. */
  seen: Record<string, string[]>;

  setPlayerNames: (names: string[]) => void;
  setDrinkMode: (on: boolean) => void;
  setLevel: (level: ContentLevel) => void;
  markSeen: (gameId: string, itemId: string) => void;
  resetSeen: (gameId: string) => void;
}

export const usePartyStore = create<PartyStore>()(
  persist(
    (set) => ({
      playerNames: [],
      drinkMode: true,
      level: 'heet',
      seen: {},

      setPlayerNames: (names) =>
        set({ playerNames: names.map((n) => n.trim()).filter(Boolean) }),
      setDrinkMode: (on) => set({ drinkMode: on }),
      setLevel: (level) => set({ level }),
      markSeen: (gameId, itemId) =>
        set((s) => {
          const list = s.seen[gameId] ?? [];
          if (list.includes(itemId)) return s;
          return { seen: { ...s.seen, [gameId]: [...list, itemId] } };
        }),
      resetSeen: (gameId) =>
        set((s) => ({ seen: { ...s.seen, [gameId]: [] } })),
    }),
    {
      name: 'wieimposter-party',
      storage: createJSONStorage(() => AsyncStorage),
      // `seen` is sessie-gebonden; alleen voorkeuren bewaren.
      partialize: (s) => ({ playerNames: s.playerNames, drinkMode: s.drinkMode, level: s.level }),
    }
  )
);

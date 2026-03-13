import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameStats, PlayerStats, RoundResult } from '@/types/game';

interface StatsStore extends GameStats {
  recordGame: (result: RoundResult, players: { name: string; role: 'civilian' | 'imposter' }[]) => void;
  resetStats: () => void;
}

const initialStats: GameStats = {
  gamesPlayed: 0,
  civilianWins: 0,
  imposterWins: 0,
  playerStats: {},
};

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...initialStats,

      recordGame: (result, players) => {
        const state = get();
        const civilianWon = result === 'civilians_win';
        const imposterWon = result === 'imposter_wins' || result === 'imposter_guessed';

        const updatedPlayerStats = { ...state.playerStats };

        players.forEach(({ name, role }) => {
          const existing = updatedPlayerStats[name] || {
            name,
            gamesPlayed: 0,
            winsAsCivilian: 0,
            winsAsImposter: 0,
          };

          updatedPlayerStats[name] = {
            ...existing,
            gamesPlayed: existing.gamesPlayed + 1,
            winsAsCivilian: existing.winsAsCivilian + (civilianWon && role === 'civilian' ? 1 : 0),
            winsAsImposter: existing.winsAsImposter + (imposterWon && role === 'imposter' ? 1 : 0),
          };
        });

        set({
          gamesPlayed: state.gamesPlayed + 1,
          civilianWins: state.civilianWins + (civilianWon ? 1 : 0),
          imposterWins: state.imposterWins + (imposterWon ? 1 : 0),
          playerStats: updatedPlayerStats,
        });
      },

      resetStats: () => set(initialStats),
    }),
    {
      name: 'wieimposter-stats',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

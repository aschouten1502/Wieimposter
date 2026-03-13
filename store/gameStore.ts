import { create } from 'zustand';
import { Player, GamePhase, Round, RoundResult, Role } from '@/types/game';
import { getRandomWordFromCategories } from '@/data/categories';
import { generateId, shuffleArray } from '@/utils/helpers';

interface GameStore {
  players: Player[];
  round: Round | null;
  usedWords: string[];

  // Setup
  setPlayers: (players: Player[]) => void;
  initGame: (playerNames: string[], categoryIds: string[], impostersCount: number, trollMode: boolean) => void;

  // Phase management
  setPhase: (phase: GamePhase) => void;
  nextPlayer: () => void;
  setCurrentPlayerIndex: (index: number) => void;

  // Reveal
  markPlayerRevealed: (playerId: string) => void;
  allPlayersRevealed: () => boolean;

  // Results
  imposterFinalGuess: (word: string) => boolean;

  // Game flow
  nextRound: () => void;
  resetGame: () => void;

  // Helpers
  getPlayerById: (id: string) => Player | null;
  getImposters: () => Player[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  round: null,
  usedWords: [],

  setPlayers: (players) => set({ players }),

  initGame: (playerNames, categoryIds, impostersCount, trollMode) => {
    const { usedWords } = get();
    const result = getRandomWordFromCategories(categoryIds, usedWords);

    // Troll mode: 15% chance everyone becomes imposter
    const isTrollRound = trollMode && Math.random() < 0.15;

    // Cap imposters to safe maximum
    const safeImposters = Math.min(impostersCount, Math.max(1, Math.floor(playerNames.length / 3)));

    const players: Player[] = playerNames.map((name) => ({
      id: generateId(),
      name,
      role: 'civilian' as Role,
      score: 0,
      hasRevealed: false,
    }));

    let imposterIds: string[];

    if (isTrollRound) {
      imposterIds = players.map((p) => p.id);
      players.forEach((_, idx) => {
        players[idx] = { ...players[idx], role: 'imposter' };
      });
    } else {
      const shuffledIndices = shuffleArray(players.map((_, i) => i));
      const imposterIndices = shuffledIndices.slice(0, safeImposters);
      imposterIds = [];

      imposterIndices.forEach((idx) => {
        players[idx] = { ...players[idx], role: 'imposter' };
        imposterIds.push(players[idx].id);
      });
    }

    const hintStartIndex = Math.floor(Math.random() * players.length);

    const round: Round = {
      categoryIds,
      sourceCategoryId: result.categoryId,
      secretWord: result.word,
      imposterHint: result.hint,
      imposterIds,
      currentPlayerIndex: 0,
      hintStartIndex,
      phase: 'passing',
      roundResult: null,
      votedPlayerId: null,
      trollModeEnabled: trollMode,
      trollRound: isTrollRound,
    };

    set({
      players,
      round,
      usedWords: [...usedWords, result.word],
    });
  },

  setPhase: (phase) => {
    const { round } = get();
    if (!round) return;
    set({ round: { ...round, phase } });
  },

  nextPlayer: () => {
    const { round } = get();
    if (!round) return;
    set({ round: { ...round, currentPlayerIndex: round.currentPlayerIndex + 1 } });
  },

  setCurrentPlayerIndex: (index) => {
    const { round } = get();
    if (!round) return;
    set({ round: { ...round, currentPlayerIndex: index } });
  },

  markPlayerRevealed: (playerId) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, hasRevealed: true } : p
      ),
    }));
  },

  allPlayersRevealed: () => {
    return get().players.every((p) => p.hasRevealed);
  },

  imposterFinalGuess: (word) => {
    const { round, players } = get();
    if (!round) return false;

    const correct = word.toLowerCase().trim() === round.secretWord.toLowerCase().trim();

    if (correct) {
      const updatedPlayers = players.map((p) => {
        if (p.role === 'imposter') {
          return { ...p, score: p.score + 3 };
        }
        if (p.role === 'civilian' && round.roundResult === 'civilians_win') {
          return { ...p, score: p.score - 1 };
        }
        return p;
      });

      set({
        players: updatedPlayers,
        round: { ...round, roundResult: 'imposter_guessed' },
      });
    }

    return correct;
  },

  nextRound: () => {
    const { players, round, usedWords } = get();
    if (!round) return;

    const result = getRandomWordFromCategories(round.categoryIds, usedWords);

    const isTrollRound = round.trollModeEnabled && Math.random() < 0.15;

    const resetPlayers: Player[] = players.map((p) => ({
      ...p,
      role: 'civilian' as Role,
      hasRevealed: false,
    }));

    let imposterIds: string[];
    let finalPlayers: Player[];

    if (isTrollRound) {
      imposterIds = resetPlayers.map((p) => p.id);
      finalPlayers = resetPlayers.map((p) => ({ ...p, role: 'imposter' as Role }));
    } else {
      const shuffledIndices = shuffleArray(resetPlayers.map((_, i) => i));
      const imposterCount = round.trollRound
        ? Math.max(1, Math.floor(resetPlayers.length / 3))
        : round.imposterIds.length;
      const imposterIndices = shuffledIndices.slice(0, Math.min(imposterCount, Math.max(1, Math.floor(resetPlayers.length / 3))));
      imposterIds = [];

      finalPlayers = resetPlayers.map((p, idx) => {
        if (imposterIndices.includes(idx)) {
          imposterIds.push(p.id);
          return { ...p, role: 'imposter' as Role };
        }
        return p;
      });
    }

    const hintStartIndex = Math.floor(Math.random() * finalPlayers.length);

    set({
      players: finalPlayers,
      round: {
        ...round,
        categoryIds: round.categoryIds,
        sourceCategoryId: result.categoryId,
        secretWord: result.word,
        imposterHint: result.hint,
        imposterIds,
        currentPlayerIndex: 0,
        hintStartIndex,
        phase: 'passing',
        roundResult: null,
        votedPlayerId: null,
        trollModeEnabled: round.trollModeEnabled,
        trollRound: isTrollRound,
      },
      usedWords: [...usedWords, result.word],
    });
  },

  resetGame: () => {
    set({ players: [], round: null, usedWords: [] });
  },

  getPlayerById: (id) => {
    return get().players.find((p) => p.id === id) || null;
  },

  getImposters: () => {
    const { players, round } = get();
    if (!round) return [];
    return players.filter((p) => round.imposterIds.includes(p.id));
  },
}));

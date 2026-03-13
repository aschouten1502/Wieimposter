import { create } from 'zustand';
import { Player, GamePhase, Round, RoundResult, Role } from '@/types/game';
import { getRandomWord } from '@/data/categories';
import { generateId, shuffleArray } from '@/utils/helpers';

interface GameStore {
  players: Player[];
  round: Round | null;
  usedWords: string[];

  // Setup
  setPlayers: (players: Player[]) => void;
  initGame: (playerNames: string[], categoryId: string, impostersCount: number, trollMode: boolean) => void;

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

  initGame: (playerNames, categoryId, impostersCount, trollMode) => {
    const { usedWords } = get();
    const secretWord = getRandomWord(categoryId, usedWords);

    // Troll mode: 15% chance everyone becomes imposter
    const isTrollRound = trollMode && Math.random() < 0.15;

    // Cap imposters to safe maximum
    const safeImposters = Math.min(impostersCount, Math.max(1, Math.floor(playerNames.length / 3)));

    const players: Player[] = playerNames.map((name) => ({
      id: generateId(),
      name,
      role: 'civilian' as Role,
      score: 0,
      hasVoted: false,
      voteTargetId: null,
      hasRevealed: false,
      hasGivenHint: false,
    }));

    let imposterIds: string[];

    if (isTrollRound) {
      // Everyone is imposter — nobody knows the word
      imposterIds = players.map((p) => p.id);
      players.forEach((_, idx) => {
        players[idx] = { ...players[idx], role: 'imposter' };
      });
    } else {
      // Normal: shuffle and assign imposters
      const shuffledIndices = shuffleArray(players.map((_, i) => i));
      const imposterIndices = shuffledIndices.slice(0, safeImposters);
      imposterIds = [];

      imposterIndices.forEach((idx) => {
        players[idx] = { ...players[idx], role: 'imposter' };
        imposterIds.push(players[idx].id);
      });
    }

    // Randomize play order
    const shuffledPlayers = shuffleArray(players);

    const round: Round = {
      categoryId,
      secretWord,
      imposterIds,
      currentPlayerIndex: 0,
      phase: 'passing',
      roundResult: null,
      trollRound: isTrollRound,
    };

    set({
      players: shuffledPlayers,
      round,
      usedWords: [...usedWords, secretWord],
    });
  },

  // Bug #2 fix: setPhase no longer silently resets currentPlayerIndex
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

  // Bug #8 fix: revoke civilian points when imposter guesses correctly
  imposterFinalGuess: (word) => {
    const { round, players } = get();
    if (!round) return false;

    const correct = word.toLowerCase().trim() === round.secretWord.toLowerCase().trim();

    if (correct) {
      const updatedPlayers = players.map((p) => {
        if (p.role === 'imposter') {
          return { ...p, score: p.score + 3 };
        }
        // Revoke civilian win bonus
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

    const secretWord = getRandomWord(round.categoryId, usedWords);

    // Troll mode: 15% chance if previous round had troll mode enabled
    const wasTrollEnabled = round.trollRound !== undefined;
    const isTrollRound = wasTrollEnabled && Math.random() < 0.15;

    // Reset player states but keep scores — create fresh objects
    const resetPlayers: Player[] = players.map((p) => ({
      ...p,
      role: 'civilian' as Role,
      hasVoted: false,
      voteTargetId: null,
      hasRevealed: false,
      hasGivenHint: false,
    }));

    // Shuffle play order
    const shuffled = shuffleArray(resetPlayers);

    let imposterIds: string[];
    let finalPlayers: Player[];

    if (isTrollRound) {
      imposterIds = shuffled.map((p) => p.id);
      finalPlayers = shuffled.map((p) => ({ ...p, role: 'imposter' as Role }));
    } else {
      // Normal: assign imposters
      const shuffledIndices = shuffleArray(shuffled.map((_, i) => i));
      // Use original imposter count (not troll count)
      const imposterCount = round.trollRound
        ? Math.max(1, Math.floor(shuffled.length / 3))
        : round.imposterIds.length;
      const imposterIndices = shuffledIndices.slice(0, Math.min(imposterCount, Math.max(1, Math.floor(shuffled.length / 3))));
      imposterIds = [];

      finalPlayers = shuffled.map((p, idx) => {
        if (imposterIndices.includes(idx)) {
          imposterIds.push(p.id);
          return { ...p, role: 'imposter' as Role };
        }
        return p;
      });
    }

    set({
      players: finalPlayers,
      round: {
        ...round,
        secretWord,
        imposterIds,
        currentPlayerIndex: 0,
        phase: 'passing',
        roundResult: null,
        trollRound: isTrollRound,
      },
      usedWords: [...usedWords, secretWord],
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

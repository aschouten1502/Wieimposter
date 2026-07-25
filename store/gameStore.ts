import { create } from 'zustand';
import { Player, GamePhase, Round, RoundResult, Role } from '@/types/game';
import { getRandomWordFromCategories } from '@/data/categories';
import { generateId, shuffleArray, getMaxImposters, normalizeGuess } from '@/utils/helpers';

interface GameStore {
  players: Player[];
  round: Round | null;
  usedWords: string[];

  // Setup
  setPlayers: (players: Player[]) => void;
  initGame: (playerNames: string[], categoryIds: string[], impostersCount: number, trollMode: boolean, hintsEnabled: boolean) => void;

  // Phase management
  setPhase: (phase: GamePhase) => void;
  nextPlayer: () => void;
  setCurrentPlayerIndex: (index: number) => void;

  // Reveal
  markPlayerRevealed: (playerId: string) => void;
  allPlayersRevealed: () => boolean;

  // Voting & results
  resolveVote: (votedPlayerId: string | null) => void;
  checkImposterGuess: (word: string) => boolean;
  applyImposterGuessed: () => void;

  // Game flow
  nextRound: () => void;
  resetGame: () => void;

  // Helpers
  getPlayerById: (id: string) => Player | null;
  getImposters: () => Player[];
}

interface BuildRoundParams {
  players: Player[];
  categoryIds: string[];
  impostersCount: number;
  trollMode: boolean;
  hintsEnabled: boolean;
  usedWords: string[];
}

/**
 * Assigns roles + picks a fresh word for a new round.
 * Existing player identity and score are preserved; role and hasRevealed reset.
 */
function buildRound(params: BuildRoundParams): { players: Player[]; round: Round; word: string } {
  const { categoryIds, impostersCount, trollMode, hintsEnabled, usedWords } = params;
  const result = getRandomWordFromCategories(categoryIds, usedWords);

  // Troll mode: 15% chance everyone becomes imposter
  const isTrollRound = trollMode && Math.random() < 0.15;
  const playerCount = params.players.length;
  const safeImposters = Math.min(Math.max(1, impostersCount), getMaxImposters(playerCount));

  let players: Player[] = params.players.map((p) => ({
    ...p,
    role: 'civilian' as Role,
    hasRevealed: false,
  }));

  let imposterIds: string[];

  if (isTrollRound) {
    imposterIds = players.map((p) => p.id);
    players = players.map((p) => ({ ...p, role: 'imposter' as Role }));
  } else {
    const imposterIndices = shuffleArray(players.map((_, i) => i)).slice(0, safeImposters);
    imposterIds = [];
    players = players.map((p, idx) => {
      if (imposterIndices.includes(idx)) {
        imposterIds.push(p.id);
        return { ...p, role: 'imposter' as Role };
      }
      return p;
    });
  }

  const hintStartIndex = Math.floor(Math.random() * playerCount);

  const round: Round = {
    categoryIds,
    sourceCategoryId: result.categoryId,
    secretWord: result.word,
    imposterHint: result.hint,
    imposterIds,
    originalImpostersCount: impostersCount,
    currentPlayerIndex: 0,
    hintStartIndex,
    phase: 'passing',
    roundResult: null,
    votedPlayerId: null,
    trollModeEnabled: trollMode,
    trollRound: isTrollRound,
    hintsEnabled,
  };

  return { players, round, word: result.word };
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  round: null,
  usedWords: [],

  setPlayers: (players) => set({ players }),

  initGame: (playerNames, categoryIds, impostersCount, trollMode, hintsEnabled) => {
    const { usedWords } = get();

    const basePlayers: Player[] = playerNames.map((name) => ({
      id: generateId(),
      name,
      role: 'civilian' as Role,
      score: 0,
      hasRevealed: false,
    }));

    const { players, round, word } = buildRound({
      players: basePlayers,
      categoryIds,
      impostersCount,
      trollMode,
      hintsEnabled,
      usedWords,
    });

    set({ players, round, usedWords: [...usedWords, word] });
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

  /**
   * The group counts down and points at one player at the same time; the app
   * only records who they picked.
   * - votedPlayerId === null → tie / nobody out → the imposter escapes and wins.
   * - the picked player is an imposter → civilians win.
   * - the picked player is a civilian → the imposter wins.
   */
  resolveVote: (votedPlayerId) => {
    const { round, players } = get();
    if (!round) return;

    // Troll round: nobody actually knew the word, so the vote is just for fun.
    if (round.trollRound) {
      set({
        round: { ...round, roundResult: 'imposter_wins', votedPlayerId, phase: 'results' },
      });
      return;
    }

    const caught = votedPlayerId !== null && round.imposterIds.includes(votedPlayerId);
    const result: RoundResult = caught ? 'civilians_win' : 'imposter_wins';

    const updatedPlayers = players.map((p) => {
      if (result === 'civilians_win' && p.role === 'civilian') {
        return { ...p, score: p.score + 1 };
      }
      if (result === 'imposter_wins' && p.role === 'imposter') {
        return { ...p, score: p.score + 2 };
      }
      return p;
    });

    set({
      players: updatedPlayers,
      round: { ...round, roundResult: result, votedPlayerId, phase: 'results' },
    });
  },

  // Pure, forgiving comparison — does not mutate state.
  checkImposterGuess: (word) => {
    const { round } = get();
    if (!round) return false;
    return normalizeGuess(word) === normalizeGuess(round.secretWord);
  },

  // Apply the "imposter guessed the word" outcome (steals the win).
  // Only reachable after a civilians_win, where each civilian already got +1.
  // The imposter steals the round: revert that +1 and award the imposters +3.
  applyImposterGuessed: () => {
    const { round, players } = get();
    if (!round) return;

    const updatedPlayers = players.map((p) => {
      if (p.role === 'imposter') return { ...p, score: p.score + 3 };
      // Revert the win point granted by the vote (never drops below prior total).
      return { ...p, score: p.score - 1 };
    });

    set({
      players: updatedPlayers,
      round: { ...round, roundResult: 'imposter_guessed' },
    });
  },

  nextRound: () => {
    const { players, round, usedWords } = get();
    if (!round) return;

    const { players: newPlayers, round: newRound, word } = buildRound({
      players, // scores are preserved; roles + hasRevealed reset inside buildRound
      categoryIds: round.categoryIds,
      impostersCount: round.originalImpostersCount,
      trollMode: round.trollModeEnabled,
      hintsEnabled: round.hintsEnabled,
      usedWords,
    });

    set({ players: newPlayers, round: newRound, usedWords: [...usedWords, word] });
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

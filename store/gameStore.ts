import { create } from 'zustand';
import { Player, GamePhase, Round, RoundResult, VoteResult, Role } from '@/types/game';
import { getRandomWord } from '@/data/categories';
import { generateId, shuffleArray } from '@/utils/helpers';

interface GameStore {
  players: Player[];
  round: Round | null;
  usedWords: string[];

  // Setup
  setPlayers: (players: Player[]) => void;
  initGame: (playerNames: string[], categoryId: string, impostersCount: number, timerEnabled: boolean) => void;

  // Phase management
  setPhase: (phase: GamePhase) => void;
  nextPlayer: () => void;
  setCurrentPlayerIndex: (index: number) => void;

  // Reveal
  markPlayerRevealed: (playerId: string) => void;
  allPlayersRevealed: () => boolean;

  // Hints
  markHintGiven: (playerId: string) => void;
  allHintsGiven: () => boolean;

  // Voting
  castVote: (voterId: string, targetId: string) => void;
  allVotesCast: () => boolean;
  getVoteResults: () => VoteResult[];
  getMostVotedPlayerId: () => string | null;

  // Results
  calculateResults: () => RoundResult;
  imposterFinalGuess: (word: string) => boolean;

  // Game flow
  nextRound: () => void;
  resetGame: () => void;

  // Helpers
  getCurrentPlayer: () => Player | null;
  getPlayerById: (id: string) => Player | null;
  getImposters: () => Player[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  players: [],
  round: null,
  usedWords: [],

  setPlayers: (players) => set({ players }),

  initGame: (playerNames, categoryId, impostersCount, timerEnabled) => {
    const { usedWords } = get();
    const secretWord = getRandomWord(categoryId, usedWords);

    const players: Player[] = playerNames.map((name, index) => ({
      id: generateId(),
      name,
      role: 'civilian',
      score: 0,
      hasVoted: false,
      voteTargetId: null,
      hasRevealed: false,
      hasGivenHint: false,
    }));

    // Shuffle and assign imposters
    const shuffledIndices = shuffleArray(players.map((_, i) => i));
    const imposterIndices = shuffledIndices.slice(0, impostersCount);
    const imposterIds: string[] = [];

    imposterIndices.forEach((idx) => {
      players[idx].role = 'imposter';
      imposterIds.push(players[idx].id);
    });

    // Randomize play order
    const shuffledPlayers = shuffleArray(players);

    const round: Round = {
      categoryId,
      secretWord,
      imposterIds,
      currentPlayerIndex: 0,
      phase: 'passing',
      roundResult: null,
    };

    set({
      players: shuffledPlayers,
      round,
      usedWords: [...usedWords, secretWord],
    });
  },

  setPhase: (phase) => {
    const { round } = get();
    if (!round) return;
    set({ round: { ...round, phase, currentPlayerIndex: 0 } });
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

  markHintGiven: (playerId) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, hasGivenHint: true } : p
      ),
    }));
  },

  allHintsGiven: () => {
    return get().players.every((p) => p.hasGivenHint);
  },

  castVote: (voterId, targetId) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === voterId ? { ...p, hasVoted: true, voteTargetId: targetId } : p
      ),
    }));
  },

  allVotesCast: () => {
    return get().players.every((p) => p.hasVoted);
  },

  getVoteResults: () => {
    const { players } = get();
    const voteCounts: Record<string, number> = {};

    players.forEach((p) => {
      if (p.voteTargetId) {
        voteCounts[p.voteTargetId] = (voteCounts[p.voteTargetId] || 0) + 1;
      }
    });

    return players.map((p) => ({
      playerId: p.id,
      playerName: p.name,
      voteCount: voteCounts[p.id] || 0,
    })).sort((a, b) => b.voteCount - a.voteCount);
  },

  getMostVotedPlayerId: () => {
    const results = get().getVoteResults();
    if (results.length === 0) return null;
    return results[0].playerId;
  },

  calculateResults: () => {
    const { round, players } = get();
    if (!round) return 'imposter_wins';

    const mostVotedId = get().getMostVotedPlayerId();
    const isImposter = round.imposterIds.includes(mostVotedId || '');

    const result: RoundResult = isImposter ? 'civilians_win' : 'imposter_wins';

    // Update scores
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
      round: { ...round, roundResult: result, phase: 'results' },
    });

    return result;
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

    // Reset player states but keep scores
    const resetPlayers = shuffleArray(players.map((p) => ({
      ...p,
      role: 'civilian' as Role,
      hasVoted: false,
      voteTargetId: null,
      hasRevealed: false,
      hasGivenHint: false,
    })));

    // Assign new imposters
    const shuffledIndices = shuffleArray(resetPlayers.map((_, i) => i));
    const imposterCount = round.imposterIds.length;
    const imposterIndices = shuffledIndices.slice(0, imposterCount);
    const imposterIds: string[] = [];

    imposterIndices.forEach((idx) => {
      resetPlayers[idx].role = 'imposter';
      imposterIds.push(resetPlayers[idx].id);
    });

    set({
      players: resetPlayers,
      round: {
        ...round,
        secretWord,
        imposterIds,
        currentPlayerIndex: 0,
        phase: 'passing',
        roundResult: null,
      },
      usedWords: [...usedWords, secretWord],
    });
  },

  resetGame: () => {
    set({ players: [], round: null, usedWords: [] });
  },

  getCurrentPlayer: () => {
    const { players, round } = get();
    if (!round || round.currentPlayerIndex >= players.length) return null;
    return players[round.currentPlayerIndex];
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

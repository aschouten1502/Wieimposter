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
  getMostVotedPlayerId: () => { playerId: string | null; isTie: boolean };

  // Results
  calculateResults: () => void;
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

  initGame: (playerNames, categoryId, impostersCount, timerEnabled) => {
    const { usedWords } = get();
    const secretWord = getRandomWord(categoryId, usedWords);

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

    // Shuffle and assign imposters
    const shuffledIndices = shuffleArray(players.map((_, i) => i));
    const imposterIndices = shuffledIndices.slice(0, safeImposters);
    const imposterIds: string[] = [];

    imposterIndices.forEach((idx) => {
      players[idx] = { ...players[idx], role: 'imposter' };
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

  // Bug #3 fix: detect ties
  getMostVotedPlayerId: () => {
    const results = get().getVoteResults();
    if (results.length === 0) return { playerId: null, isTie: false };

    const topVotes = results[0].voteCount;
    if (topVotes === 0) return { playerId: null, isTie: false };

    const topPlayers = results.filter((r) => r.voteCount === topVotes);
    if (topPlayers.length > 1) {
      return { playerId: null, isTie: true };
    }
    return { playerId: results[0].playerId, isTie: false };
  },

  // Bug #5 fix: calculateResults no longer returns a value, always updates state
  calculateResults: () => {
    const { round, players } = get();
    if (!round) return;

    const { playerId: mostVotedId, isTie } = get().getMostVotedPlayerId();

    let result: RoundResult;
    if (isTie || !mostVotedId) {
      // Tie: no one eliminated, imposter wins
      result = 'imposter_wins';
    } else {
      const isImposter = round.imposterIds.includes(mostVotedId);
      result = isImposter ? 'civilians_win' : 'imposter_wins';
    }

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

    // Assign new imposters immutably
    const shuffledIndices = shuffleArray(shuffled.map((_, i) => i));
    const imposterCount = round.imposterIds.length;
    const imposterIndices = shuffledIndices.slice(0, imposterCount);
    const imposterIds: string[] = [];

    const finalPlayers = shuffled.map((p, idx) => {
      if (imposterIndices.includes(idx)) {
        imposterIds.push(p.id);
        return { ...p, role: 'imposter' as Role };
      }
      return p;
    });

    set({
      players: finalPlayers,
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

  getPlayerById: (id) => {
    return get().players.find((p) => p.id === id) || null;
  },

  getImposters: () => {
    const { players, round } = get();
    if (!round) return [];
    return players.filter((p) => round.imposterIds.includes(p.id));
  },
}));

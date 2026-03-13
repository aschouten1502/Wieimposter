export type Role = 'civilian' | 'imposter';

export type GamePhase =
  | 'setup'
  | 'passing'
  | 'reveal'
  | 'hints'
  | 'voting'
  | 'results';

export type RoundResult = 'civilians_win' | 'imposter_wins' | 'imposter_guessed';

export interface Player {
  id: string;
  name: string;
  role: Role;
  score: number;
  hasVoted: boolean;
  voteTargetId: string | null;
  hasRevealed: boolean;
  hasGivenHint: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isPremium: boolean;
  words: Word[];
}

export interface Word {
  id: string;
  value: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Round {
  categoryId: string;
  secretWord: string;
  imposterIds: string[];
  currentPlayerIndex: number;
  phase: GamePhase;
  roundResult: RoundResult | null;
  trollRound?: boolean;
}

export interface VoteResult {
  playerId: string;
  playerName: string;
  voteCount: number;
}

export interface GameStats {
  gamesPlayed: number;
  civilianWins: number;
  imposterWins: number;
  playerStats: Record<string, PlayerStats>;
}

export interface PlayerStats {
  name: string;
  gamesPlayed: number;
  winsAsCivilian: number;
  winsAsImposter: number;
}

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
  hasRevealed: boolean;
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
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Round {
  categoryIds: string[];
  sourceCategoryId: string;
  secretWord: string;
  imposterHint: string;
  imposterIds: string[];
  currentPlayerIndex: number;
  hintStartIndex: number;
  phase: GamePhase;
  roundResult: RoundResult | null;
  votedPlayerId: string | null;
  trollModeEnabled: boolean;
  trollRound: boolean;
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

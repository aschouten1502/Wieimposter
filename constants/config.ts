import { GameSettings } from '@/types/game';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;
export const MAX_IMPOSTERS_RATIO = 3; // max imposters = floor(players / this)

export const TIMER_OPTIONS = [30, 45, 60, 90, 120];

export const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  impostersCount: 1,
  votingMode: 'secret',
  discussionTimer: 60,
  hintTimer: 30,
  timerEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
};

export const PLAYER_COLORS = [
  '#E94560',
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#FF5722',
  '#8BC34A',
  '#673AB7',
  '#FFEB3B',
];

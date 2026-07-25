export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getMaxImposters(playerCount: number): number {
  return Math.max(1, Math.floor(playerCount / 3));
}

/**
 * Normalize a word for forgiving comparison: lowercase, strip accents,
 * remove spaces/punctuation. So "McDonald's" === "mcdonalds" and
 * "Nasi Goreng" === "nasigoreng" and "Poké Bowl" === "pokebowl".
 */
export function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

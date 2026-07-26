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
 * Pick a font size that lets `text` fit without clipping.
 *
 * react-native-web ignores `adjustsFontSizeToFit`, so long values like
 * "Goede Tijden, Slechte Tijden" got cut off ("Memphis Dep..."). This scales
 * the size down instead, honouring both the longest single word (which can
 * never wrap) and the total length spread over the allowed number of lines.
 */
export function fitFontSize(
  text: string,
  options: { max: number; min: number; maxChars: number; lines?: number }
): number {
  const { max, min, maxChars, lines = 1 } = options;
  const trimmed = (text ?? '').trim();
  if (!trimmed) return max;

  const longestWord = trimmed
    .split(/\s+/)
    .reduce((longest, word) => Math.max(longest, word.length), 0);
  const perLine = Math.ceil(trimmed.length / Math.max(1, lines));
  const effective = Math.max(longestWord, perLine);

  if (effective <= maxChars) return max;
  return Math.max(min, Math.round((max * maxChars) / effective));
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

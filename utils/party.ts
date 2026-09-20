import { ContentLevel, DeckItem } from '@/types/party';

/**
 * Straf-teksten. In drankmodus is het slokken; daarbuiten een leuke,
 * speelbare alternatieve straf zodat het spel ook zonder drank werkt.
 */
const SIPS = ['Drink 1 slok', 'Drink 2 slokken', 'Drink 3 slokken'];
const DARES = [
  'Doe 10 squats',
  'Zing 10 seconden een liedje',
  'Doe je beste dansmove',
  'Praat één minuut met een accent',
  'Geef iemand een compliment',
  'Doe een dierengeluid na',
  'Vertel een slechte mop',
  'Sta op en maak een buiging',
];

export function penalty(drinkMode: boolean, weight: 1 | 2 | 3 = 2): string {
  if (drinkMode) return SIPS[weight - 1];
  return DARES[Math.floor(Math.random() * DARES.length)];
}

/** Werkwoord voor in zinnen: "…, dan drink je" / "…, dan doe je een opdracht". */
export function penaltyVerb(drinkMode: boolean): string {
  return drinkMode ? 'drink je' : 'doe je een opdracht';
}

/** Filter een stapel op niveau: mild toont alleen mild, heet toont mild+heet, extra alles. */
export function filterByLevel<T extends DeckItem>(items: T[], level: ContentLevel): T[] {
  const rank: Record<ContentLevel, number> = { mild: 0, heet: 1, extra: 2 };
  return items.filter((it) => rank[it.level] <= rank[level]);
}

/**
 * Trek de volgende kaart: geeft voorrang aan kaarten die nog niet gezien zijn,
 * en begint opnieuw als alles voorbij is.
 */
export function drawNext<T extends DeckItem>(items: T[], seenIds: string[]): T | null {
  if (items.length === 0) return null;
  const unseen = items.filter((it) => !seenIds.includes(it.id));
  const pool = unseen.length > 0 ? unseen : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

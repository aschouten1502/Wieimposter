import { Category } from '@/types/game';
import { etenWords } from '@/data/words/eten';
import { beroepenWords } from '@/data/words/beroepen';
import { landenWords } from '@/data/words/landen';
import { dierenWords } from '@/data/words/dieren';
import { filmsWords } from '@/data/words/films';
import { sportWords } from '@/data/words/sport';
import { merkenWords } from '@/data/words/merken';
import { beroemdWords } from '@/data/words/beroemd';
import { thuisWords } from '@/data/words/thuis';
import { feestWords } from '@/data/words/feest';

// `icon` is a key into CategoryIcons (components/icons.tsx), not an emoji.
export const categories: Category[] = [
  { id: 'eten', name: 'Eten & Drinken', icon: 'food', isPremium: false, words: etenWords },
  { id: 'beroepen', name: 'Beroepen', icon: 'work', isPremium: false, words: beroepenWords },
  { id: 'landen', name: 'Landen & Steden', icon: 'globe', isPremium: false, words: landenWords },
  { id: 'dieren', name: 'Dieren', icon: 'paw', isPremium: false, words: dierenWords },
  { id: 'films', name: 'Films & Series', icon: 'film', isPremium: false, words: filmsWords },
  { id: 'sport', name: 'Sport & Spel', icon: 'trophy', isPremium: false, words: sportWords },
  { id: 'merken', name: 'Merken & Apps', icon: 'device', isPremium: false, words: merkenWords },
  { id: 'beroemd', name: 'Bekende Mensen', icon: 'star', isPremium: false, words: beroemdWords },
  { id: 'thuis', name: 'In & Om het Huis', icon: 'home', isPremium: false, words: thuisWords },
  { id: 'feest', name: 'Feest & Tradities', icon: 'music', isPremium: false, words: feestWords },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getRandomWord(categoryId: string, exclude: string[] = []): string {
  const result = getRandomWordFromCategories([categoryId], exclude);
  return result.word;
}

export function getRandomWordFromCategories(
  categoryIds: string[],
  exclude: string[] = [],
): { word: string; hint: string; categoryId: string } {
  const allWords = categoryIds.flatMap((id) => {
    const cat = getCategoryById(id);
    if (!cat) return [];
    return cat.words.map((w) => ({ value: w.value, hint: w.hint, categoryId: id }));
  });

  if (allWords.length === 0) {
    const fallback = categories[0];
    const pick = fallback.words[Math.floor(Math.random() * fallback.words.length)];
    return { word: pick.value, hint: pick.hint, categoryId: fallback.id };
  }

  const available = allWords.filter((w) => !exclude.includes(w.value));
  const pool = available.length > 0 ? available : allWords;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { word: pick.value, hint: pick.hint, categoryId: pick.categoryId };
}

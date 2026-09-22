/** Gedeelde types voor de party-spellen (alles behalve Imposter). */

export type ContentLevel = 'mild' | 'heet' | 'extra';

export const LEVEL_LABEL: Record<ContentLevel, string> = {
  mild: 'Mild',
  heet: 'Heet',
  extra: 'Extra heet',
};

/** Eén kaart uit een stapel (stelling, vraag, opdracht). */
export interface DeckItem {
  id: string;
  text: string;
  level: ContentLevel;
}

export type PartyGameId =
  | 'imposter'
  | 'nooit'
  | 'meest'
  | 'heet'
  | 'doe-of-drink'
  | 'links-rechts'
  | 'woordenbom';

export interface PartyGame {
  id: PartyGameId;
  /** Route waar het spel start. */
  route: string;
  name: string;
  tagline: string;
  /** Eén regel uitleg voor op de hub. */
  blurb: string;
  icon: 'mask' | 'glass' | 'hand' | 'flame' | 'heart' | 'arrows' | 'bomb';
  minPlayers: number;
  /** Heeft dit spel spelersnamen nodig? */
  needsPlayers: boolean;
  /** Heeft dit spel een niveaukeuze (mild/heet/extra)? */
  hasLevels: boolean;
  /** Kleur accent op de spelkaart. */
  accent: string;
}

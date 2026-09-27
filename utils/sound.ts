import { Platform } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Klein geluidsmotortje op de Web Audio API. Alle geluiden zijn gesynthetiseerd
 * (geen bestanden): dat werkt offline, weegt niets en klinkt strak bij UI-feedback.
 *
 * iOS/Safari staat geluid pas toe na een tik van de gebruiker; `unlockAudio()`
 * wordt daarom vanuit elke knop aangeroepen zodat de context ontgrendeld is
 * voordat een spel het eerste geluid wil afspelen.
 */

type Ctx = AudioContext;

let ctx: Ctx | null = null;

function getCtx(): Ctx | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const AC = (window as any).AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

function enabled(): boolean {
  return useSettingsStore.getState().soundEnabled;
}

interface ToneOptions {
  freq: number;
  /** Seconden. */
  duration: number;
  type?: OscillatorType;
  gain?: number;
  /** Glijd naar deze frequentie toe over de duur. */
  slideTo?: number;
  /** Startvertraging in seconden. */
  at?: number;
  attack?: number;
}

function tone(o: ToneOptions): void {
  const c = getCtx();
  if (!c || !enabled()) return;
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + o.duration);
  const peak = o.gain ?? 0.18;
  const attack = o.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + o.duration + 0.02);
}

interface NoiseOptions {
  duration: number;
  gain?: number;
  /** Laagdoorlaat-afsnijding in Hz; laag = dof/zwaar, hoog = scherp. */
  cutoff?: number;
  cutoffTo?: number;
  at?: number;
}

function noise(o: NoiseOptions): void {
  const c = getCtx();
  if (!c || !enabled()) return;
  const t0 = c.currentTime + (o.at ?? 0);
  const frames = Math.max(1, Math.floor(c.sampleRate * o.duration));
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(o.cutoff ?? 1200, t0);
  if (o.cutoffTo) filter.frequency.exponentialRampToValueAtTime(o.cutoffTo, t0 + o.duration);
  const g = c.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.25, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + o.duration + 0.02);
}

/** Alle spelgeluiden op één plek, zodat de spellen alleen een naam hoeven te kennen. */
export const sfx = {
  /** Aftel-tik: 3, 2, 1 — elke tel iets hoger. */
  tick(count: number): void {
    const freq = count >= 3 ? 620 : count === 2 ? 740 : 880;
    tone({ freq, duration: 0.14, type: 'triangle', gain: 0.22 });
  },

  /** Het eindwoord van een aftelling (WIJS / KIJK): een korte tweetonige stoot. */
  go(): void {
    tone({ freq: 660, duration: 0.32, type: 'square', gain: 0.16 });
    tone({ freq: 990, duration: 0.42, type: 'square', gain: 0.14, at: 0.06 });
  },

  /** Nieuwe kaart: zachte swoosh. */
  card(): void {
    noise({ duration: 0.16, gain: 0.12, cutoff: 3200, cutoffTo: 500 });
  },

  /** Kaart omdraaien (Imposter). */
  flip(): void {
    noise({ duration: 0.22, gain: 0.14, cutoff: 900, cutoffTo: 4200 });
  },

  /** Passen / weigeren: een zachte 'womp' omlaag. */
  penalty(): void {
    tone({ freq: 330, duration: 0.28, type: 'sawtooth', gain: 0.12, slideTo: 150 });
  },

  /** Speciale ronde (dubbel, groep, verhaal): korte sprankel. */
  sparkle(): void {
    tone({ freq: 1046, duration: 0.12, gain: 0.1 });
    tone({ freq: 1318, duration: 0.14, gain: 0.1, at: 0.09 });
    tone({ freq: 1568, duration: 0.2, gain: 0.1, at: 0.18 });
  },

  /** Lont-tik van de woordenbom; `urgent` = laatste seconden. */
  fuse(urgent: boolean): void {
    tone({ freq: urgent ? 1500 : 1100, duration: 0.05, type: 'square', gain: urgent ? 0.14 : 0.07 });
  },

  /** De knal. */
  explode(): void {
    noise({ duration: 0.9, gain: 0.5, cutoff: 3000, cutoffTo: 80 });
    tone({ freq: 90, duration: 0.7, type: 'sine', gain: 0.35, slideTo: 32, attack: 0.002 });
  },

  /** Burgerkaart: warm akkoordje. */
  revealCivilian(): void {
    tone({ freq: 523, duration: 0.35, gain: 0.12 });
    tone({ freq: 659, duration: 0.4, gain: 0.12, at: 0.05 });
    tone({ freq: 784, duration: 0.5, gain: 0.12, at: 0.1 });
  },

  /** Imposterkaart: lage, dreigende toon. */
  revealImposter(): void {
    tone({ freq: 196, duration: 0.7, type: 'triangle', gain: 0.2, slideTo: 150 });
    tone({ freq: 98, duration: 0.8, type: 'sine', gain: 0.18, at: 0.05 });
  },

  /** Burgers winnen: klein fanfaretje. */
  winCivilians(): void {
    [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, duration: 0.28, gain: 0.14, at: i * 0.1 }));
  },

  /** Imposter wint of ontsnapt: donkere sting. */
  winImposter(): void {
    tone({ freq: 233, duration: 0.5, type: 'sawtooth', gain: 0.1 });
    tone({ freq: 220, duration: 0.9, type: 'sawtooth', gain: 0.12, at: 0.3, slideTo: 110 });
  },

  /** Iedereen was de imposter: speelse omhoog-glijder. */
  troll(): void {
    tone({ freq: 300, duration: 0.5, type: 'square', gain: 0.1, slideTo: 1200 });
    tone({ freq: 1200, duration: 0.25, gain: 0.12, at: 0.5 });
  },
};

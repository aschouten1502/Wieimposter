import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const IVORY = '#F2EAD8';

interface FrameProps extends IconProps {
  children: React.ReactNode;
}

function IconFrame({ size = 24, children }: FrameProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

function strokeProps(color: string, strokeWidth: number) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
}

/** Theatermasker — het merkteken van de imposter. */
export function IconMask({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path
        d="M5.2 4.2 C7.2 3.3 9.2 3.6 12 3.6 C14.8 3.6 16.8 3.3 18.8 4.2 C19.4 8 19.3 11.9 17.6 15.2 C16.2 17.9 14.2 19.8 12 20.4 C9.8 19.8 7.8 17.9 6.4 15.2 C4.7 11.9 4.6 8 5.2 4.2 Z"
        {...s}
      />
      <Path d="M7.6 9.8 C8.4 8.9 9.9 8.9 10.7 9.8" {...s} />
      <Path d="M13.3 9.8 C14.1 8.9 15.6 8.9 16.4 9.8" {...s} />
      <Path d="M9.2 14.6 C10.8 16.2 13.2 16.2 14.8 14.6" {...s} />
    </IconFrame>
  );
}

export function IconEye({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path
        d="M2.5 12 C5.3 7.4 8.4 5.2 12 5.2 C15.6 5.2 18.7 7.4 21.5 12 C18.7 16.6 15.6 18.8 12 18.8 C8.4 18.8 5.3 16.6 2.5 12 Z"
        {...s}
      />
      <Circle cx={12} cy={12} r={3} {...s} />
    </IconFrame>
  );
}

export function IconUsers({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Circle cx={9} cy={7.8} r={3.3} {...s} />
      <Path d="M3.2 19.8 C3.2 16.2 5.8 13.9 9 13.9 C12.2 13.9 14.8 16.2 14.8 19.8" {...s} />
      <Path d="M15.4 4.8 A3.3 3.3 0 0 1 15.4 11" {...s} />
      <Path d="M17.4 14.3 C19.5 15.1 20.8 17.2 20.8 19.8" {...s} />
    </IconFrame>
  );
}

/** Abstracte frangipani — vijf slanke bloembladen rond een hart. */
export function IconLeaf({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  const petal = 'M12 9.6 C10.6 8.2 10.5 5.6 12 3.2 C13.5 5.6 13.4 8.2 12 9.6 Z';
  return (
    <IconFrame size={size}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <G key={deg} rotation={deg} origin="12, 12">
          <Path d={petal} {...s} />
        </G>
      ))}
      <Circle cx={12} cy={12} r={1.1} {...s} />
    </IconFrame>
  );
}

/** Abstracte gespleten poort — twee gespiegelde trapvormen met een opening. */
export function IconGate({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M4 20 V12 H6 V8.6 H8 V5 H10.2 V20" {...s} />
      <Path d="M20 20 V12 H18 V8.6 H16 V5 H13.8 V20" {...s} />
      <Path d="M2.6 20 H21.4" {...s} />
    </IconFrame>
  );
}

export function IconCrown({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M4.4 16.4 L3.4 7.2 L8.5 10.6 L12 5.2 L15.5 10.6 L20.6 7.2 L19.6 16.4 Z" {...s} />
      <Path d="M5 19.6 H19" {...s} />
    </IconFrame>
  );
}

/** Opgestoken hand — stemmen. */
export function IconVote({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M17.6 11 V6.2 a1.8 1.8 0 0 0 -3.6 0 v4.4" {...s} />
      <Path d="M14 10.2 V4.4 a1.8 1.8 0 0 0 -3.6 0 v5.6" {...s} />
      <Path d="M10.4 10.4 V6.2 a1.8 1.8 0 0 0 -3.6 0 v7.6" {...s} />
      <Path
        d="M17.6 8.4 a1.8 1.8 0 0 1 3.6 0 v5.4 a7.4 7.4 0 0 1 -7.4 7.4 h-1.7 c-2.5 0 -4.1 -.8 -5.5 -2.2 l-3.3 -3.3 a1.75 1.75 0 0 1 2.5 -2.5 l1 1"
        {...s}
      />
    </IconFrame>
  );
}

export function IconQuestion({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Circle cx={12} cy={12} r={9} {...s} />
      <Path d="M9.4 9.4 a2.6 2.6 0 0 1 5.2 .3 c0 1.6 -1.3 2.1 -2.1 2.7 c-.4 .3 -.5 .7 -.5 1.3" {...s} />
      <Path d="M12 16.9 v.01" {...s} />
    </IconFrame>
  );
}

export function IconCheck({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M4.8 12.6 L9.8 17.6 L19.2 6.4" {...s} />
    </IconFrame>
  );
}

export function IconCross({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M6.2 6.2 L17.8 17.8" {...s} />
      <Path d="M17.8 6.2 L6.2 17.8" {...s} />
    </IconFrame>
  );
}

export function IconChevronLeft({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M14.6 5.4 L8 12 L14.6 18.6" {...s} />
    </IconFrame>
  );
}

export function IconPlus({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M12 5.4 V18.6" {...s} />
      <Path d="M5.4 12 H18.6" {...s} />
    </IconFrame>
  );
}

export function IconMinus({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M5.4 12 H18.6" {...s} />
    </IconFrame>
  );
}

/** Vierpuntige ster — subtiel lichtaccent. */
export function IconSparkle({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path
        d="M12 3 C12.8 7.6 14.9 10.2 20.6 12 C14.9 13.8 12.8 16.4 12 21 C11.2 16.4 9.1 13.8 3.4 12 C9.1 10.2 11.2 7.6 12 3 Z"
        {...s}
      />
    </IconFrame>
  );
}

export function IconScroll({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M19 16.8 V5 a2 2 0 0 0 -2 -2 H4.2" {...s} />
      <Path
        d="M8.2 21 H20 a2 2 0 0 0 2 -2 v-.9 a1 1 0 0 0 -1 -1 H11.2 a1 1 0 0 0 -1 1 v.9 a2 2 0 1 1 -4 0 V5 a2 2 0 1 0 -4 0 v1.9 a1 1 0 0 0 1 1 h2.6"
        {...s}
      />
      <Path d="M11.4 8 H15.6" {...s} />
      <Path d="M11.4 11.6 H14.4" {...s} />
    </IconFrame>
  );
}

/** Fijn tandwiel — instellingen. */
export function IconGear({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Circle cx={12} cy={12} r={6.7} {...s} />
      <Circle cx={12} cy={12} r={2.7} {...s} />
      <Path d="M12 5.3 L12 2.7" {...s} />
      <Path d="M16.74 7.26 L18.58 5.42" {...s} />
      <Path d="M18.7 12 L21.3 12" {...s} />
      <Path d="M16.74 16.74 L18.58 18.58" {...s} />
      <Path d="M12 18.7 L12 21.3" {...s} />
      <Path d="M7.26 16.74 L5.42 18.58" {...s} />
      <Path d="M5.3 12 L2.7 12" {...s} />
      <Path d="M7.26 7.26 L5.42 5.42" {...s} />
    </IconFrame>
  );
}

/** Twee speelkaarten met een ruitje op de voorste kaart. */
export function IconCards({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <G rotation={12} origin="14.5, 11">
        <Rect x={9.6} y={3.6} width={9.8} height={14.4} rx={1.8} {...s} />
      </G>
      <Rect x={4} y={6} width={9.8} height={14.4} rx={1.8} {...s} />
      <Path d="M8.9 11.4 L10.5 13.2 L8.9 15 L7.3 13.2 Z" {...s} />
    </IconFrame>
  );
}

export function IconShuffle({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M2.5 18 H4 c1.3 0 2.5 -.6 3.3 -1.7 l6 -8.6 c.8 -1.1 2 -1.7 3.3 -1.7 h4.9" {...s} />
      <Path d="M18.4 2.9 L21.5 6 L18.4 9.1" {...s} />
      <Path d="M2.5 6 h1.5 c1.5 0 2.9 .8 3.7 2.1" {...s} />
      <Path d="M12.7 15.9 c.8 1.3 2.2 2.1 3.7 2.1 h5.1" {...s} />
      <Path d="M18.4 14.9 L21.5 18 L18.4 21.1" {...s} />
    </IconFrame>
  );
}

export function IconTrophy({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M6.6 3.4 H17.4 V8.8 A5.4 5.4 0 0 1 6.6 8.8 Z" {...s} />
      <Path d="M6.6 5 H4.8 a2.1 2.1 0 0 0 0 4.2 H6.8" {...s} />
      <Path d="M17.4 5 H19.2 a2.1 2.1 0 0 1 0 4.2 H17.2" {...s} />
      <Path d="M12 14.2 V17.4" {...s} />
      <Path d="M9.3 20.6 c0 -1.9 1.2 -3.2 2.7 -3.2 s2.7 1.3 2.7 3.2" {...s} />
      <Path d="M8 20.6 H16" {...s} />
    </IconFrame>
  );
}

/** Serveercloche — eten en drinken. */
export function IconFood({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M4.5 15.6 a7.5 7.5 0 0 1 15 0" {...s} />
      <Circle cx={12} cy={6.4} r={1.2} {...s} />
      <Path d="M3 15.6 H21" {...s} />
      <Path d="M5.6 18.8 H18.4" {...s} />
    </IconFrame>
  );
}

/** Aktetas — beroepen. */
export function IconWork({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Rect x={3.6} y={7.4} width={16.8} height={12.2} rx={2.2} {...s} />
      <Path d="M9 7.4 V6 a2 2 0 0 1 2 -2 h2 a2 2 0 0 1 2 2 v1.4" {...s} />
      <Path d="M3.6 12.2 H20.4" {...s} />
    </IconFrame>
  );
}

export function IconGlobe({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Circle cx={12} cy={12} r={8.8} {...s} />
      <Path d="M12 3.2 C15.4 5.8 15.4 18.2 12 20.8 C8.6 18.2 8.6 5.8 12 3.2 Z" {...s} />
      <Path d="M3.2 12 H20.8" {...s} />
    </IconFrame>
  );
}

/** Pootafdruk — dieren. */
export function IconPaw({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Ellipse cx={5.6} cy={10.6} rx={1.7} ry={2.1} {...s} />
      <Ellipse cx={9.9} cy={6.6} rx={1.8} ry={2.2} {...s} />
      <Ellipse cx={14.1} cy={6.6} rx={1.8} ry={2.2} {...s} />
      <Ellipse cx={18.4} cy={10.6} rx={1.7} ry={2.1} {...s} />
      <Path
        d="M12 12 C14.7 12 16.8 13.9 16.8 16.1 C16.8 18 15.3 19.3 13.7 18.7 A4.7 4.7 0 0 0 10.3 18.7 C8.7 19.3 7.2 18 7.2 16.1 C7.2 13.9 9.3 12 12 12 Z"
        {...s}
      />
    </IconFrame>
  );
}

/** Filmstrook — film en tv. */
export function IconFilm({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Rect x={3.6} y={4.4} width={16.8} height={15.2} rx={2.2} {...s} />
      <Path d="M7.6 4.4 V19.6" {...s} />
      <Path d="M16.4 4.4 V19.6" {...s} />
      <Path d="M3.6 8.4 H7.6" {...s} />
      <Path d="M3.6 12 H7.6" {...s} />
      <Path d="M3.6 15.6 H7.6" {...s} />
      <Path d="M16.4 8.4 H20.4" {...s} />
      <Path d="M16.4 12 H20.4" {...s} />
      <Path d="M16.4 15.6 H20.4" {...s} />
    </IconFrame>
  );
}

/** Telefoon — technologie. */
export function IconDevice({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Rect x={6.8} y={3} width={10.4} height={18} rx={2.4} {...s} />
      <Path d="M10.8 17.8 H13.2" {...s} />
    </IconFrame>
  );
}

export function IconStar({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path
        d="M12 3.4 L14.09 9.13 L20.18 9.34 L15.38 13.1 L17.05 18.96 L12 15.55 L6.95 18.96 L8.62 13.1 L3.82 9.34 L9.91 9.13 Z"
        {...s}
      />
    </IconFrame>
  );
}

export function IconHome({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M4 10.6 L12 3.8 L20 10.6" {...s} />
      <Path d="M5.9 9 V18.6 a1.8 1.8 0 0 0 1.8 1.8 H16.3 a1.8 1.8 0 0 0 1.8 -1.8 V9" {...s} />
      <Path d="M10 20.4 V16 a2 2 0 0 1 4 0 v4.4" {...s} />
    </IconFrame>
  );
}

export function IconMusic({ size = 24, color = IVORY, strokeWidth = 1.5 }: IconProps) {
  const s = strokeProps(color, strokeWidth);
  return (
    <IconFrame size={size}>
      <Path d="M9 17.2 V6.2 L18.4 4.2 V15.2" {...s} />
      <Circle cx={6.8} cy={17.2} r={2.2} {...s} />
      <Circle cx={16.2} cy={15.2} r={2.2} {...s} />
    </IconFrame>
  );
}

export const CategoryIcons: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  food: IconFood,
  work: IconWork,
  globe: IconGlobe,
  paw: IconPaw,
  film: IconFilm,
  trophy: IconTrophy,
  device: IconDevice,
  star: IconStar,
  home: IconHome,
  music: IconMusic,
};

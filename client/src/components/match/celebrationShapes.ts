export type FillColor = "yellow" | "blue" | "cream" | "teal" | "orange";
export type RingColor = FillColor | "pink";

interface Placement {
  /** Width and height, in pixels. */
  size: number;
  /** Distance from the top of the screen, as a percentage. Negative values sit partly off-screen. */
  top: number;
  /** Distance from the left of the screen, as a percentage. Negative values sit partly off-screen. */
  left: number;
}

export type CelebrationShape =
  | ({ kind: "bubble"; color: FillColor } & Placement)
  | ({ kind: "ring"; color: RingColor } & Placement)
  | ({ kind: "sparkle"; color: FillColor } & Placement);

export const CELEBRATION_SHAPES: readonly CelebrationShape[] = [
  // Large anchors, partly off the edges
  { kind: "bubble", color: "yellow", size: 130, top: -5, left: -10 },
  { kind: "ring", color: "pink", size: 120, top: 28, left: 86 },
  { kind: "bubble", color: "teal", size: 160, top: 72, left: 84 },
  { kind: "ring", color: "blue", size: 150, top: 90, left: 28 },
  { kind: "bubble", color: "orange", size: 100, top: 42, left: -9 },

  // Medium shapes
  { kind: "bubble", color: "blue", size: 70, top: 7, left: 80 },
  { kind: "ring", color: "yellow", size: 84, top: 78, left: -5 },
  { kind: "bubble", color: "cream", size: 60, top: 88, left: 8 },
  { kind: "ring", color: "teal", size: 64, top: 3, left: 30 },
  { kind: "ring", color: "cream", size: 72, top: 15, left: 4 },
  { kind: "bubble", color: "yellow", size: 48, top: 58, left: 90 },
  { kind: "ring", color: "orange", size: 54, top: 62, left: 9 },
  { kind: "bubble", color: "cream", size: 82, top: -6, left: 60 },
  { kind: "ring", color: "pink", size: 50, top: 85, left: 86 },

  // Small bubbles
  { kind: "bubble", color: "orange", size: 26, top: 24, left: 14 },
  { kind: "bubble", color: "blue", size: 30, top: 94, left: 64 },
  { kind: "bubble", color: "teal", size: 22, top: 50, left: 5 },

  // Sparkles
  { kind: "sparkle", color: "yellow", size: 36, top: 11, left: 20 },
  { kind: "sparkle", color: "cream", size: 28, top: 48, left: 93 },
  { kind: "sparkle", color: "blue", size: 32, top: 70, left: 18 },
  { kind: "sparkle", color: "orange", size: 24, top: 33, left: 3 },
  { kind: "sparkle", color: "teal", size: 30, top: 4, left: 72 },
  { kind: "sparkle", color: "yellow", size: 26, top: 80, left: 72 },
  { kind: "sparkle", color: "cream", size: 34, top: 95, left: 45 },
  { kind: "sparkle", color: "blue", size: 22, top: 20, left: 90 },
  { kind: "sparkle", color: "orange", size: 28, top: 66, left: 95 },
];

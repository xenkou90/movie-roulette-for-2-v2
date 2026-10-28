import type { Decision } from "@movie-roulette/shared";

function vibrate(pattern: number | number[]): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function decisionHaptic(decision: Decision): void {
  vibrate(decision === "like" ? 40 : 20);
}

export function matchHaptic(): void {
  vibrate([60, 40, 60, 40, 120]);
}

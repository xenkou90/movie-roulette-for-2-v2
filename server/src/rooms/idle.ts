import { env } from "../config/env.js";
import type { Player } from "./store.js";

export interface IdleCallbacks {
  onWarning: () => void;
  onTimeout: () => void;
}

export function clearIdleTimers(player: Player): void {
  clearTimeout(player.idleWarningTimer);
  clearTimeout(player.idleTimer);
  player.idleWarningTimer = undefined;
  player.idleTimer = undefined;
}

export function startIdleTimers(
  player: Player,
  timeoutMs: number,
  callbacks: IdleCallbacks,
): void {
  clearIdleTimers(player);

  const warnAfterMs = Math.max(0, timeoutMs - env.idleWarningMs);

  player.idleWarningTimer = setTimeout(callbacks.onWarning, warnAfterMs);
  player.idleTimer = setTimeout(callbacks.onTimeout, timeoutMs);
}

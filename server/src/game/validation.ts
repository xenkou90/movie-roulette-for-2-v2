import type { Decision } from "@movie-roulette/shared";

export function isDecision(value: unknown): value is Decision {
    return value === "skip" || value === "like";
}
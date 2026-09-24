import { describe, expect, it } from "vitest";
import { applyDecision, createGameState, getIndex } from "./engine.js";

const ALICE = "alice";
const BOB = "bob";

function newGame() {
    return createGameState([ALICE, BOB]);
}

describe("createGameState", () => {
    it("starts every player at index zero", () => {
        const state = newGame();

        expect(getIndex(state, ALICE)).toBe(0);
        expect(getIndex(state, BOB)).toBe(0);
        expect(state.matchedMovieId).toBeNull();
    });
});

describe("applyDecision", () => {
    it("advances the player on a skip", () => {
        const state = newGame();

        const outcome = applyDecision(state, ALICE, 1, "skip");

        expect(outcome).toEqual({ type: "advance" });
        expect(getIndex(state, ALICE)).toBe(1);
        expect(getIndex(state, BOB)).toBe(0);
    });

    it("advances the player on an unmatched like", () => {
        const state = newGame();

        const outcome = applyDecision(state, ALICE, 1, "like");

        expect(outcome).toEqual({ type: "advance" });
        expect(getIndex(state, ALICE)).toBe(1);
    });

    it("matches when both players like the same movie", () => {
        const state = newGame();

        applyDecision(state, ALICE, 7, "like");
        const outcome = applyDecision(state, BOB, 7, "like");

        expect(outcome).toEqual({ type: "match", movieId: 7 });
        expect(state.matchedMovieId).toBe(7);
    });

    it("does not match when players like different movies", () => {
        const state = newGame();

        applyDecision(state, ALICE, 1, "like");
        const outcome = applyDecision(state, BOB, 2, "like");

        expect(outcome).toEqual({ type: "advance" });
        expect(state.matchedMovieId).toBeNull();
    });

    it("reports when a player skips a movie the partner liked", () => {
        const state = newGame();

        applyDecision(state, ALICE, 3, "like");
        const outcome = applyDecision(state, BOB, 3, "skip");

        expect(outcome).toEqual({ type: "partner_passed" });
    });

    it("does not report a pass when nobody liked the movie", () => {
        const state = newGame();

        const outcome = applyDecision(state, BOB, 3, "skip");

        expect(outcome).toEqual({ type: "advance" });
    });

    it("matches regardless of which player likes the movie first", () => {
        const state = newGame();

        applyDecision(state, BOB, 9, "like");
        const outcome = applyDecision(state, ALICE, 9, "like");

        expect(outcome).toEqual({ type: "match", movieId: 9 });
    });

    it("allows likes to accumulate out of order", () => {
        const state = newGame();

        applyDecision(state, ALICE, 1, "like");
        applyDecision(state, ALICE, 2, "like");
        applyDecision(state, ALICE, 3, "like");

        applyDecision(state, BOB, 1, "skip");
        const outcome = applyDecision(state, BOB, 2, "like");

        expect(outcome).toEqual({ type: "match", movieId: 2 });
        expect(getIndex(state, ALICE)).toBe(3);
        expect(getIndex(state, BOB)).toBe(2);
    });

    it("ignores decisions once a match exists", () => {
        const state = newGame();

        applyDecision(state, ALICE, 5, "like");
        applyDecision(state, BOB, 5, "like");

        const outcome = applyDecision(state, ALICE, 6, "like");

        expect(outcome).toEqual({ type: "already_matched" });
        expect(state.matchedMovieId).toBe(5);
        expect(getIndex(state, ALICE)).toBe(1);
    });

    it("rejects decisions from unknown players", () => {
        const state = newGame();

        const outcome = applyDecision(state, "stranger", 1, "like");

        expect(outcome).toEqual({ type: "out_of_turn" });
    });
});
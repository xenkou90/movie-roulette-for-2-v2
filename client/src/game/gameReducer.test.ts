import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState, type GameState } from "./gameReducer";
import { makeMovie } from "../test/fixtures";

type PlayingState = Extract<GameState, { status: "playing" }>;
type MatchedState = Extract<GameState, { status: "matched" }>;

const dune = makeMovie({ id: 1, title: "Dune" });
const alien = makeMovie({ id: 2, title: "Alien" });

function playing(overrides: Partial<PlayingState> = {}): PlayingState {
  return {
    status: "playing",
    movie: dune,
    pending: false,
    notice: null,
    noticeId: 0,
    ...overrides,
  };
}

function matched(overrides: Partial<MatchedState> = {}): MatchedState {
  return { status: "matched", movie: dune, readyPlayerIds: [], ...overrides };
}

describe("gameReducer", () => {
  it("starts playing on the first movie", () => {
    const next = gameReducer(initialGameState, {
      type: "started",
      movie: dune,
    });

    expect(next).toEqual(playing());
  });

  it("marks a decision as pending", () => {
    const next = gameReducer(playing(), { type: "decisionSent" });

    expect(next).toEqual(playing({ pending: true }));
  });

  it("moves to the next movie and clears pending", () => {
    const next = gameReducer(playing({ pending: true }), {
      type: "advanced",
      movie: alien,
      partnerAlreadyPassed: false,
    });

    expect(next).toEqual(playing({ movie: alien }));
  });

  it("shows the already-passed notice when the reply says so", () => {
    const next = gameReducer(playing({ pending: true }), {
      type: "advanced",
      movie: alien,
      partnerAlreadyPassed: true,
    });

    expect(next).toEqual(
      playing({ movie: alien, notice: "partner_already_passed", noticeId: 1 }),
    );
  });

  it("shows a retry notice when the next movie fails to load", () => {
    const next = gameReducer(playing({ pending: true }), {
      type: "decisionRejected",
      error: "queue_unavailable",
    });

    expect(next).toEqual(playing({ notice: "next_movie_failed", noticeId: 1 }));
  });

  it("clears pending without a notice for a stale decision", () => {
    const next = gameReducer(playing({ pending: true }), {
      type: "decisionRejected",
      error: "stale_decision",
    });

    expect(next).toEqual(playing());
  });

  it("gives every repeated notice a new id", () => {
    const once = gameReducer(playing(), { type: "partnerPassed" });
    const twice = gameReducer(once, { type: "partnerPassed" });

    expect(twice).toEqual(playing({ notice: "partner_passed", noticeId: 2 }));
  });

  it("ignores a late next movie after a match", () => {
    const state = matched();

    const next = gameReducer(state, {
      type: "advanced",
      movie: alien,
      partnerAlreadyPassed: false,
    });

    expect(next).toBe(state);
  });

  it("ignores a partner pass when no game is being played", () => {
    const next = gameReducer(initialGameState, { type: "partnerPassed" });

    expect(next).toBe(initialGameState);
  });

  it("applies details to the movie on screen", () => {
    const detailed = { ...dune, runtimeMinutes: 155, imdbId: "tt1160419" };

    const next = gameReducer(playing(), {
      type: "movieDetails",
      movie: detailed,
    });

    expect(next).toEqual(playing({ movie: detailed }));
  });

  it("ignores details for a different movie", () => {
    const state = playing();
    const detailed = { ...alien, runtimeMinutes: 117 };

    const next = gameReducer(state, { type: "movieDetails", movie: detailed });

    expect(next).toBe(state);
  });

  it("keeps a match when the partner leaves, but clears readiness", () => {
    const next = gameReducer(matched({ readyPlayerIds: ["sofia"] }), {
      type: "partnerLeft",
    });

    expect(next).toEqual(matched({ readyPlayerIds: [] }));
  });

  it("ends the game when the partner leaves mid-game", () => {
    const next = gameReducer(playing(), { type: "partnerLeft" });

    expect(next).toEqual(initialGameState);
  });

  it("records who is ready to play again", () => {
    const next = gameReducer(matched(), {
      type: "rematchStatus",
      readyPlayerIds: ["sofia", "marco"],
    });

    expect(next).toEqual(matched({ readyPlayerIds: ["sofia", "marco"] }));
  });

  it("restores state from each kind of server snapshot", () => {
    expect(
      gameReducer(playing(), {
        type: "restored",
        snapshot: { status: "none" },
      }),
    ).toEqual(initialGameState);

    expect(
      gameReducer(initialGameState, {
        type: "restored",
        snapshot: { status: "playing", movie: alien },
      }),
    ).toEqual(playing({ movie: alien }));

    expect(
      gameReducer(initialGameState, {
        type: "restored",
        snapshot: { status: "matched", movie: dune, readyPlayerIds: ["marco"] },
      }),
    ).toEqual(matched({ readyPlayerIds: ["marco"] }));
  });

  it("resets to idle", () => {
    const next = gameReducer(matched(), { type: "reset" });

    expect(next).toEqual(initialGameState);
  });

  it("never changes the state it was given", () => {
    const before = Object.freeze(playing({ pending: true }));

    const after = gameReducer(before, {
      type: "advanced",
      movie: alien,
      partnerAlreadyPassed: false,
    });

    expect(before.pending).toBe(true);
    expect(after).not.toBe(before);
  });
});

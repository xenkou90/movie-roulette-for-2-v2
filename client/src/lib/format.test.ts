import { describe, expect, it } from "vitest";
import { formatRuntime, formatTimeLeft } from "./format";

describe("formatRuntime", () => {
  it("shows minutes alone when under an hour", () => {
    expect(formatRuntime(45)).toBe("45m");
  });

  it("shows hours alone when there are no extra minutes", () => {
    expect(formatRuntime(120)).toBe("2h");
  });

  it("shows hours and minutes together", () => {
    expect(formatRuntime(138)).toBe("2h 18m");
  });

  it("handles a single extra minute", () => {
    expect(formatRuntime(61)).toBe("1h 1m");
  });
});

describe("formatTimeLeft", () => {
  it("counts seconds when under a minute", () => {
    expect(formatTimeLeft(45)).toBe("45 seconds");
  });

  it("uses the singular for a single second", () => {
    expect(formatTimeLeft(1)).toBe("1 second");
  });

  it("says about a minute for sixty seconds", () => {
    expect(formatTimeLeft(60)).toBe("about a minute");
  });

  it("rounds to whole minutes", () => {
    expect(formatTimeLeft(120)).toBe("about 2 minutes");
    expect(formatTimeLeft(150)).toBe("about 3 minutes");
  });
});

import { describe, expect, it } from "vitest";
import { formatRuntime } from "./format";

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

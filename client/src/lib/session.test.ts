import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY, clearSession, loadSession, saveSession } from "./session";

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("session storage", () => {
  it("returns null when nothing has been saved", () => {
    expect(loadSession()).toBeNull();
  });

  it("loads exactly what was saved", () => {
    saveSession({ code: "12345", token: "secret-token" });

    expect(loadSession()).toEqual({ code: "12345", token: "secret-token" });
  });

  it("forgets the session when cleared", () => {
    saveSession({ code: "12345", token: "secret-token" });

    clearSession();

    expect(loadSession()).toBeNull();
  });

  it("ignores stored data that isn't valid JSON", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadSession()).toBeNull();
  });

  it("ignores stored data with the wrong shape", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code: 12345, token: "secret-token" }),
    );

    expect(loadSession()).toBeNull();
  });

  it("treats storage that can't be read as no session", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage is blocked");
    });

    expect(loadSession()).toBeNull();
  });

  it("doesn't crash when storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage is full");
    });

    expect(() =>
      saveSession({ code: "12345", token: "secret-token" }),
    ).not.toThrow();
  });
});

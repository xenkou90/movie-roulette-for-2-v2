import { describe, expect, it, vi } from "vitest";
import { backoffDelay, withRetry } from "./retry.js";

function recordingSleep() {
  const delays: number[] = [];
  return {
    delays,
    sleep: async (ms: number) => {
      delays.push(ms);
    },
  };
}

describe("backoffDelay", () => {
  it("doubles the delay with each attempt", () => {
    const alwaysMax = () => 1;

    expect(backoffDelay(1, 100, alwaysMax)).toBe(100);
    expect(backoffDelay(2, 100, alwaysMax)).toBe(200);
    expect(backoffDelay(3, 100, alwaysMax)).toBe(400);
  });

  it("keeps jitter between half and the full delay", () => {
    expect(backoffDelay(3, 100, () => 0)).toBe(200);
    expect(backoffDelay(3, 100, () => 1)).toBe(400);
  });
});

describe("withRetry", () => {
  it("returns the first successful result without retrying", async () => {
    const { delays, sleep } = recordingSleep();
    const operation = vi.fn(async () => "ok");

    const result = await withRetry(operation, {
      attempts: 3,
      baseDelayMs: 100,
      shouldRetry: () => true,
      sleep,
    });

    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
    expect(delays).toEqual([]);
  });

  it("retries retryable failures until one succeeds", async () => {
    const { delays, sleep } = recordingSleep();
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValueOnce(new Error("second"))
      .mockResolvedValueOnce("ok");

    const result = await withRetry(operation, {
      attempts: 3,
      baseDelayMs: 100,
      shouldRetry: () => true,
      sleep,
      random: () => 1,
    });

    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(delays).toEqual([100, 200]);
  });

  it("does not retry errors that should not be retried", async () => {
    const { delays, sleep } = recordingSleep();
    const failure = new Error("permanent");
    const operation = vi.fn(async () => {
      throw failure;
    });

    await expect(
      withRetry(operation, {
        attempts: 3,
        baseDelayMs: 100,
        shouldRetry: () => false,
        sleep,
      }),
    ).rejects.toBe(failure);

    expect(operation).toHaveBeenCalledTimes(1);
    expect(delays).toEqual([]);
  });

  it("gives up after the last attempt and rethrows the last error", async () => {
    const { delays, sleep } = recordingSleep();
    const lastFailure = new Error("third");
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValueOnce(new Error("second"))
      .mockRejectedValueOnce(lastFailure);

    await expect(
      withRetry(operation, {
        attempts: 3,
        baseDelayMs: 100,
        shouldRetry: () => true,
        sleep,
      }),
    ).rejects.toBe(lastFailure);

    expect(operation).toHaveBeenCalledTimes(3);
    expect(delays).toHaveLength(2);
  });

  it("reports each retry before waiting", async () => {
    const { sleep } = recordingSleep();
    const onRetry = vi.fn();
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("flaky"))
      .mockResolvedValueOnce("ok");

    await withRetry(operation, {
      attempts: 3,
      baseDelayMs: 100,
      shouldRetry: () => true,
      onRetry,
      sleep,
      random: () => 1,
    });

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 100);
  });
});
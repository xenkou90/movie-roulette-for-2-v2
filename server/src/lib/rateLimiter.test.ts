import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimiter.js";

function fakeClock() {
  let time = 0;
  const sleeps: number[] = [];

  return {
    sleeps,
    now: () => time,
    advance: (ms: number) => {
      time += ms;
    },
    sleep: async (ms: number) => {
      sleeps.push(ms);
      time += ms;
    },
  };
}

describe("createRateLimiter", () => {
  it("lets a full burst through without waiting", async () => {
    const clock = fakeClock();
    const acquire = createRateLimiter({
      ratePerSecond: 10,
      burst: 3,
      now: clock.now,
      sleep: clock.sleep,
    });

    await acquire();
    await acquire();
    await acquire();

    expect(clock.sleeps).toEqual([]);
  });

  it("waits for a token once the burst is used up", async () => {
    const clock = fakeClock();
    const acquire = createRateLimiter({
      ratePerSecond: 10,
      burst: 3,
      now: clock.now,
      sleep: clock.sleep,
    });

    await acquire();
    await acquire();
    await acquire();
    await acquire();

    expect(clock.sleeps).toEqual([100]);
  });

  it("refills tokens as time passes, up to the burst size", async () => {
    const clock = fakeClock();
    const acquire = createRateLimiter({
      ratePerSecond: 10,
      burst: 3,
      now: clock.now,
      sleep: clock.sleep,
    });

    await acquire();
    await acquire();
    await acquire();

    clock.advance(10_000);

    await acquire();
    await acquire();
    await acquire();

    expect(clock.sleeps).toEqual([]);

    await acquire();

    expect(clock.sleeps).toEqual([100]);
  });

  it("serves waiting callers in the order they asked", async () => {
    const clock = fakeClock();
    const acquire = createRateLimiter({
      ratePerSecond: 10,
      burst: 1,
      now: clock.now,
      sleep: clock.sleep,
    });

    const order: number[] = [];

    await Promise.all(
      [1, 2, 3, 4].map((caller) =>
        acquire().then(() => {
          order.push(caller);
        }),
      ),
    );

    expect(order).toEqual([1, 2, 3, 4]);
    expect(clock.sleeps).toEqual([100, 100, 100]);
  });
});
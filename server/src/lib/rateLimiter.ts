export interface RateLimiterOptions {
  ratePerSecond: number;
  burst: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createRateLimiter(
  options: RateLimiterOptions,
): () => Promise<void> {
  const {
    ratePerSecond,
    burst,
    now = Date.now,
    sleep = defaultSleep,
  } = options;

  let tokens = burst;
  let lastRefill = now();
  let queue: Promise<void> = Promise.resolve();

  function Refill(): void {
    const current = now();
    const elapsedSeconds = (current - lastRefill) / 1000;
    tokens = Math.min(burst, tokens + elapsedSeconds * ratePerSecond);
    lastRefill = current;
  }

  async function takeToken(): Promise<void> {
    Refill();

    if (tokens < 1) {
      const waitMs = ((1 - tokens) / ratePerSecond) * 1000;
      await sleep(waitMs);
      Refill();
    }

    tokens -= 1;
  }

  return function acquire(): Promise<void> {
    const turn = queue.then(takeToken);
    queue = turn.catch(() => {
      // Keep the queue moving even if a turn somehow fails.
    });
    return turn;
  };
}

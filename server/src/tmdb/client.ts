import { env } from "../config/env.js";
import { createRateLimiter } from "../lib/rateLimiter.js";
import { withRetry } from "../lib/retry.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 400;

const waitForRateLimit = createRateLimiter({ ratePerSecond: 20, burst: 10 });

interface TmdbErrorOptions {
  status?: number;
  retryable?: boolean;
  cause?: unknown;
}

export class TmdbError extends Error {
  readonly status: number | undefined;
  readonly retryable: boolean;

  constructor(message: string, options: TmdbErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "TmdbError";
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

function isRetryable(error: unknown): boolean {
  return error instanceof TmdbError && error.retryable;
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function tmdbFetchOnce<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  await waitForRateLimit();

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", env.tmdbApiKey);
  url.searchParams.set("language", "en-US");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new TmdbError(`Network request to TMDB failed: ${path}`, {
      retryable: true,
      cause,
    });
  }

  if (!response.ok) {
    throw new TmdbError(`TMDB responded with ${response.status} for ${path}`, {
      status: response.status,
      retryable: isRetryableStatus(response.status),
    });
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new TmdbError(`Could not parse TMDB response: ${path}`, { cause });
  }
}

export function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  return withRetry(() => tmdbFetchOnce<T>(path, params), {
    attempts: MAX_ATTEMPTS,
    baseDelayMs: BASE_RETRY_DELAY_MS,
    shouldRetry: isRetryable,
    onRetry: (error, attempt, delayMs) => {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(
        `[tmdb] attempt ${attempt} failed (${reason}); retrying in ${Math.round(delayMs)}ms`,
      );
    },
  });
}

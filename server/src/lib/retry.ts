export interface RetryOptions {
    attempts: number;
    baseDelayMs: number;
    shouldRetry: (error: unknown) => boolean;
    onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
    sleep?: (ms: number) => Promise<void>;
    random?: () => number;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function backoffDelay(
    attempt: number,
    baseDelayMs: number,
    random: () => number,
): number {
    const exponential = baseDelayMs * 2 ** (attempt - 1);
    return exponential / 2 + random() * (exponential / 2);
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
): Promise<T> {
    const {
        attempts,
        baseDelayMs,
        shouldRetry,
        onRetry,
        sleep = defaultSleep,
        random = Math.random,
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === attempts || !shouldRetry(error)) {
                break;
            }

            const delayMs = backoffDelay(attempt, baseDelayMs, random);
            onRetry?.(error, attempt, delayMs);
            await sleep(delayMs);
        }
    }
    throw lastError;
}
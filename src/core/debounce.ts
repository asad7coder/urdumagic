/**
 * Returns a debounced function that invokes `fn` after `waitMs` of quiet time.
 * Only the last scheduled call runs (trailing edge).
 *
 * @param fn - Function to debounce
 * @param waitMs - Milliseconds to wait after the last call
 * @returns Debounced function with `cancel()` to clear pending timers
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  waitMs: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return debounced as typeof debounced & { cancel: () => void };
}

/**
 * Rate-limits async work so consecutive executions are at least `minGapMs` apart.
 * Queued calls run in order; each waits for the previous to finish plus the gap.
 */
export function createAsyncRateLimiter(minGapMs: number): {
  schedule<T>(task: () => Promise<T>): Promise<T>;
} {
  let chain: Promise<void> = Promise.resolve();
  let lastEnd = 0;

  return {
    schedule<T>(task: () => Promise<T>): Promise<T> {
      const run = async (): Promise<T> => {
        const now = Date.now();
        const wait = Math.max(0, minGapMs - (now - lastEnd));
        if (wait > 0) await delay(wait);
        try {
          return await task();
        } finally {
          lastEnd = Date.now();
        }
      };

      const p = chain.then(run, run);
      chain = p.then(
        () => undefined,
        () => undefined,
      );
      return p;
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

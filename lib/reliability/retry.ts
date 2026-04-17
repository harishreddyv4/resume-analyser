type RetryContext = {
  attempt: number;
  attempts: number;
  error: unknown;
  label: string;
};

type RetryArgs<T> = {
  label: string;
  attempts: number;
  run: () => Promise<T>;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (context: RetryContext) => void;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(args: RetryArgs<T>): Promise<T> {
  const attempts = Math.max(1, args.attempts);
  const baseDelayMs = args.baseDelayMs ?? 350;
  const maxDelayMs = args.maxDelayMs ?? 2500;
  const shouldRetry = args.shouldRetry ?? (() => true);

  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await args.run();
    } catch (error) {
      lastErr = error;
      const canRetry = attempt < attempts && shouldRetry(error, attempt);
      if (!canRetry) {
        break;
      }
      args.onRetry?.({
        attempt,
        attempts,
        error,
        label: args.label,
      });
      const exponential = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * 120);
      await delay(Math.min(maxDelayMs, exponential + jitter));
    }
  }

  throw lastErr;
}

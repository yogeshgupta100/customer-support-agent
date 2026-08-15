export interface WithRetryOptions {
  retries?: number;
  backoffMs?: number;
  onRetry?: (attempt: number, error: unknown) => void | Promise<void>;
}

export async function withRetry<T>(fn: () => Promise<T>, options: WithRetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const backoffMs = options.backoffMs ?? 300;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await options.onRetry?.(attempt + 1, err);
      await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
    }
  }
  throw lastError;
}

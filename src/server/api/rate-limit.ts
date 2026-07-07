import "server-only";

/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Limits are per server instance and reset on restart/cold start — good
 * enough as an abuse brake for a single-instance deployment, not a
 * distributed guarantee. If the app ever scales to many serverless
 * instances, swap this for a shared store (e.g. Redis).
 */
const buckets = new Map<string, number[]>();

const SWEEP_THRESHOLD = 10_000;

function sweep(now: number, windowMs: number) {
  for (const [key, timestamps] of buckets) {
    if (timestamps.every((t) => t <= now - windowMs)) {
      buckets.delete(key);
    }
  }
}

/**
 * Records an attempt for `key` and returns whether it is allowed:
 * true = proceed, false = over the limit for the current window.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();

  if (buckets.size > SWEEP_THRESHOLD) {
    sweep(now, windowMs);
  }

  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

// In-memory sliding-window limiter. Good enough for a single-process
// deployment (no Redis/shared store here) — resets if the process restarts.
const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function getClientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

export function isRateLimited(key) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function clearAttempts(key) {
  attempts.delete(key);
}

// Circuit-breaker pour Lovable AI Gateway (Hystrix-like, 3 états)
// État partagé en mémoire par instance d'Edge Function.
// La persistance DB est optionnelle et purement informationnelle (observabilité).

export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface BreakerConfig {
  failureThreshold: number;       // nb échecs avant OPEN
  failureWindowMs: number;        // fenêtre glissante de comptage
  openDurationMs: number;         // durée OPEN avant HALF_OPEN
  halfOpenMaxAttempts: number;    // tentatives autorisées en HALF_OPEN
}

const DEFAULT_CONFIG: BreakerConfig = {
  failureThreshold: 3,
  failureWindowMs: 2 * 60 * 1000,    // 2 min
  openDurationMs: 60 * 1000,         // 60s
  halfOpenMaxAttempts: 1,
};

// État global par "key" (ex: "ai-gateway")
interface BreakerInternalState {
  state: BreakerState;
  failures: number[];              // timestamps des échecs récents
  openedAt: number | null;
  halfOpenAttempts: number;
}

const breakers = new Map<string, BreakerInternalState>();

function getOrCreate(key: string): BreakerInternalState {
  let s = breakers.get(key);
  if (!s) {
    s = { state: "CLOSED", failures: [], openedAt: null, halfOpenAttempts: 0 };
    breakers.set(key, s);
  }
  return s;
}

/** Returns the current state, transitioning from OPEN→HALF_OPEN if cooldown elapsed. */
export function getBreakerState(key: string, config: Partial<BreakerConfig> = {}): BreakerState {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const s = getOrCreate(key);

  if (s.state === "OPEN" && s.openedAt && Date.now() - s.openedAt >= cfg.openDurationMs) {
    s.state = "HALF_OPEN";
    s.halfOpenAttempts = 0;
  }
  return s.state;
}

/** Throws if breaker is OPEN (or HALF_OPEN with quota exceeded). Otherwise allows the call. */
export function assertCanCall(key: string, config: Partial<BreakerConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = getBreakerState(key, config);
  const s = getOrCreate(key);

  if (state === "OPEN") {
    throw new BreakerOpenError(key);
  }
  if (state === "HALF_OPEN") {
    if (s.halfOpenAttempts >= cfg.halfOpenMaxAttempts) {
      throw new BreakerOpenError(key);
    }
    s.halfOpenAttempts += 1;
  }
}

/** Mark a successful call: resets failures and closes the breaker if it was HALF_OPEN. */
export function recordSuccess(key: string): void {
  const s = getOrCreate(key);
  s.failures = [];
  s.openedAt = null;
  s.halfOpenAttempts = 0;
  s.state = "CLOSED";
}

/** Mark a failed call. Opens the breaker if threshold reached. */
export function recordFailure(key: string, config: Partial<BreakerConfig> = {}): BreakerState {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const s = getOrCreate(key);
  const now = Date.now();

  // Garder uniquement les échecs dans la fenêtre
  s.failures = s.failures.filter((t) => now - t <= cfg.failureWindowMs);
  s.failures.push(now);

  if (s.state === "HALF_OPEN") {
    // Échec en HALF_OPEN → re-OPEN immédiat
    s.state = "OPEN";
    s.openedAt = now;
    s.halfOpenAttempts = 0;
    return s.state;
  }

  if (s.failures.length >= cfg.failureThreshold) {
    s.state = "OPEN";
    s.openedAt = now;
  }
  return s.state;
}

export class BreakerOpenError extends Error {
  public readonly code = "breaker_open";
  constructor(key: string) {
    super(`Circuit breaker OPEN for "${key}" — service temporarily unavailable`);
    this.name = "BreakerOpenError";
  }
}

/** Snapshot pour log / observabilité. */
export function getBreakerSnapshot(key: string) {
  const s = getOrCreate(key);
  return {
    key,
    state: s.state,
    failures_in_window: s.failures.length,
    opened_at: s.openedAt ? new Date(s.openedAt).toISOString() : null,
  };
}

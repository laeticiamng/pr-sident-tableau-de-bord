/**
 * Supabase boot diagnostics
 * ------------------------------------------------------------------
 * Détecte les problèmes au démarrage du client Supabase :
 *   - variables import.meta.env manquantes
 *   - URL/clé invalide
 *   - ping initial échoué
 *
 * Toutes les erreurs sont loguées en console avec un session ID stable
 * (sessionStorage) pour faciliter le debug en production.
 */

const SESSION_KEY = "ec-boot-session-id";

export type BootIssue =
  | "missing-env-url"
  | "missing-env-key"
  | "init-failed"
  | "ping-failed";

export interface BootDiagnostics {
  sessionId: string;
  timestamp: string;
  mode: string;
  prod: boolean;
  url: string | null;
  hasUrl: boolean;
  hasKey: boolean;
  urlFromFallback: boolean;
  keyFromFallback: boolean;
  issues: BootIssue[];
  pingOk?: boolean;
  pingLatencyMs?: number;
  pingError?: string;
}

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getBootSessionId = (): string => {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = generateId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return generateId();
  }
};

export const collectBootDiagnostics = (): BootDiagnostics => {
  const env = (import.meta as unknown as { env: Record<string, unknown> }).env ?? {};
  const url = (env.VITE_SUPABASE_URL as string | undefined) ?? null;
  const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? null;
  const issues: BootIssue[] = [];
  if (!url) issues.push("missing-env-url");
  if (!key) issues.push("missing-env-key");

  return {
    sessionId: getBootSessionId(),
    timestamp: new Date().toISOString(),
    mode: (env.MODE as string) ?? "unknown",
    prod: Boolean(env.PROD),
    url,
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlFromFallback: Boolean(env.__SUPABASE_URL_FROM_FALLBACK__),
    keyFromFallback: Boolean(env.__SUPABASE_KEY_FROM_FALLBACK__),
    issues,
  };
};

let cached: BootDiagnostics | null = null;

export const getCachedBootDiagnostics = (): BootDiagnostics => {
  if (!cached) cached = collectBootDiagnostics();
  return cached;
};

export const logBootIssues = (diag: BootDiagnostics) => {
  if (diag.issues.length === 0) return;
  // Console structuré, repérable côté Sentry/Lovable logs.
  console.error("[supabase-boot]", {
    sessionId: diag.sessionId,
    issues: diag.issues,
    mode: diag.mode,
    hasUrl: diag.hasUrl,
    hasKey: diag.hasKey,
    urlFromFallback: diag.urlFromFallback,
    keyFromFallback: diag.keyFromFallback,
    timestamp: diag.timestamp,
  });
};

/**
 * Ping léger Supabase. N'utilise PAS le client SDK pour éviter d'échouer
 * si le client n'a pas pu s'initialiser. Vérifie simplement que l'URL
 * répond avec la clé anon.
 */
export const pingSupabase = async (
  diag: BootDiagnostics = getCachedBootDiagnostics(),
): Promise<{ ok: boolean; latencyMs: number; error?: string }> => {
  if (!diag.url || !diag.hasKey) {
    return { ok: false, latencyMs: 0, error: "URL ou clé Supabase manquante" };
  }
  const env = (import.meta as unknown as { env: Record<string, unknown> }).env ?? {};
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const start = performance.now();
  try {
    const res = await fetch(`${diag.url}/auth/v1/health`, {
      headers: { apikey: key },
    });
    const latencyMs = Math.round(performance.now() - start);
    if (!res.ok) {
      return { ok: false, latencyMs, error: `HTTP ${res.status}` };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : "Erreur réseau inconnue";
    console.error("[supabase-boot] ping failed", {
      sessionId: diag.sessionId,
      error: message,
    });
    return { ok: false, latencyMs, error: message };
  }
};
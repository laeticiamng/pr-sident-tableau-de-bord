import { supabase } from "@/integrations/supabase/client";

/**
 * Journal d'erreurs côté client (chunks JS, Service Worker, écran noir,
 * unhandled promise rejection, crash React).
 *
 * Insertion anonyme autorisée par RLS (table `public.client_error_logs`),
 * lecture restreinte à la Présidente. Best-effort — n'interrompt jamais
 * le rendu si l'envoi échoue (offline, blocage cookies, etc.).
 */

export type ClientErrorType =
  | "chunk_load"
  | "service_worker"
  | "react_render"
  | "unhandled_rejection"
  | "boot";

const BUILD_VERSION =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, string> }).env?.MODE) ||
  "unknown";

const SESSION_KEY = "ec_error_session";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-session";
  }
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function hasServiceWorker(): boolean {
  try {
    return Boolean(navigator.serviceWorker?.controller);
  } catch {
    return false;
  }
}

/** Anti-flood : limite à 5 envois identiques (type + message tronqué) par session. */
const sentSignatures = new Map<string, number>();
const MAX_PER_SIGNATURE = 5;

export async function logClientError(
  type: ClientErrorType,
  message: string,
): Promise<void> {
  try {
    const safeMessage = String(message ?? "").slice(0, 1000);
    if (!safeMessage) return;

    const signature = `${type}:${safeMessage.slice(0, 120)}`;
    const count = sentSignatures.get(signature) ?? 0;
    if (count >= MAX_PER_SIGNATURE) return;
    sentSignatures.set(signature, count + 1);

    await supabase.from("client_error_logs").insert({
      error_type: type,
      message: safeMessage,
      page_path:
        typeof window !== "undefined"
          ? window.location.pathname.slice(0, 500)
          : null,
      build_version: BUILD_VERSION,
      has_service_worker: hasServiceWorker(),
      in_iframe: inIframe(),
      user_agent:
        typeof navigator !== "undefined"
          ? navigator.userAgent.slice(0, 500)
          : null,
      session_id: getSessionId(),
    });
  } catch {
    // Best-effort: never break the app because logging failed.
  }
}

/**
 * Installe les listeners globaux (chunk load errors, unhandled rejections,
 * service worker errors). Appelé une seule fois depuis main.tsx.
 */
export function installGlobalErrorListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    const msg = event?.message ?? "";
    if (/Loading chunk|Importing a module script failed|Failed to fetch dynamically imported/i.test(msg)) {
      void logClientError("chunk_load", msg);
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const msg =
      reason instanceof Error ? reason.message : String(reason ?? "unknown");
    void logClientError("unhandled_rejection", msg);
  });

  // Service Worker errors (registration failed, controller change loops, etc.)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener?.("error", (event: Event) => {
      void logClientError(
        "service_worker",
        (event as ErrorEvent)?.message ?? "service worker error",
      );
    });
  }
}
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SupabaseBootGuard } from "@/components/SupabaseBootGuard";
import { collectBootDiagnostics, logBootIssues } from "@/lib/supabaseBoot";
import { installGlobalErrorListeners, logClientError } from "@/lib/clientErrorLogger";

// Log boot issues le plus tôt possible — avant même le render React.
try {
  logBootIssues(collectBootDiagnostics());
} catch {
  // noop : le diagnostic ne doit jamais bloquer le boot.
}

function shouldEnablePwaServiceWorker(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.endsWith("lovable.dev");

  return !isInIframe && !isPreviewHost;
}

/**
 * Désinscrire tout Service Worker en preview / iframe Lovable :
 * un SW PWA (cache HTML) installé sur l'app publiée provoque un écran noir
 * persistant lorsque la page est rendue dans l'iframe d'édition.
 */
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (!shouldEnablePwaServiceWorker()) {
    navigator.serviceWorker.getRegistrations?.()
      .then((regs) => Promise.all(regs.map((r) => r.unregister().catch(() => false))))
      .then(async () => {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
        } catch { /* noop */ }
      })
      .catch(() => { /* noop */ });
  }
}

if (shouldEnablePwaServiceWorker()) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => { /* PWA best-effort only */ });
}

// Listeners globaux pour journaliser chunks/SW/promise rejections.
try { installGlobalErrorListeners(); } catch { /* noop */ }

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    const reloadKey = "vite-preload-reloaded";

    try {
      if (sessionStorage.getItem(reloadKey)) return;
      sessionStorage.setItem(reloadKey, "1");
    } catch {
      // noop: continue with reload fallback
    }

    void logClientError("chunk_load", "vite:preloadError → reload");
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SupabaseBootGuard>
      <App />
    </SupabaseBootGuard>
  </StrictMode>
);

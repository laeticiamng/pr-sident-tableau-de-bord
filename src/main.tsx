import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SupabaseBootGuard } from "@/components/SupabaseBootGuard";
import { collectBootDiagnostics, logBootIssues } from "@/lib/supabaseBoot";
import { installGlobalErrorListeners, logClientError } from "@/lib/clientErrorLogger";

const BUILD_VERSION =
  (typeof window !== "undefined" &&
    (window as unknown as { __APP_BUILD__?: string }).__APP_BUILD__) ||
  import.meta.env.MODE;

if (typeof window !== "undefined") {
  try {
    (window as unknown as { __APP_BUILD__?: string }).__APP_BUILD__ = BUILD_VERSION;
    document.documentElement.setAttribute("data-app-build", BUILD_VERSION);
    document.getElementById("root")?.setAttribute("data-build", BUILD_VERSION);
  } catch { /* noop */ }
}

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

function isLegacyServiceWorker(scriptUrl?: string): boolean {
  return Boolean(scriptUrl) && !String(scriptUrl).includes("ec-pwa-sw.js");
}

async function clearApplicationCaches() {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
  } catch { /* noop */ }
}

async function unregisterServiceWorkers(options: { legacyOnly: boolean; reloadIfControlled: boolean }) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = (await navigator.serviceWorker.getRegistrations?.()) ?? [];
    const controllerUrl = navigator.serviceWorker.controller?.scriptURL;
    const controlledByLegacy = isLegacyServiceWorker(controllerUrl);
    await Promise.all(regs.map((reg) => {
      const scriptUrl = reg.active?.scriptURL ?? reg.waiting?.scriptURL ?? reg.installing?.scriptURL;
      if (options.legacyOnly && !isLegacyServiceWorker(scriptUrl)) return Promise.resolve(false);
      return reg.unregister().catch(() => false);
    }));
    await clearApplicationCaches();
    if (options.reloadIfControlled && controlledByLegacy) {
      const reloadKey = "legacy-sw-cleaned";
      try {
        if (sessionStorage.getItem(reloadKey)) return;
        sessionStorage.setItem(reloadKey, "1");
      } catch { /* noop */ }
      await logClientError("service_worker", "legacy service worker unregistered");
      window.location.replace("/?sw-cleanup=" + Date.now());
    }
  } catch { /* noop */ }
}

/**
 * Désinscrire tout Service Worker en preview / iframe Lovable :
 * un SW PWA (cache HTML) installé sur l'app publiée provoque un écran noir
 * persistant lorsque la page est rendue dans l'iframe d'édition.
 */
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (!shouldEnablePwaServiceWorker()) {
    void unregisterServiceWorkers({ legacyOnly: false, reloadIfControlled: false });
  } else {
    void unregisterServiceWorkers({ legacyOnly: true, reloadIfControlled: true });
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

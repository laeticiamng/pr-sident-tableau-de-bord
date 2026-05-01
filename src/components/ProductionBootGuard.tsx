import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function cleanupBrowserState() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
  } catch { /* noop */ }

  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
  } catch { /* noop */ }
}

function currentBuildVersion() {
  try {
    return (window as unknown as { __APP_BUILD__?: string }).__APP_BUILD__ ?? import.meta.env.MODE;
  } catch {
    return import.meta.env.MODE;
  }
}

export const ProductionBootGuard = forwardRef<HTMLDivElement, { children: ReactNode }>(function ProductionBootGuard({ children }, ref) {
  const [legacyWorker, setLegacyWorker] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-react-mounted", "true");
      document.documentElement.setAttribute("data-app-build", currentBuildVersion());
      (window as unknown as { __REACT_MOUNTED__?: boolean }).__REACT_MOUNTED__ = true;
    } catch { /* noop */ }

    const inspect = async () => {
      try {
        if (!("serviceWorker" in navigator)) return;
        const regs = await navigator.serviceWorker.getRegistrations();
        const controlledBy = navigator.serviceWorker.controller?.scriptURL ?? "";
        const hasLegacy = Boolean(controlledBy) && !controlledBy.includes("ec-pwa-sw.js");
        const hasExtraWorkers = regs.some((reg) => {
          const scriptUrl = reg.active?.scriptURL ?? reg.waiting?.scriptURL ?? reg.installing?.scriptURL ?? "";
          return scriptUrl && !scriptUrl.includes("ec-pwa-sw.js");
        });
        setLegacyWorker(hasLegacy || hasExtraWorkers);
      } catch {
        setLegacyWorker(false);
      }
    };

    void inspect();
  }, []);

  const wipeAndReload = async () => {
    setCleaning(true);
    await cleanupBrowserState();
    window.location.replace("/?cache-clean=" + Date.now());
  };

  return (
    <div ref={ref} className="contents">
      {children}
      {legacyWorker && (
        <div className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-xl">
          <Alert className="border-warning/30 bg-card/95 shadow-2xl backdrop-blur-xl">
            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden />
            <AlertTitle>Ancien cache détecté</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Une ancienne version peut perturber le chargement.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden />
                  Recharger
                </Button>
                <Button size="sm" onClick={() => void wipeAndReload()} disabled={cleaning}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden />
                  {cleaning ? "Nettoyage…" : "Vider le cache"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
});

export default ProductionBootGuard;
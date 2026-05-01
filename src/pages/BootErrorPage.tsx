import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Activity, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page d'erreur "chargement impossible" — affichée quand le boot React
 * a échoué (chunk JS manquant, Service Worker corrompu, hors-ligne, etc.).
 * Atteignable manuellement depuis le fallback HTML statique de index.html
 * via le lien "Diagnostics".
 */
export default function BootErrorPage() {
  const [clearing, setClearing] = useState(false);
  const [details, setDetails] = useState<{ build: string; sw: boolean; online: boolean }>({
    build: "unknown",
    sw: false,
    online: true,
  });

  useEffect(() => {
    setDetails({
      build: import.meta.env.MODE,
      sw: Boolean(navigator.serviceWorker?.controller),
      online: navigator.onLine,
    });
  }, []);

  const hardReload = () => {
    try { sessionStorage.clear(); } catch { /* noop */ }
    window.location.replace(window.location.origin + "/?boot=" + Date.now());
  };

  const wipeAndReload = async () => {
    setClearing(true);
    try {
      const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    } catch { /* noop */ }
    hardReload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-xl w-full border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
            </div>
            <div>
              <CardTitle>Chargement impossible</CardTitle>
              <CardDescription>
                L'application n'a pas pu démarrer. Cela arrive généralement après une mise à jour
                ou si votre cache navigateur contient une version périmée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            <li>Build : <code className="text-foreground">{details.build}</code></li>
            <li>Service Worker actif : <code className="text-foreground">{details.sw ? "oui" : "non"}</code></li>
            <li>Connexion : <code className="text-foreground">{details.online ? "en ligne" : "hors ligne"}</code></li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={hardReload} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
              Recharger la page
            </Button>
            <Button onClick={wipeAndReload} variant="outline" disabled={clearing} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" aria-hidden />
              {clearing ? "Nettoyage…" : "Vider le cache"}
            </Button>
          </div>

          <div className="pt-3 border-t text-sm text-muted-foreground">
            <p className="mb-2">
              Si le problème persiste, ouvrez les Diagnostics HQ pour partager un rapport
              détaillé avec l'équipe.
            </p>
            <Link to="/hq/diagnostics" className="inline-flex items-center gap-2 text-accent hover:underline">
              <Activity className="h-4 w-4" aria-hidden />
              Ouvrir Diagnostics HQ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

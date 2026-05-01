import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Activity, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Page d'erreur publique "chargement impossible" — affichée quand le boot
 * React a échoué (chunk JS manquant, Service Worker corrompu, hors-ligne).
 *
 * SÉCURITÉ : cette page est PUBLIQUE (atteignable sans authentification),
 * donc elle n'expose AUCUNE donnée interne :
 *  - pas de version build / mode d'environnement,
 *  - pas d'état Service Worker / cache / scope,
 *  - pas d'user-agent ni d'URL technique,
 *  - pas de message d'erreur réseau ou console,
 *  - pas de session / utilisateur.
 * Les seuls leviers offerts sont génériques : recharger la page, vider le
 * cache navigateur local (action côté client uniquement), et un lien vers
 * Diagnostics HQ — qui, lui, est protégé par authentification.
 */
export default function BootErrorPage() {
  const [clearing, setClearing] = useState(false);

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
              <CardTitle>Le chargement de l’application a échoué.</CardTitle>
              <CardDescription>
                L'application n'a pas pu démarrer. Cela arrive généralement après une mise à jour
                ou si votre cache navigateur contient une version périmée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Pour résoudre ce problème, deux actions suffisent généralement :
            recharger la page, ou vider le cache local de votre navigateur.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={hardReload} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
              Recharger
            </Button>
            <Button onClick={wipeAndReload} variant="outline" disabled={clearing} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" aria-hidden />
              {clearing ? "Nettoyage…" : "Vider le cache et recharger"}
            </Button>
          </div>

          <div className="pt-3 border-t text-sm text-muted-foreground">
            <p className="mb-2">
              Si le problème persiste, l'équipe technique peut consulter un
              rapport détaillé depuis Diagnostics HQ (accès réservé).
            </p>
            <Link
              to="/hq/diagnostics"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              <Activity className="h-4 w-4" aria-hidden />
              Ouvrir Diagnostics HQ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

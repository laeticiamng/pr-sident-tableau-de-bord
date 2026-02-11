import { useEffect, useState } from "react";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Heart,
  Compass,
  Rocket,
  Music,
  Users,
  HeartPulse,
  Trophy,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Icônes par plateforme
const iconesPlateforme: Record<string, React.ComponentType<{ className?: string }>> = {
  "emotionscare": Heart,
  "nearvity": Users,
  "system-compass": Compass,
  "growth-copilot": Rocket,
  "med-mng": Music,
  "swift-care-hub": HeartPulse,
  "track-triumph-tavern": Trophy,
};

// Couleurs d'accentuation par plateforme
const couleursAccent: Record<string, string> = {
  "emotionscare": "text-platform-health",
  "nearvity": "text-platform-social",
  "system-compass": "text-platform-compass",
  "growth-copilot": "text-platform-growth",
  "med-mng": "text-platform-medical",
  "swift-care-hub": "text-platform-emergency",
  "track-triumph-tavern": "text-platform-triumph",
};

const couleursBgAccent: Record<string, string> = {
  "emotionscare": "bg-platform-health",
  "nearvity": "bg-platform-social",
  "system-compass": "bg-platform-compass",
  "growth-copilot": "bg-platform-growth",
  "med-mng": "bg-platform-medical",
  "swift-care-hub": "bg-platform-emergency",
  "track-triumph-tavern": "bg-platform-triumph",
};

// Configuration des statuts
const configStatut = {
  production: {
    label: "Opérationnel",
    couleur: "text-success",
    bg: "bg-success",
    indicateur: "bg-status-green",
    icone: CheckCircle,
  },
  prototype: {
    label: "Prototype actif",
    couleur: "text-warning",
    bg: "bg-warning",
    indicateur: "bg-status-amber",
    icone: AlertCircle,
  },
};

export default function StatusPage() {
  const [derniereVerification, setDerniereVerification] = useState(new Date());

  // SEO : Mise à jour des métadonnées de la page
  useEffect(() => {
    document.title = "Statut des plateformes — EMOTIONSCARE";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Statut en temps réel des 7 plateformes SaaS d'EMOTIONSCARE. Vérifiez la disponibilité de chaque service."
      );
    }
    return () => {
      document.title = "EMOTIONSCARE — Siège Social Numérique";
    };
  }, []);

  const plateformesProduction = MANAGED_PLATFORMS.filter(
    (p) => p.status === "production"
  );
  const plateformesPrototype = MANAGED_PLATFORMS.filter(
    (p) => p.status === "prototype"
  );

  const rafraichir = () => {
    setDerniereVerification(new Date());
  };

  const toutOperationnel = true; // Toutes les plateformes sont actives

  return (
    <div className="flex flex-col animate-fade-in">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--accent)/0.15),transparent)]" />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6">
              <Activity className="w-4 h-4 mr-2" />
              Statut des services
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Statut des <span className="text-accent">Plateformes</span>
            </h1>

            {/* Indicateur global */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  toutOperationnel ? "bg-status-green" : "bg-status-amber"
                )}
              />
              <span className="text-white font-medium">
                {toutOperationnel
                  ? "Tous les systèmes sont opérationnels"
                  : "Certains systèmes nécessitent attention"}
              </span>
            </div>

            <p className="mt-6 text-white/60 text-sm">
              Dernière vérification :{" "}
              {derniereVerification.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* RÉSUMÉ */}
      {/* ============================================ */}
      <section className="py-8 bg-background border-b">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-green" />
                <span className="text-sm font-medium">
                  {plateformesProduction.length} en production
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-amber" />
                <span className="text-sm font-medium">
                  {plateformesPrototype.length} prototypes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-red" />
                <span className="text-sm font-medium">0 incident</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={rafraichir}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PLATEFORMES EN PRODUCTION */}
      {/* ============================================ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-success" />
              Plateformes en production
              <Badge variant="outline" className="text-xs">
                {plateformesProduction.length}
              </Badge>
            </h2>

            <div className="space-y-3">
              {plateformesProduction.map((plateforme) => {
                const Icone = iconesPlateforme[plateforme.key] || Rocket;
                const statut = configStatut.production;

                return (
                  <Card
                    key={plateforme.key}
                    className="group border-border/60 hover:border-success/30 transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        {/* Indicateur de statut */}
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full animate-pulse shrink-0",
                            statut.indicateur
                          )}
                        />

                        {/* Icône */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 shrink-0"
                          )}
                        >
                          <Icone
                            className={cn(
                              "w-5 h-5",
                              couleursAccent[plateforme.key]
                            )}
                          />
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {plateforme.name}
                            </h3>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                statut.couleur
                              )}
                            >
                              {statut.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {plateforme.shortDescription}
                          </p>
                        </div>

                        {/* Stats rapides */}
                        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">
                              {plateforme.stats.modules}
                            </div>
                            <div className="text-xs">modules</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-foreground">
                              {plateforme.stats.commits > 1000
                                ? `${(plateforme.stats.commits / 1000).toFixed(1)}K`
                                : plateforme.stats.commits}
                            </div>
                            <div className="text-xs">commits</div>
                          </div>
                        </div>

                        {/* Dernière MAJ + Lien */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(plateforme.lastCommit).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" }
                            )}
                          </div>
                          <a
                            href={plateforme.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            title={`Visiter ${plateforme.name}`}
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        </div>
                      </div>

                      {/* Lien mobile */}
                      <div className="sm:hidden mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          MAJ :{" "}
                          {new Date(plateforme.lastCommit).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                        <a
                          href={plateforme.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            couleursAccent[plateforme.key]
                          )}
                        >
                          Visiter
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PLATEFORMES PROTOTYPE */}
      {/* ============================================ */}
      <section className="py-12 md:py-16 bg-secondary/20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-warning" />
              Prototypes en développement
              <Badge variant="outline" className="text-xs">
                {plateformesPrototype.length}
              </Badge>
            </h2>

            <div className="space-y-3">
              {plateformesPrototype.map((plateforme) => {
                const Icone = iconesPlateforme[plateforme.key] || Rocket;
                const statut = configStatut.prototype;

                return (
                  <Card
                    key={plateforme.key}
                    className="group border-border/60 hover:border-warning/30 transition-all duration-300"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        {/* Indicateur de statut */}
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full animate-pulse shrink-0",
                            statut.indicateur
                          )}
                        />

                        {/* Icône */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 shrink-0">
                          <Icone
                            className={cn(
                              "w-5 h-5",
                              couleursAccent[plateforme.key]
                            )}
                          />
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {plateforme.name}
                            </h3>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                statut.couleur
                              )}
                            >
                              {statut.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {plateforme.shortDescription}
                          </p>
                        </div>

                        {/* Stats rapides */}
                        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">
                              {plateforme.stats.modules}
                            </div>
                            <div className="text-xs">modules</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-foreground">
                              {plateforme.stats.commits}
                            </div>
                            <div className="text-xs">commits</div>
                          </div>
                        </div>

                        {/* Dernière MAJ + Lien */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(plateforme.lastCommit).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" }
                            )}
                          </div>
                          <a
                            href={plateforme.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            title={`Visiter ${plateforme.name}`}
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        </div>
                      </div>

                      {/* Lien mobile */}
                      <div className="sm:hidden mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          MAJ :{" "}
                          {new Date(plateforme.lastCommit).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                        <a
                          href={plateforme.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            couleursAccent[plateforme.key]
                          )}
                        >
                          Visiter
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LÉGENDE ET INFORMATIONS */}
      {/* ============================================ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-lg font-semibold mb-6">Légende des statuts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="w-3 h-3 rounded-full bg-status-green" />
                <div>
                  <div className="text-sm font-medium">Opérationnel</div>
                  <div className="text-xs text-muted-foreground">
                    Service disponible et fonctionnel
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="w-3 h-3 rounded-full bg-status-amber" />
                <div>
                  <div className="text-sm font-medium">Prototype</div>
                  <div className="text-xs text-muted-foreground">
                    En cours de développement
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="w-3 h-3 rounded-full bg-status-red" />
                <div>
                  <div className="text-sm font-medium">Incident</div>
                  <div className="text-xs text-muted-foreground">
                    Service temporairement indisponible
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              EMOTIONSCARE SASU — SIREN 944 505 445 — Amiens, France
              <br />
              Les données de statut sont mises à jour en continu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DELIVERY_PHASES, PLATFORM_COMPLETION_ITEMS } from "@/data/platformCompletionPlan";
import { CheckCircle2, Clock3, ListChecks } from "lucide-react";

const statusLabelMap = {
  complet: { label: "Complet", variant: "success" as const },
  en_cours: { label: "En cours", variant: "warning" as const },
  a_planifier: { label: "À planifier", variant: "secondary" as const },
};

export function PlatformCompletionRoadmap() {
  const progressionGlobale =
    (PLATFORM_COMPLETION_ITEMS.reduce((sum, item) => sum + item.modulesCompletes, 0) /
      PLATFORM_COMPLETION_ITEMS.reduce((sum, item) => sum + item.modulesTotal, 0)) *
    100;

  return (
    <div className="space-y-6">
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Complétude plateforme par plateforme
          </CardTitle>
          <CardDescription>
            Vérification détaillée des 7 plateformes avec prochaine étape de livraison.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-semibold">{progressionGlobale.toFixed(0)}%</span>
            </div>
            <Progress value={progressionGlobale} />
          </div>

          <div className="space-y-3">
            {PLATFORM_COMPLETION_ITEMS.map((platform) => {
              const completionPct = (platform.modulesCompletes / platform.modulesTotal) * 100;
              const status = statusLabelMap[platform.statut];

              return (
                <div key={platform.key} className="rounded-lg border border-border/70 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{platform.nom}</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Modules complétés: {platform.modulesCompletes}/{platform.modulesTotal}
                      </span>
                      <span>{completionPct.toFixed(0)}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>
                  <p className="text-sm text-muted-foreground">Prochaine étape: {platform.prochaineEtape}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Plan complet de livraison (adapté Lovable.dev)
          </CardTitle>
          <CardDescription>
            Plan d'exécution en 3 phases pour finaliser la plateforme HQ dans l'environnement actuel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DELIVERY_PHASES.map((phase) => (
            <div key={phase.phase} className="rounded-lg border border-border/70 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-accent" />
                <h3 className="font-semibold">{phase.phase}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{phase.objectif}</p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {phase.livrables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground border-l-2 border-accent/40 pl-3">
                Adaptation Lovable.dev: {phase.environnementLovable}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings, 
  GitBranch, 
  GitPullRequest,
  Bug,
  Rocket,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useExecuteRun, usePlatforms } from "@/hooks/useHQData";

const deliveryKPIs = [
  { label: "Lead Time", value: "—", description: "Temps moyen de livraison" },
  { label: "Deploy Freq.", value: "—", description: "Déploiements par semaine" },
  { label: "Bug Rate", value: "—", description: "Bugs par release" },
  { label: "MTTR", value: "—", description: "Temps de résolution" },
];

export default function EngineeringPage() {
  const executeRun = useExecuteRun();
  const { data: platforms, isLoading } = usePlatforms();
  const [runningCheck, setRunningCheck] = useState<string | null>(null);

  const handleReleaseGateCheck = async (platformKey: string) => {
    setRunningCheck(platformKey);
    try {
      await executeRun.mutateAsync({ 
        run_type: "RELEASE_GATE_CHECK",
        platform_key: platformKey
      });
    } finally {
      setRunningCheck(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Engineering Command</h1>
          <p className="text-muted-foreground text-lg">
            Delivery, releases et santé technique.
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync GitHub
        </Button>
      </div>

      {/* Delivery KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {deliveryKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">{kpi.value}</div>
              <div className="text-sm font-medium">{kpi.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Engineering Status */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            Statut Engineering par Plateforme
          </CardTitle>
          <CardDescription>
            Gate checks et releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {platforms?.map((platform) => (
                <div 
                  key={platform.key}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${
                      platform.status === "green" ? "bg-success" :
                      platform.status === "amber" ? "bg-warning" : "bg-destructive"
                    }`} />
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          main
                        </span>
                        <span className="flex items-center gap-1">
                          <GitPullRequest className="h-3 w-3" />
                          — PRs
                        </span>
                        <span className="flex items-center gap-1">
                          <Bug className="h-3 w-3" />
                          — issues
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReleaseGateCheck(platform.key)}
                    disabled={runningCheck === platform.key}
                  >
                    {runningCheck === platform.key ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Gate Check
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Releases */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-primary" />
              Releases Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune release récente</p>
              <p className="text-sm mt-1">
                Connectez GitHub pour synchroniser les releases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="h-5 w-5 text-primary" />
              Issues Ouvertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune issue ouverte</p>
              <p className="text-sm mt-1">
                Connectez GitHub pour synchroniser les issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Release Checklist */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            Checklist de Release
          </CardTitle>
          <CardDescription>
            Critères de validation avant déploiement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Tests unitaires passés", status: "pending" },
              { label: "Code review approuvé", status: "pending" },
              { label: "Documentation à jour", status: "pending" },
              { label: "Audit sécurité OK", status: "pending" },
              { label: "Performance validée", status: "pending" },
              { label: "Rollback plan prêt", status: "pending" },
            ].map((item) => (
              <div 
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

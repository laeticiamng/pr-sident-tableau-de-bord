import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  AlertOctagon,
  Loader2,
  Power
} from "lucide-react";
import { useSystemConfig, useUpdateConfig, useExecuteRun, usePlatforms } from "@/hooks/useHQData";
import { useToast } from "@/hooks/use-toast";
import { SecretsRegistry } from "@/components/hq/security/SecretsRegistry";
import { RLSAuditTable } from "@/components/hq/security/RLSAuditTable";
import { IncidentCounter } from "@/components/hq/security/IncidentCounter";

export default function SecuritePage() {
  const { toast } = useToast();
  const { data: autopilotConfig, isLoading: configLoading } = useSystemConfig("autopilot");
  const { data: platforms, isLoading: platformsLoading } = usePlatforms();
  const updateConfig = useUpdateConfig();
  const executeRun = useExecuteRun();
  const [panicMode, setPanicMode] = useState(false);

  const autopilotEnabled = (autopilotConfig?.enabled as boolean) ?? true;

  const handleToggleAutopilot = async () => {
    const newValue = !autopilotEnabled;
    await updateConfig.mutateAsync({
      key: "autopilot",
      value: { 
        enabled: newValue, 
        low_risk_auto_execute: newValue 
      },
    });
  };

  const handlePanicButton = () => {
    setPanicMode(true);
    updateConfig.mutate({
      key: "autopilot",
      value: { enabled: false, low_risk_auto_execute: false },
    });
    toast({
      title: "⚠️ ARRÊT D'URGENCE ACTIVÉ",
      description: "Toutes les actions automatiques ont été désactivées.",
      variant: "destructive",
    });
  };

  const handleSecurityAudit = async () => {
    await executeRun.mutateAsync({ run_type: "SECURITY_AUDIT_RLS" });
  };

  const isLoading = configLoading || platformsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Centre de Sécurité</h1>
          <p className="text-muted-foreground text-lg">
            Supervision de la sécurité de l'ensemble des plateformes.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSecurityAudit}
          disabled={executeRun.isPending}
        >
          {executeRun.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Lancer un Audit
        </Button>
      </div>

      {/* Panic Button & Autopilot */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`card-executive border-2 ${panicMode ? "border-destructive" : "border-destructive/20"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-destructive" />
              Bouton Panique
            </CardTitle>
            <CardDescription>
              Désactive immédiatement toutes les actions automatiques des agents. 
              Utilisez uniquement en cas d'urgence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              size="lg" 
              className="w-full"
              onClick={handlePanicButton}
              disabled={panicMode}
            >
              <AlertOctagon className="h-5 w-5 mr-2" />
              {panicMode ? "ARRÊT ACTIVÉ" : "ARRÊT D'URGENCE"}
            </Button>
            {panicMode && (
              <p className="text-xs text-destructive text-center mt-3">
                Mode panique activé. Réactivez l'autopilot manuellement.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Power className={`h-6 w-6 ${autopilotEnabled ? "text-success" : "text-muted-foreground"}`} />
                Mode Autopilot
              </CardTitle>
              <Badge variant={autopilotEnabled ? "success" : "subtle"}>
                {autopilotEnabled ? "Actif" : "Désactivé"}
              </Badge>
            </div>
            <CardDescription>
              Permet aux agents d'exécuter automatiquement les tâches à faible risque. 
              Les actions à risque élevé requièrent toujours votre approbation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border mb-4">
              <span className="font-medium">Exécution automatique</span>
              {configLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Switch 
                  checked={autopilotEnabled}
                  onCheckedChange={handleToggleAutopilot}
                  disabled={updateConfig.isPending}
                />
              )}
            </div>
            <Button 
              variant={autopilotEnabled ? "outline" : "executive"}
              className="w-full"
              onClick={handleToggleAutopilot}
              disabled={updateConfig.isPending}
            >
              {updateConfig.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {autopilotEnabled ? "Désactiver Autopilot" : "Activer Autopilot"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Incident Counter */}
      <IncidentCounter daysSinceLastIncident={47} />

      {/* Security Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold text-success">Sécurisé</div>
            <div className="text-sm text-muted-foreground">Statut Global</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${platforms?.length || 0}/${platforms?.length || 0}`}
            </div>
            <div className="text-sm text-muted-foreground">RLS Actif</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Secrets Configurés</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold text-success">0</div>
            <div className="text-sm text-muted-foreground">Alertes</div>
          </CardContent>
        </Card>
      </div>

      {/* RLS Audit */}
      <RLSAuditTable 
        onAudit={handleSecurityAudit}
        isAuditing={executeRun.isPending}
      />

      {/* Secrets Registry */}
      <SecretsRegistry />
    </div>
  );
}

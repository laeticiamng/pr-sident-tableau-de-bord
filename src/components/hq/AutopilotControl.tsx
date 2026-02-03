import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Power, 
  PowerOff, 
  AlertOctagon, 
  Play, 
  Pause,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";
import { useAutopilot } from "@/hooks/useAutopilot";
import { cn } from "@/lib/utils";

interface AutopilotControlProps {
  className?: string;
  compact?: boolean;
}

export function AutopilotControl({ className, compact = false }: AutopilotControlProps) {
  const {
    config,
    isLoading,
    isPaused,
    lastError,
    dailyRunCount,
    toggleAutopilot,
    panicStop,
    resume,
    getRunTypesWithStatus,
  } = useAutopilot();

  const [showSettings, setShowSettings] = useState(false);

  const runTypes = getRunTypesWithStatus();
  const autoRunTypes = runTypes.filter(r => r.autopilotAllowed);
  const manualRunTypes = runTypes.filter(r => !r.autopilotAllowed);

  const dailyProgress = (dailyRunCount / config.maxDailyAutonomousRuns) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <Bot className={cn(
            "h-4 w-4",
            config.enabled ? (isPaused ? "text-warning" : "text-success") : "text-muted-foreground"
          )} />
          <span className="text-sm font-medium">
            {isPaused ? "En pause" : config.enabled ? "Actif" : "Désactivé"}
          </span>
        </div>
        <Switch
          checked={config.enabled && !isPaused}
          onCheckedChange={toggleAutopilot}
          disabled={isLoading}
        />
        {config.enabled && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={panicStop}
            title="Arrêt d'urgence"
          >
            <AlertOctagon className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              config.enabled 
                ? (isPaused ? "bg-warning/10" : "bg-success/10") 
                : "bg-muted"
            )}>
              <Bot className={cn(
                "h-5 w-5",
                config.enabled 
                  ? (isPaused ? "text-warning" : "text-success") 
                  : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">Mode Autopilote</CardTitle>
              <CardDescription>
                Exécution automatique des tâches à faible risque
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Switch
              checked={config.enabled && !isPaused}
              onCheckedChange={toggleAutopilot}
              disabled={isLoading}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Banner */}
        {isPaused && lastError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertOctagon className="h-4 w-4" />
              <span className="font-medium text-sm">Autopilote en pause</span>
            </div>
            <p className="text-sm text-muted-foreground">{lastError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={resume}
            >
              <Play className="h-3 w-3 mr-1" />
              Reprendre
            </Button>
          </div>
        )}

        {/* Daily Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exécutions aujourd'hui</span>
            <span className="font-mono">
              {dailyRunCount} / {config.maxDailyAutonomousRuns}
            </span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {config.enabled && !isPaused ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => toggleAutopilot(false)}
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspendre
            </Button>
          ) : (
            <Button
              variant="executive"
              className="flex-1"
              onClick={() => toggleAutopilot(true)}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Activer
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={panicStop}
            disabled={!config.enabled}
            title="Arrêt d'urgence"
          >
            <PowerOff className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Run Types Status */}
        {showSettings && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-success" />
                Exécution automatique ({autoRunTypes.length})
              </h4>
              <div className="space-y-1">
                {autoRunTypes.map(rt => (
                  <div 
                    key={rt.key}
                    className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                  >
                    <span>{rt.title}</span>
                    <Badge variant="subtle" className="text-xs">
                      {rt.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warning" />
                Approbation requise ({manualRunTypes.length})
              </h4>
              <div className="space-y-1">
                {manualRunTypes.map(rt => (
                  <div 
                    key={rt.key}
                    className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                  >
                    <span>{rt.title}</span>
                    <Badge 
                      variant={rt.riskLevel === "critical" ? "destructive" : "gold"} 
                      className="text-xs"
                    >
                      {rt.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-success" />
            <span>Auto-exécutable</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-warning" />
            <span>Approbation requise</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

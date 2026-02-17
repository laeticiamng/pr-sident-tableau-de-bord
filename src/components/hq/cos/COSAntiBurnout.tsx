import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert,
  Moon,
  Dumbbell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Zap,
  BrainCircuit,
} from "lucide-react";
import { type COSBurnoutMetrics, COS_RULES } from "@/lib/cos-types";
import { cn } from "@/lib/utils";

interface COSAntiBurnoutProps {
  metrics: COSBurnoutMetrics;
  onUpdate: (updates: Partial<COSBurnoutMetrics>) => void;
}

export function COSAntiBurnout({ metrics, onUpdate }: COSAntiBurnoutProps) {
  const sleepRatio = (metrics.sommeilHeures / metrics.sommeilObjectif) * 100;
  const exerciseRatio = (metrics.activitePhysiqueSemaine / metrics.activitePhysiqueObjectif) * 100;

  const riskFactors = [
    { label: "Euphorie detectee", active: metrics.euphorieDetectee, icon: Zap },
    { label: "Sommeil insuffisant", active: metrics.sommeilHeures < metrics.sommeilObjectif, icon: Moon },
    { label: "Pression interne haute", active: metrics.pressionInterneHaute, icon: BrainCircuit },
    { label: "Multi-projet excessif", active: metrics.multiProjet, icon: AlertTriangle },
  ];

  const activeRiskCount = riskFactors.filter((r) => r.active).length;

  return (
    <Card className={cn(
      "card-executive",
      metrics.drapeauRouge && "ring-2 ring-destructive/50 bg-destructive/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Protection Anti-Burnout
            </CardTitle>
            <CardDescription>
              Preservation de la machine de production
            </CardDescription>
          </div>
          {metrics.drapeauRouge ? (
            <Badge variant="destructive" className="animate-pulse">
              <ShieldAlert className="h-3 w-3 mr-1" />
              DRAPEAU ROUGE
            </Badge>
          ) : metrics.jourMaintenanceForce ? (
            <Badge variant="outline" className="border-amber-500 text-amber-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Jour maintenance
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-500 text-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              OK
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Matrix */}
        {metrics.drapeauRouge && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 space-y-2">
            <p className="text-sm font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Alerte : euphorie + sommeil bas + pression + multi-projet = risque crash
            </p>
            <p className="text-xs text-destructive/80">
              Action requise : reduire la charge immediatement. Pas de conception complexe aujourd'hui.
            </p>
          </div>
        )}

        {/* Risk Factors */}
        <div className="grid grid-cols-2 gap-3">
          {riskFactors.map((factor) => (
            <div
              key={factor.label}
              className={cn(
                "p-3 rounded-lg border flex items-center gap-2",
                factor.active ? "bg-destructive/5 border-destructive/30" : "bg-muted/30"
              )}
            >
              <factor.icon className={cn("h-4 w-4", factor.active ? "text-destructive" : "text-muted-foreground")} />
              <span className={cn("text-xs", factor.active ? "text-destructive font-medium" : "text-muted-foreground")}>
                {factor.label}
              </span>
            </div>
          ))}
        </div>

        {/* Sleep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              Sommeil : {metrics.sommeilHeures}h / {metrics.sommeilObjectif}h
            </label>
            {metrics.joursConsecutifsSommeilBas >= COS_RULES.LOW_SLEEP_CONSECUTIVE_LIMIT && (
              <Badge variant="destructive" className="text-xs">
                {metrics.joursConsecutifsSommeilBas}j consec. &lt; 7h
              </Badge>
            )}
          </div>
          <Slider
            value={[metrics.sommeilHeures]}
            min={3}
            max={10}
            step={0.5}
            onValueChange={([v]) => onUpdate({ sommeilHeures: v })}
            className="w-full"
          />
          <Progress
            value={Math.min(100, sleepRatio)}
            className={cn("h-2", sleepRatio < 100 ? "[&>div]:bg-destructive" : "[&>div]:bg-emerald-500")}
          />
        </div>

        {/* Exercise */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-orange-500" />
              Activite physique : {metrics.activitePhysiqueSemaine}/{metrics.activitePhysiqueObjectif} sessions
            </label>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Button
                key={i}
                variant={i < metrics.activitePhysiqueSemaine ? "default" : "outline"}
                size="sm"
                className="w-10 h-10"
                onClick={() => onUpdate({ activitePhysiqueSemaine: i + 1 })}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Progress
            value={Math.min(100, exerciseRatio)}
            className={cn("h-2", exerciseRatio < 100 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")}
          />
        </div>

        {/* Cutoff time */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            Cut-off quotidien
          </label>
          <span className="text-lg font-bold font-mono">{metrics.heureFinTravail}</span>
        </div>

        {/* Manual flags */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Euphorie de travail
            </label>
            <Switch
              checked={metrics.euphorieDetectee}
              onCheckedChange={(v) => onUpdate({ euphorieDetectee: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5" />
              Pression interne haute
            </label>
            <Switch
              checked={metrics.pressionInterneHaute}
              onCheckedChange={(v) => onUpdate({ pressionInterneHaute: v })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

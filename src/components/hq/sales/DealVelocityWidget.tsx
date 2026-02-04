import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock deal velocity data
const VELOCITY_DATA = {
  avgDaysToClose: 18,
  avgDaysToCloseChange: -2,
  dealValuePerDay: 2850,
  conversionRate: 28,
  stagesVelocity: [
    { stage: "Lead → Qualifié", avgDays: 3, target: 5 },
    { stage: "Qualifié → Proposition", avgDays: 5, target: 7 },
    { stage: "Proposition → Négociation", avgDays: 6, target: 5 },
    { stage: "Négociation → Signé", avgDays: 4, target: 5 },
  ]
};

interface DealVelocityWidgetProps {
  className?: string;
}

export function DealVelocityWidget({ className }: DealVelocityWidgetProps) {
  const { avgDaysToClose, avgDaysToCloseChange, dealValuePerDay, stagesVelocity } = VELOCITY_DATA;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Timer className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Vélocité des Deals</CardTitle>
              <CardDescription>Temps moyen de conversion par étape</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold">{avgDaysToClose}j</div>
            <p className="text-xs text-muted-foreground">Cycle moyen</p>
            <div className={cn(
              "flex items-center justify-center gap-1 text-xs mt-1",
              avgDaysToCloseChange < 0 ? "text-success" : "text-destructive"
            )}>
              {avgDaysToCloseChange < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {avgDaysToCloseChange}j vs mois dernier
            </div>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold">{dealValuePerDay.toLocaleString("fr-FR")}€</div>
            <p className="text-xs text-muted-foreground">Valeur/jour</p>
            <Badge variant="success" className="mt-1 text-xs">Pipeline actif</Badge>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold">{VELOCITY_DATA.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Taux conversion</p>
            <Badge variant="gold" className="mt-1 text-xs">+3% ce mois</Badge>
          </div>
        </div>

        {/* Stage Velocity */}
        <div className="space-y-3">
          {stagesVelocity.map((stage) => {
            const isOnTarget = stage.avgDays <= stage.target;
            const progress = Math.min((stage.avgDays / stage.target) * 100, 100);
            
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      isOnTarget ? "text-success" : "text-warning"
                    )}>
                      {stage.avgDays}j
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {stage.target}j cible
                    </span>
                    {isOnTarget ? (
                      <Target className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-warning" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className={cn(
                    "h-2",
                    !isOnTarget && progress > 100 && "[&>div]:bg-warning"
                  )}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

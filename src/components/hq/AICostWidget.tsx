import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useRecentRuns } from "@/hooks/useHQData";
import { cn } from "@/lib/utils";

// Estimation des coûts par type de run (en euros)
const RUN_COST_ESTIMATES: Record<string, number> = {
  DAILY_EXECUTIVE_BRIEF: 0.10,
  CEO_STANDUP_MEETING: 0.05,
  PLATFORM_STATUS_REVIEW: 0.02,
  SECURITY_AUDIT_RLS: 0.18,
  MARKETING_WEEK_PLAN: 0.04,
  RELEASE_GATE_CHECK: 0.12,
  COMPETITIVE_ANALYSIS: 0.25,
};

// Limites de budget
const DAILY_BUDGET = 15; // €
const MONTHLY_BUDGET = 350; // €

interface AICostWidgetProps {
  className?: string;
  compact?: boolean;
}

export function AICostWidget({ className, compact = false }: AICostWidgetProps) {
  const { data: runs } = useRecentRuns(100);
  
  // Calculer les coûts estimés
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const dailyCost = runs
    ?.filter(r => new Date(r.created_at) >= today)
    .reduce((sum, r) => sum + (RUN_COST_ESTIMATES[r.run_type] || 0.05), 0) || 0;
    
  const monthlyCost = runs
    ?.filter(r => new Date(r.created_at) >= startOfMonth)
    .reduce((sum, r) => sum + (RUN_COST_ESTIMATES[r.run_type] || 0.05), 0) || 0;
  
  const dailyPercent = (dailyCost / DAILY_BUDGET) * 100;
  const monthlyPercent = (monthlyCost / MONTHLY_BUDGET) * 100;
  
  const isNearDailyLimit = dailyPercent >= 80;
  const isOverDailyLimit = dailyPercent >= 100;
  const isNearMonthlyLimit = monthlyPercent >= 80;
  
  const runsToday = runs?.filter(r => new Date(r.created_at) >= today).length || 0;
  const runsThisMonth = runs?.filter(r => new Date(r.created_at) >= startOfMonth).length || 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Crédits IA :</span>
        <Badge 
          variant={isNearMonthlyLimit ? "destructive" : "subtle"}
          className="font-mono"
        >
          {monthlyCost.toFixed(2)}€ / {MONTHLY_BUDGET}€
        </Badge>
        {isNearMonthlyLimit && (
          <AlertTriangle className="h-4 w-4 text-warning" />
        )}
      </div>
    );
  }

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Consommation IA
          </span>
          {isNearMonthlyLimit && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Attention
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget quotidien */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Aujourd'hui</span>
            <span className="font-mono font-medium">
              {dailyCost.toFixed(2)}€ / {DAILY_BUDGET}€
            </span>
          </div>
          <Progress 
            value={Math.min(dailyPercent, 100)} 
            className={cn(
              "h-2",
              isOverDailyLimit && "[&>div]:bg-destructive",
              isNearDailyLimit && !isOverDailyLimit && "[&>div]:bg-warning"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {runsToday} runs exécutés
          </p>
        </div>

        {/* Budget mensuel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ce mois</span>
            <span className="font-mono font-medium">
              {monthlyCost.toFixed(2)}€ / {MONTHLY_BUDGET}€
            </span>
          </div>
          <Progress 
            value={Math.min(monthlyPercent, 100)} 
            className={cn(
              "h-2",
              monthlyPercent >= 100 && "[&>div]:bg-destructive",
              isNearMonthlyLimit && monthlyPercent < 100 && "[&>div]:bg-warning"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {runsThisMonth} runs ce mois ({(monthlyPercent).toFixed(0)}% du budget)
          </p>
        </div>

        {/* Projection */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Projection fin de mois :</span>
            <span className={cn(
              "font-mono font-medium",
              (monthlyCost / Math.max(today.getDate(), 1)) * 30 > MONTHLY_BUDGET 
                ? "text-destructive" 
                : "text-success"
            )}>
              ~{((monthlyCost / Math.max(today.getDate(), 1)) * 30).toFixed(0)}€
            </span>
          </div>
        </div>

        {/* Alerte si nécessaire */}
        {isNearMonthlyLimit && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Budget mensuel presque atteint. Limitez les runs non essentiels.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

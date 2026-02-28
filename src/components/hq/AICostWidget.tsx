import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useRecentRuns } from "@/hooks/useHQData";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { getRunCost } from "@/lib/run-types-registry";

// Limites de budget
const DAILY_BUDGET = 15; // €
const MONTHLY_BUDGET = 350; // €

const PLATFORM_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--secondary-foreground))",
];

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
    .reduce((sum, r) => sum + getRunCost(r.run_type), 0) || 0;
    
  const monthlyCost = runs
    ?.filter(r => new Date(r.created_at) >= startOfMonth)
    .reduce((sum, r) => sum + getRunCost(r.run_type), 0) || 0;
  
  const dailyPercent = (dailyCost / Math.max(DAILY_BUDGET, 1)) * 100;
  const monthlyPercent = (monthlyCost / Math.max(MONTHLY_BUDGET, 1)) * 100;
  
  const isNearDailyLimit = dailyPercent >= 80;
  const isOverDailyLimit = dailyPercent >= 100;
  const isNearMonthlyLimit = monthlyPercent >= 80;
  
  const runsToday = runs?.filter(r => new Date(r.created_at) >= today).length || 0;
  const runsThisMonth = runs?.filter(r => new Date(r.created_at) >= startOfMonth).length || 0;

  // Coût par plateforme
  const platformCosts = (() => {
    const monthlyRuns = runs?.filter(r => new Date(r.created_at) >= startOfMonth) || [];
    const costMap = new Map<string, { cost: number; count: number }>();
    
    for (const r of monthlyRuns) {
      const key = r.platform_key || "global";
      const existing = costMap.get(key) || { cost: 0, count: 0 };
      costMap.set(key, {
        cost: existing.cost + getRunCost(r.run_type),
        count: existing.count + 1,
      });
    }
    
    return Array.from(costMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.cost - a.cost);
  })();

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
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono">{(monthlyCost || 0).toFixed(2)}€</span>
            {isNearMonthlyLimit && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Attention
              </Badge>
            )}
          </div>
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

        {/* Coût par plateforme */}
        {platformCosts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-sm font-medium flex items-center gap-1.5">
              Coût par plateforme
            </p>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformCosts.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={70} 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number, _name: string, props: any) => {
                      const entry = props?.payload;
                      const count = entry?.count || 0;
                      const avg = count > 0 ? ((value || 0) / count).toFixed(3) : "—";
                      return [`${(value || 0).toFixed(2)}€ (${count} runs, moy: ${avg}€)`, "Coût"];
                    }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]} maxBarSize={16}>
                    {platformCosts.slice(0, 5).map((_, i) => (
                      <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Projection */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Projection fin de mois :</span>
            <span className={cn(
              "font-mono font-medium",
              ((monthlyCost || 0) / Math.max(today.getDate(), 1)) * 30 > MONTHLY_BUDGET 
                ? "text-destructive" 
                : "text-success"
            )}>
              ~{(((monthlyCost || 0) / Math.max(today.getDate(), 1)) * 30).toFixed(0)}€
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

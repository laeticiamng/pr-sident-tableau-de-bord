import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopClient {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  revenueChange: number;
  since: string;
  platform: string;
  healthScore: number;
}

const TOP_CLIENTS: TopClient[] = [
  { 
    id: "1", 
    name: "TechCorp SAS", 
    industry: "Technologie", 
    revenue: 45000, 
    revenueChange: 12.5, 
    since: "2025-03", 
    platform: "Growth Copilot",
    healthScore: 95
  },
  { 
    id: "2", 
    name: "InnovHealth", 
    industry: "Santé", 
    revenue: 38500, 
    revenueChange: 8.2, 
    since: "2025-05", 
    platform: "EmotionsCare",
    healthScore: 88
  },
  { 
    id: "3", 
    name: "EduNext", 
    industry: "Éducation", 
    revenue: 28000, 
    revenueChange: -3.1, 
    since: "2025-01", 
    platform: "Med MNG",
    healthScore: 72
  },
  { 
    id: "4", 
    name: "FinanceFlow", 
    industry: "Finance", 
    revenue: 24500, 
    revenueChange: 0, 
    since: "2025-07", 
    platform: "System Compass",
    healthScore: 85
  },
  { 
    id: "5", 
    name: "RetailMax", 
    industry: "Commerce", 
    revenue: 19800, 
    revenueChange: 15.3, 
    since: "2025-09", 
    platform: "Growth Copilot",
    healthScore: 92
  },
];

const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="h-3 w-3 text-success" />;
  if (change < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const getHealthColor = (score: number) => {
  if (score >= 90) return "bg-success";
  if (score >= 70) return "bg-warning";
  return "bg-destructive";
};

export function TopClients() {
  const totalRevenue = TOP_CLIENTS.reduce((sum, c) => sum + c.revenue, 0);
  const avgHealthScore = Math.round(TOP_CLIENTS.reduce((sum, c) => sum + c.healthScore, 0) / TOP_CLIENTS.length);

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              Top Clients
            </CardTitle>
            <CardDescription>
              Clients à plus forte valeur (ARR)
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalRevenue.toLocaleString("fr-FR")}€</p>
            <p className="text-xs text-muted-foreground">ARR Top 5</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {TOP_CLIENTS.map((client, index) => (
            <div 
              key={client.id}
              className="p-4 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-amber-500/20 text-amber-600" :
                    index === 1 ? "bg-slate-400/20 text-slate-600" :
                    index === 2 ? "bg-amber-700/20 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{client.name}</h4>
                      {index === 0 && <Crown className="h-3 w-3 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{client.industry}</span>
                      <span>•</span>
                      <span>{client.platform}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{client.revenue.toLocaleString("fr-FR")}€</p>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    {getTrendIcon(client.revenueChange)}
                    <span className={cn(
                      client.revenueChange > 0 ? "text-success" :
                      client.revenueChange < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {client.revenueChange > 0 && "+"}{client.revenueChange}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">Santé</span>
                <Progress 
                  value={client.healthScore} 
                  className="h-2 flex-1"
                />
                <Badge 
                  variant={client.healthScore >= 90 ? "success" : client.healthScore >= 70 ? "warning" : "destructive"}
                  className="text-xs"
                >
                  {client.healthScore}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">{TOP_CLIENTS.length}</p>
            <p className="text-xs text-muted-foreground">Clients Premium</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{avgHealthScore}%</p>
            <p className="text-xs text-muted-foreground">Santé Moyenne</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-success">
              +{TOP_CLIENTS.filter(c => c.revenueChange > 0).length}
            </p>
            <p className="text-xs text-muted-foreground">En croissance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react";

interface WinLossWidgetProps {
  className?: string;
}

export function WinLossWidget({ className }: WinLossWidgetProps) {
  const data = {
    wins: 24,
    losses: 8,
    pending: 12,
    winRate: 75,
    avgDealSize: 4850,
    avgCycleDays: 32,
  };

  const total = data.wins + data.losses;
  const winPercent = (data.wins / total) * 100;

  return (
    <Card className={`card-executive ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          Taux de Closing
        </CardTitle>
        <CardDescription>
          Performance commerciale du trimestre
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Win Rate Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Win Rate</span>
            <Badge variant={winPercent >= 60 ? "success" : winPercent >= 40 ? "warning" : "destructive"}>
              {data.winRate}%
            </Badge>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-success transition-all"
              style={{ width: `${winPercent}%` }}
            />
            <div 
              className="h-full bg-destructive transition-all"
              style={{ width: `${100 - winPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Gagnés</span>
            </div>
            <p className="text-2xl font-bold text-success">{data.wins}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Perdus</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{data.losses}</p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Taille moyenne deal</span>
            <span className="font-semibold">{data.avgDealSize.toLocaleString("fr-FR")} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cycle de vente moyen</span>
            <span className="font-semibold">{data.avgCycleDays} jours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">En négociation</span>
            <Badge variant="subtle">{data.pending} deals</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

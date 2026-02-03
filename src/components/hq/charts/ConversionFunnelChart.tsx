import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users } from "lucide-react";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

interface ConversionFunnelChartProps {
  data?: FunnelStage[];
  loading?: boolean;
}

const DEFAULT_FUNNEL: FunnelStage[] = [
  { stage: "Visiteurs", count: 10000, percentage: 100 },
  { stage: "Inscriptions", count: 2500, percentage: 25, conversionRate: 25 },
  { stage: "Activation", count: 1200, percentage: 12, conversionRate: 48 },
  { stage: "Premier achat", count: 450, percentage: 4.5, conversionRate: 37.5 },
  { stage: "Récurrence", count: 180, percentage: 1.8, conversionRate: 40 },
];

export function ConversionFunnelChart({ data = DEFAULT_FUNNEL, loading }: ConversionFunnelChartProps) {
  const overallConversion = data[data.length - 1]?.percentage || 0;

  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Funnel de Conversion
          </CardTitle>
          <CardDescription>Parcours utilisateur de la visite à la récurrence</CardDescription>
        </div>
        <Badge variant={overallConversion >= 1.5 ? "success" : "warning"}>
          {overallConversion}% conversion globale
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono">
                    {stage.count.toLocaleString("fr-FR")}
                  </span>
                  {stage.conversionRate && (
                    <Badge variant="subtle" className="font-mono text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stage.conversionRate}%
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-mono min-w-[50px] justify-center">
                    {stage.percentage}%
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <Progress value={stage.percentage} className="h-3" />
                {index > 0 && stage.conversionRate && (
                  <div 
                    className="absolute -top-1 text-[10px] text-muted-foreground"
                    style={{ left: `${stage.percentage}%`, transform: "translateX(-50%)" }}
                  >
                    ↓{stage.conversionRate}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

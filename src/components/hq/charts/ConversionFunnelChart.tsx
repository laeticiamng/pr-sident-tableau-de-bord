import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Link2 } from "lucide-react";

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

export function ConversionFunnelChart({ data, loading }: ConversionFunnelChartProps) {
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

  if (!data || data.length === 0) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Funnel de Conversion
          </CardTitle>
          <CardDescription>Parcours utilisateur de la visite à la récurrence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Connexion Analytics requise</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez GA4 ou Mixpanel pour visualiser le funnel</p>
            <Badge variant="outline" className="mt-3">Analytics</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallConversion = data[data.length - 1]?.percentage || 0;

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
              <Progress value={stage.percentage} className="h-3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

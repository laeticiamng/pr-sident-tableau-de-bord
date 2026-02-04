import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code2, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const COVERAGE_DATA = {
  overall: 87,
  trend: 3.2,
  byPlatform: [
    { name: "EmotionsCare", coverage: 92, tests: 342, change: 2.1 },
    { name: "Growth Copilot", coverage: 85, tests: 287, change: 5.4 },
    { name: "System Compass", coverage: 94, tests: 718, change: 1.2 },
    { name: "Med MNG", coverage: 78, tests: 156, change: -1.3 },
    { name: "Pixel Perfect Replica", coverage: 68, tests: 89, change: 8.7 },
  ],
  byType: {
    unit: 91,
    integration: 82,
    e2e: 74,
  },
};

const getCoverageColor = (coverage: number) => {
  if (coverage >= 80) return "text-success";
  if (coverage >= 60) return "text-warning";
  return "text-destructive";
};

const getCoverageBadge = (coverage: number) => {
  if (coverage >= 80) return "success";
  if (coverage >= 60) return "warning";
  return "destructive";
};

export function CodeCoverageWidget() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-primary" />
          Couverture de Code
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>Taux global:</span>
          <Badge variant={getCoverageBadge(COVERAGE_DATA.overall) as any}>
            {COVERAGE_DATA.overall}%
          </Badge>
          <TrendingUp className="h-3 w-3 text-success ml-1" />
          <span className="text-success text-xs">+{COVERAGE_DATA.trend}%</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Coverage by Type */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg border">
            <p className={cn("text-2xl font-bold", getCoverageColor(COVERAGE_DATA.byType.unit))}>
              {COVERAGE_DATA.byType.unit}%
            </p>
            <p className="text-xs text-muted-foreground">Tests Unitaires</p>
          </div>
          <div className="text-center p-3 rounded-lg border">
            <p className={cn("text-2xl font-bold", getCoverageColor(COVERAGE_DATA.byType.integration))}>
              {COVERAGE_DATA.byType.integration}%
            </p>
            <p className="text-xs text-muted-foreground">Intégration</p>
          </div>
          <div className="text-center p-3 rounded-lg border">
            <p className={cn("text-2xl font-bold", getCoverageColor(COVERAGE_DATA.byType.e2e))}>
              {COVERAGE_DATA.byType.e2e}%
            </p>
            <p className="text-xs text-muted-foreground">E2E</p>
          </div>
        </div>

        {/* Coverage by Platform */}
        <div className="space-y-3">
          {COVERAGE_DATA.byPlatform.map((platform) => (
            <div key={platform.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {platform.coverage >= 80 ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-warning" />
                  )}
                  <span className="font-medium">{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{platform.tests} tests</span>
                  <Badge 
                    variant={getCoverageBadge(platform.coverage) as any}
                    className="font-mono w-14 justify-center"
                  >
                    {platform.coverage}%
                  </Badge>
                  <span className={cn(
                    "text-xs w-12 text-right",
                    platform.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {platform.change >= 0 ? "+" : ""}{platform.change}%
                  </span>
                </div>
              </div>
              <Progress value={platform.coverage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Target */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Objectif: <span className="font-semibold">90%</span> de couverture globale
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {90 - COVERAGE_DATA.overall}% restants pour atteindre l'objectif
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

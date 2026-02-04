import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, Users, Clock, MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock platform traffic data
const PLATFORM_TRAFFIC = [
  {
    key: "emotionscare",
    name: "EmotionsCare",
    visitors: 12450,
    change: 15,
    avgSessionDuration: "4m 32s",
    bounceRate: 35,
    topCountries: ["FR", "BE", "CH"]
  },
  {
    key: "growth-copilot",
    name: "Growth Copilot",
    visitors: 8320,
    change: 22,
    avgSessionDuration: "6m 18s",
    bounceRate: 28,
    topCountries: ["FR", "US", "UK"]
  },
  {
    key: "system-compass",
    name: "System Compass",
    visitors: 5840,
    change: 8,
    avgSessionDuration: "5m 45s",
    bounceRate: 32,
    topCountries: ["FR", "DE", "ES"]
  },
  {
    key: "med-mng",
    name: "Med MNG",
    visitors: 3210,
    change: -5,
    avgSessionDuration: "8m 12s",
    bounceRate: 22,
    topCountries: ["FR", "BE", "LU"]
  },
  {
    key: "pixel-perfect-replica",
    name: "Pixel Perfect Replica",
    visitors: 1890,
    change: 45,
    avgSessionDuration: "3m 28s",
    bounceRate: 42,
    topCountries: ["FR", "CA", "MA"]
  },
];

interface PlatformTrafficWidgetProps {
  className?: string;
}

export function PlatformTrafficWidget({ className }: PlatformTrafficWidgetProps) {
  const totalVisitors = PLATFORM_TRAFFIC.reduce((sum, p) => sum + p.visitors, 0);
  const avgBounceRate = Math.round(PLATFORM_TRAFFIC.reduce((sum, p) => sum + p.bounceRate, 0) / PLATFORM_TRAFFIC.length);

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Trafic par Plateforme</CardTitle>
              <CardDescription>Visiteurs mensuels consolidés</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalVisitors.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-muted-foreground">visiteurs ce mois</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div className="text-center">
            <p className="text-lg font-bold">{avgBounceRate}%</p>
            <p className="text-xs text-muted-foreground">Taux de rebond moyen</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">5m 27s</p>
            <p className="text-xs text-muted-foreground">Session moyenne</p>
          </div>
        </div>

        {/* Platform List */}
        <div className="space-y-3">
          {PLATFORM_TRAFFIC.map((platform) => {
            const percentage = Math.round((platform.visitors / totalVisitors) * 100);
            
            return (
              <div key={platform.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{platform.name}</span>
                    <Badge 
                      variant={platform.change > 0 ? "success" : "destructive"} 
                      className="text-xs"
                    >
                      {platform.change > 0 ? "+" : ""}{platform.change}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {platform.visitors.toLocaleString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {platform.avgSessionDuration}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {platform.topCountries.map((country, idx) => (
                    <span key={country}>
                      {country}{idx < platform.topCountries.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

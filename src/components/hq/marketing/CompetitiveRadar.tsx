import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorMetric {
  metric: string;
  us: number;
  competitor: number;
  fullMark: number;
}

const COMPETITOR_DATA: CompetitorMetric[] = [
  { metric: "Prix", us: 85, competitor: 70, fullMark: 100 },
  { metric: "Fonctionnalités", us: 90, competitor: 85, fullMark: 100 },
  { metric: "UX", us: 88, competitor: 75, fullMark: 100 },
  { metric: "Support", us: 92, competitor: 80, fullMark: 100 },
  { metric: "Sécurité", us: 95, competitor: 88, fullMark: 100 },
  { metric: "Innovation", us: 82, competitor: 78, fullMark: 100 },
];

interface CompetitiveRadarProps {
  className?: string;
}

export function CompetitiveRadar({ className }: CompetitiveRadarProps) {
  const avgUs = COMPETITOR_DATA.reduce((sum, d) => sum + d.us, 0) / COMPETITOR_DATA.length;
  const avgCompetitor = COMPETITOR_DATA.reduce((sum, d) => sum + d.competitor, 0) / COMPETITOR_DATA.length;
  const advantage = ((avgUs - avgCompetitor) / avgCompetitor * 100).toFixed(1);

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Radar Compétitif
            </CardTitle>
            <CardDescription>
              Positionnement vs concurrence
            </CardDescription>
          </div>
          <Badge variant="success" className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            +{advantage}% avance
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPETITOR_DATA}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <Radar 
              name="Nous" 
              dataKey="us" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar 
              name="Concurrence" 
              dataKey="competitor" 
              stroke="hsl(var(--muted-foreground))" 
              fill="hsl(var(--muted-foreground))" 
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {/* Metrics Summary */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
          {COMPETITOR_DATA.filter(d => d.us > d.competitor + 10).slice(0, 3).map((metric) => (
            <div key={metric.metric} className="text-center p-2 rounded-lg bg-success/5 border border-success/20">
              <div className="text-xs font-medium text-success">{metric.metric}</div>
              <div className="text-sm font-bold">+{metric.us - metric.competitor}pts</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

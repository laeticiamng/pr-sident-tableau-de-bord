import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface PlatformData {
  date: string;
  emotionscare: number;
  growthCopilot: number;
  systemCompass: number;
  medMng: number;
  pixelPerfect: number;
}

const mockData: PlatformData[] = [
  { date: "Lun", emotionscare: 99.9, growthCopilot: 98.5, systemCompass: 99.8, medMng: 99.7, pixelPerfect: 99.9 },
  { date: "Mar", emotionscare: 99.8, growthCopilot: 99.1, systemCompass: 99.9, medMng: 99.5, pixelPerfect: 100 },
  { date: "Mer", emotionscare: 99.9, growthCopilot: 97.8, systemCompass: 99.7, medMng: 99.9, pixelPerfect: 99.8 },
  { date: "Jeu", emotionscare: 100, growthCopilot: 99.2, systemCompass: 99.9, medMng: 99.8, pixelPerfect: 99.9 },
  { date: "Ven", emotionscare: 99.7, growthCopilot: 98.9, systemCompass: 99.8, medMng: 100, pixelPerfect: 99.7 },
  { date: "Sam", emotionscare: 99.9, growthCopilot: 99.5, systemCompass: 99.9, medMng: 99.9, pixelPerfect: 100 },
  { date: "Dim", emotionscare: 99.9, growthCopilot: 99.0, systemCompass: 99.9, medMng: 99.8, pixelPerfect: 99.9 },
];

const platformColors = {
  emotionscare: "hsl(var(--primary))",
  growthCopilot: "hsl(var(--accent))",
  systemCompass: "hsl(var(--success))",
  medMng: "hsl(var(--warning))",
  pixelPerfect: "hsl(var(--muted-foreground))",
};

const platformLabels = {
  emotionscare: "EmotionsCare",
  growthCopilot: "Growth Copilot",
  systemCompass: "System Compass",
  medMng: "Med MNG",
  pixelPerfect: "Pixel Perfect",
};

interface MultiPlatformUptimeChartProps {
  data?: PlatformData[];
}

export function MultiPlatformUptimeChart({ data }: MultiPlatformUptimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            Uptime Multi-Plateformes
          </CardTitle>
          <CardDescription>Aucune donnée d'uptime disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Données de monitoring en attente</p>
            <p className="text-sm mt-1">Les données d'uptime apparaîtront après le premier cycle de monitoring</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Calculate averages
  const avgUptime = data.reduce((acc, d) => {
    return acc + (d.emotionscare + d.growthCopilot + d.systemCompass + d.medMng + d.pixelPerfect) / 5;
  }, 0) / data.length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              Uptime Multi-Plateformes
            </CardTitle>
            <CardDescription>
              Disponibilité des 5 plateformes sur 7 jours
            </CardDescription>
          </div>
          <Badge variant="success" className="text-sm">
            <TrendingUp className="h-3 w-3 mr-1" />
            {avgUptime.toFixed(2)}% moy.
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                domain={[96, 100]}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`, 
                  platformLabels[name as keyof typeof platformLabels] || name
                ]}
              />
              <Legend 
                formatter={(value) => platformLabels[value as keyof typeof platformLabels] || value}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Line 
                type="monotone" 
                dataKey="emotionscare" 
                stroke={platformColors.emotionscare}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="growthCopilot" 
                stroke={platformColors.growthCopilot}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="systemCompass" 
                stroke={platformColors.systemCompass}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="medMng" 
                stroke={platformColors.medMng}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="pixelPerfect" 
                stroke={platformColors.pixelPerfect}
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

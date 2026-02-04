import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cpu, HardDrive, Wifi, Activity, Database, Zap, TrendingUp } from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  icon: typeof Cpu;
  status: "good" | "warning" | "critical";
}

const SYSTEM_METRICS: SystemMetric[] = [
  { name: "CPU", value: 23, max: 100, unit: "%", icon: Cpu, status: "good" },
  { name: "Mémoire", value: 4.2, max: 8, unit: "GB", icon: Database, status: "good" },
  { name: "Disque", value: 45, max: 100, unit: "%", icon: HardDrive, status: "good" },
  { name: "Réseau", value: 156, max: 1000, unit: "Mbps", icon: Wifi, status: "good" },
];

const PERFORMANCE_HISTORY = [
  { timestamp: "10:00", cpu: 18, memory: 3.8, requests: 245 },
  { timestamp: "10:15", cpu: 22, memory: 4.0, requests: 312 },
  { timestamp: "10:30", cpu: 25, memory: 4.1, requests: 289 },
  { timestamp: "10:45", cpu: 21, memory: 4.2, requests: 267 },
  { timestamp: "11:00", cpu: 23, memory: 4.2, requests: 298 },
];

export function SystemPerformance() {
  const avgCpu = Math.round(PERFORMANCE_HISTORY.reduce((sum, h) => sum + h.cpu, 0) / PERFORMANCE_HISTORY.length);
  const totalRequests = PERFORMANCE_HISTORY.reduce((sum, h) => sum + h.requests, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-success";
      case "warning": return "text-warning";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "good": return "[&>div]:bg-success";
      case "warning": return "[&>div]:bg-warning";
      case "critical": return "[&>div]:bg-destructive";
      default: return "";
    }
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              Performance Système
            </CardTitle>
            <CardDescription>
              Métriques de ressources en temps réel
            </CardDescription>
          </div>
          <Badge variant="success">Système sain</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resource Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {SYSTEM_METRICS.map((metric) => {
            const percentage = (metric.value / metric.max) * 100;
            return (
              <div key={metric.name} className="text-center p-3 rounded-lg border">
                <metric.icon className={`h-6 w-6 mx-auto mb-2 ${getStatusColor(metric.status)}`} />
                <p className="text-lg font-bold">{metric.value}{metric.unit}</p>
                <p className="text-xs text-muted-foreground mb-2">{metric.name}</p>
                <Progress 
                  value={percentage} 
                  className={`h-1.5 ${getProgressColor(metric.status)}`} 
                />
              </div>
            );
          })}
        </div>

        {/* Performance Timeline */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Historique (dernière heure)
          </h4>
          <div className="flex justify-between text-xs">
            {PERFORMANCE_HISTORY.map((point, i) => (
              <div key={i} className="text-center">
                <div className="h-12 w-3 bg-muted rounded-full mx-auto mb-1 relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-primary rounded-full transition-all"
                    style={{ height: `${point.cpu}%` }}
                  />
                </div>
                <span className="text-muted-foreground">{point.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold">{avgCpu}%</p>
            <p className="text-xs text-muted-foreground">CPU Moyen</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalRequests}</p>
            <p className="text-xs text-muted-foreground">Requêtes/h</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-success">99.9%</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

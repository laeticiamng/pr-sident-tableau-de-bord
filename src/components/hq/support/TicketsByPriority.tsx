import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { SUPPORT_TICKETS_BY_PRIORITY, SUPPORT_TICKETS_BY_PLATFORM } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TicketsByPriorityProps {
  loading?: boolean;
}

const priorityConfig = {
  Critique: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    progressColor: "bg-destructive",
  },
  Haute: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    progressColor: "bg-warning",
  },
  Moyenne: {
    icon: Info,
    color: "text-primary",
    bgColor: "bg-primary/10",
    progressColor: "bg-primary",
  },
  Basse: {
    icon: CheckCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    progressColor: "bg-muted-foreground",
  },
};

export function TicketsByPriority({ loading }: TicketsByPriorityProps) {
  const totalTickets = SUPPORT_TICKETS_BY_PRIORITY.reduce((sum, t) => sum + t.count, 0);
  const criticalCount = SUPPORT_TICKETS_BY_PRIORITY.find(t => t.priority === "Critique")?.count || 0;

  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* By Priority */}
      <Card className="card-executive">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Tickets par Priorité
            </CardTitle>
            <CardDescription>Répartition des tickets ouverts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} critique(s)</Badge>
            )}
            <Badge variant="subtle">{totalTickets} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SUPPORT_TICKETS_BY_PRIORITY.map((ticket) => {
              const config = priorityConfig[ticket.priority as keyof typeof priorityConfig];
              const Icon = config?.icon || Info;
              const percentage = totalTickets > 0 ? (ticket.count / totalTickets) * 100 : 0;

              return (
                <div key={ticket.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", config?.bgColor)}>
                        <Icon className={cn("h-4 w-4", config?.color)} />
                      </div>
                      <span className="font-medium">{ticket.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{ticket.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    // Apply custom color via CSS variable
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* By Platform */}
      <Card className="card-executive">
        <CardHeader className="pb-2">
          <CardTitle>Tickets par Plateforme</CardTitle>
          <CardDescription>Distribution sur les 5 plateformes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SUPPORT_TICKETS_BY_PLATFORM.map((platform) => {
              const percentage = totalTickets > 0 ? (platform.count / totalTickets) * 100 : 0;
              return (
                <div 
                  key={platform.platform} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium">{platform.platform}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <Badge variant={platform.count > 0 ? "default" : "subtle"}>
                      {platform.count}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

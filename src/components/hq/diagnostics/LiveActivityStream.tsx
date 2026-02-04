import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Bot,
  Server,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";

interface LiveEvent {
  id: string;
  type: "system" | "user" | "agent" | "alert";
  message: string;
  timestamp: Date;
  severity: "info" | "success" | "warning" | "error";
}

function generateMockEvent(): LiveEvent {
  const types = ["system", "user", "agent", "alert"] as const;
  const messages = [
    { type: "system" as const, msg: "Health check completed", severity: "success" as const },
    { type: "user" as const, msg: "Login successful", severity: "info" as const },
    { type: "agent" as const, msg: "Daily brief generated", severity: "success" as const },
    { type: "system" as const, msg: "Database backup started", severity: "info" as const },
    { type: "agent" as const, msg: "Marketing analysis complete", severity: "success" as const },
    { type: "alert" as const, msg: "High memory usage detected", severity: "warning" as const },
  ];
  
  const event = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: event.type,
    message: event.msg,
    timestamp: new Date(),
    severity: event.severity,
  };
}

const typeIcons = {
  system: Server,
  user: User,
  agent: Bot,
  alert: AlertTriangle,
};

const severityStyles = {
  info: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

export function LiveActivityStream() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Generate initial events
    const initial = Array.from({ length: 5 }, generateMockEvent);
    setEvents(initial);

    // Simulate live events
    const interval = setInterval(() => {
      if (!isPaused) {
        setEvents(prev => [generateMockEvent(), ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            Flux d'Activité Live
            <Badge variant="success" className="animate-pulse">
              <span className="w-2 h-2 rounded-full bg-success mr-1" />
              En direct
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reprendre
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {events.map((event) => {
              const Icon = typeIcons[event.type];
              
              return (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <Icon className={`h-4 w-4 mt-0.5 ${severityStyles[event.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.timestamp.toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant="subtle" className="text-[10px] capitalize">
                    {event.type}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

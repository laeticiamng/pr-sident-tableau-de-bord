import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Wifi, WifiOff, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusWidgetProps {
  className?: string;
}

export function LiveStatusWidget({ className }: LiveStatusWidgetProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Pulse animation toggle
    const pulseInterval = setInterval(() => {
      setPulseActive((prev) => !prev);
    }, 2000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(timeInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Card className={cn("card-executive border-none bg-gradient-to-br from-card to-muted/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Connection Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "relative flex h-3 w-3 items-center justify-center",
                  pulseActive && isOnline && "animate-pulse"
                )}>
                  <span className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                    isOnline ? "bg-success animate-ping" : "bg-destructive"
                  )} />
                  <span className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    isOnline ? "bg-success" : "bg-destructive"
                  )} />
                </div>
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-success" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isOnline ? "Connecté au système" : "Hors ligne"}
            </TooltipContent>
          </Tooltip>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Système actif</span>
          </div>

          {/* Live Time */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-mono font-bold tracking-wider">
                {formattedTime}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {formattedDate}
              </div>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Quick Actions Badge */}
          <Badge variant="outline" className="gap-1 text-xs">
            <Zap className="h-3 w-3" />
            ⌘K
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

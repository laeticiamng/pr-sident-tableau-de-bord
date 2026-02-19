import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatforms } from "@/hooks/useHQData";
import { Activity, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformHealthGridProps {
  compact?: boolean;
  className?: string;
}

const statusConfig = {
  green: { 
    color: "bg-success", 
    label: "Opérationnel", 
    bgClass: "bg-success/5 border-success/20 hover:border-success/40",
    icon: TrendingUp,
    iconColor: "text-success"
  },
  amber: { 
    color: "bg-warning", 
    label: "Attention", 
    bgClass: "bg-warning/5 border-warning/20 hover:border-warning/40",
    icon: Minus,
    iconColor: "text-warning"
  },
  red: { 
    color: "bg-destructive", 
    label: "Critique", 
    bgClass: "bg-destructive/5 border-destructive/20 hover:border-destructive/40",
    icon: TrendingDown,
    iconColor: "text-destructive"
  },
};

export function PlatformHealthGrid({ compact, className }: PlatformHealthGridProps) {
  const { data: platforms, isLoading } = usePlatforms();

  if (isLoading) {
    return (
      <div className={cn("grid gap-3", compact ? "grid-cols-5" : "grid-cols-2 md:grid-cols-5", className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className={cn("rounded-xl", compact ? "h-20" : "h-32")} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-3",
      compact ? "grid-cols-5" : "grid-cols-2 md:grid-cols-5",
      className
    )}>
      {platforms?.map((platform) => {
        const config = statusConfig[platform.status];
        const StatusIcon = config.icon;
        
        return (
          <Tooltip key={platform.key}>
            <TooltipTrigger asChild>
              <Link to={`/hq/plateformes?platform=${platform.key}`}>
                <Card className={cn(
                  "group cursor-pointer transition-all duration-300 border-2",
                  config.bgClass
                )}>
                  <CardContent className={cn("p-3", !compact && "p-4")}>
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", config.color)} />
                        {!compact && (
                          <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
                        )}
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Platform Name */}
                    <h3 className={cn(
                      "font-semibold truncate",
                      compact ? "text-xs" : "text-sm"
                    )}>
                      {platform.name}
                    </h3>

                    {/* Metrics */}
                    {!compact && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Uptime</span>
                          <span className="font-mono font-medium">
                            {platform.uptime_percent?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", config.color)}
                            style={{ width: `${platform.uptime_percent || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Compact Uptime */}
                    {compact && (
                      <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                        {platform.uptime_percent?.toFixed(0)}%
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">{platform.name}</p>
                <p className="text-xs text-muted-foreground">{platform.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={platform.status === "green" ? "success" : platform.status === "amber" ? "warning" : "destructive"} className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs">Uptime: {platform.uptime_percent?.toFixed(1)}%</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

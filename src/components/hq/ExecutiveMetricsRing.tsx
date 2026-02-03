import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExecutiveMetricsRingProps {
  value: number;
  maxValue?: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "success" | "warning" | "destructive" | "accent" | "primary";
  className?: string;
}

export function ExecutiveMetricsRing({
  value,
  maxValue = 100,
  label,
  sublabel,
  size = "md",
  color = "accent",
  className,
}: ExecutiveMetricsRingProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const dimensions = useMemo(() => {
    switch (size) {
      case "sm": return { size: 80, stroke: 6, fontSize: "text-lg" };
      case "lg": return { size: 160, stroke: 12, fontSize: "text-4xl" };
      default: return { size: 120, stroke: 8, fontSize: "text-2xl" };
    }
  }, [size]);

  const colorClasses = {
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
    accent: "stroke-accent",
    primary: "stroke-primary",
  };

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn("card-executive", className)}>
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
          {/* Background Ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width={dimensions.size}
            height={dimensions.size}
          >
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={radius}
              fill="none"
              strokeWidth={dimensions.stroke}
              className="stroke-muted"
            />
            {/* Progress Ring */}
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={radius}
              fill="none"
              strokeWidth={dimensions.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(colorClasses[color], "transition-all duration-1000 ease-out")}
              style={{
                filter: `drop-shadow(0 0 8px hsl(var(--${color}) / 0.5))`,
              }}
            />
          </svg>
          
          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-bold", dimensions.fontSize)}>
              {typeof value === "number" ? value.toFixed(1) : value}
            </span>
            {sublabel && (
              <span className="text-xs text-muted-foreground">{sublabel}</span>
            )}
          </div>
        </div>
        
        <p className="mt-3 text-sm font-medium text-center">{label}</p>
      </CardContent>
    </Card>
  );
}

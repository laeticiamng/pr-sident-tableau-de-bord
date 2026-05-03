import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RISK_LEVEL_LABEL, RISK_LEVEL_TONE, type StudioRiskLevel } from "@/lib/studio-types";
import { ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";

interface ExecutionRiskBadgeProps {
  level: StudioRiskLevel;
  className?: string;
}

const RISK_ICON = {
  low: ShieldCheck,
  medium: ShieldAlert,
  high: AlertTriangle,
  critical: ShieldX,
} as const;

export function ExecutionRiskBadge({ level, className }: ExecutionRiskBadgeProps) {
  const Icon = RISK_ICON[level];
  return (
    <Badge variant="outline" className={cn("gap-1.5", RISK_LEVEL_TONE[level], className)}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">Risque {RISK_LEVEL_LABEL[level]}</span>
    </Badge>
  );
}

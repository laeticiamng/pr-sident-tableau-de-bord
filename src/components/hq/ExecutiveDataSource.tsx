import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Database, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSourceIndicatorProps {
  source: "stripe" | "github" | "supabase" | "mock" | "realtime";
  lastUpdated?: Date | string | null;
  confidence?: "high" | "medium" | "low";
  methodology?: string;
  className?: string;
}

const sourceConfig = {
  stripe: { label: "Stripe API", icon: Database, color: "text-[#635BFF]" },
  github: { label: "GitHub API", icon: Database, color: "text-[#181717] dark:text-white" },
  supabase: { label: "Lovable Cloud", icon: Database, color: "text-success" },
  mock: { label: "Données simulées", icon: Info, color: "text-warning" },
  realtime: { label: "Temps réel", icon: Clock, color: "text-primary" },
};

const confidenceConfig = {
  high: { label: "Fiabilité haute", variant: "success" as const },
  medium: { label: "Fiabilité moyenne", variant: "warning" as const },
  low: { label: "Fiabilité limitée", variant: "subtle" as const },
};

/**
 * Composant d'indication de source de données — Standard HEC/Polytechnique
 * Affiche la provenance, la fraîcheur et la fiabilité des données affichées.
 */
export function DataSourceIndicator({ 
  source, 
  lastUpdated, 
  confidence = "high",
  methodology,
  className 
}: DataSourceIndicatorProps) {
  const config = sourceConfig[source];
  const confConfig = confidenceConfig[confidence];
  const Icon = config.icon;

  const formattedDate = lastUpdated 
    ? new Date(lastUpdated).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-help", className)}>
            <Icon className={cn("h-3 w-3", config.color)} />
            <span className="hidden sm:inline">{config.label}</span>
            {source !== "mock" && confidence && (
              <Shield className={cn(
                "h-3 w-3 ml-1",
                confidence === "high" ? "text-success" :
                confidence === "medium" ? "text-warning" : "text-muted-foreground"
              )} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 text-sm">
            <div className="font-semibold">Source : {config.label}</div>
            {formattedDate && (
              <div className="text-muted-foreground">
                Dernière mise à jour : {formattedDate}
              </div>
            )}
            {methodology && (
              <div className="text-muted-foreground">
                Méthodologie : {methodology}
              </div>
            )}
            <Badge variant={confConfig.variant} className="mt-1">
              {confConfig.label}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ExecutiveHeaderProps {
  title: string;
  subtitle?: string;
  context?: string;
  source?: DataSourceIndicatorProps;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * En-tête exécutif avec contexte stratégique — Standard HEC/Polytechnique
 * Fournit le titre, le sous-titre, le contexte business et la source de données.
 */
export function ExecutiveHeader({
  title,
  subtitle,
  context,
  source,
  actions,
  className,
}: ExecutiveHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start md:justify-between gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        )}
        {context && (
          <p className="text-sm text-muted-foreground/80 italic max-w-xl">
            {context}
          </p>
        )}
        {source && (
          <DataSourceIndicator {...source} className="mt-2" />
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  source?: DataSourceIndicatorProps["source"];
  lastUpdated?: Date | string | null;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

/**
 * Carte KPI avec source et horodatage — Standard HEC/Polytechnique
 */
export function ExecutiveKPICard({
  label,
  value,
  change,
  changeLabel,
  source,
  lastUpdated,
  icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <div className={cn("card-executive p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        {icon && <div className="text-primary">{icon}</div>}
        {source && (
          <DataSourceIndicator 
            source={source} 
            lastUpdated={lastUpdated}
            confidence={source === "mock" ? "low" : "high"}
          />
        )}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
      {change !== undefined && (
        <div className={cn(
          "text-xs font-medium",
          trend === "up" ? "text-success" :
          trend === "down" ? "text-destructive" : "text-muted-foreground"
        )}>
          {change > 0 ? "+" : ""}{change}% {changeLabel || "vs période précédente"}
        </div>
      )}
    </div>
  );
}

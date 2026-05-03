import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioOverview } from "@/hooks/useStudio";
import {
  Lightbulb,
  Megaphone,
  FileText,
  CheckCircle2,
  Handshake,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning";
}

function MetricCard({ label, value, icon: Icon, hint, tone = "default" }: MetricCardProps) {
  const toneClasses: Record<NonNullable<MetricCardProps["tone"]>, string> = {
    default: "bg-muted/30 text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
            {hint && (
              <p className="text-[11px] text-muted-foreground">{hint}</p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClasses[tone])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudioCockpit() {
  const { data, isLoading } = useStudioOverview();

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const overview = data ?? {
    opportunities_total: 0,
    opportunities_active: 0,
    calls_active: 0,
    calls_with_deadline_30d: 0,
    blueprints_in_progress: 0,
    blueprints_finalized: 0,
    deals_proposed: 0,
    deals_accepted: 0,
    advisory_active: 0,
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Studio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Opportunités détectées"
              value={overview.opportunities_total}
              icon={Lightbulb}
              hint={`${overview.opportunities_active} actives`}
              tone="primary"
            />
            <MetricCard
              label="Appels à projets"
              value={overview.calls_active}
              icon={Megaphone}
              hint={`${overview.calls_with_deadline_30d} sous 30 j`}
              tone={overview.calls_with_deadline_30d > 0 ? "warning" : "default"}
            />
            <MetricCard
              label="Blueprints en cours"
              value={overview.blueprints_in_progress}
              icon={FileText}
              hint={`${overview.blueprints_finalized} finalisés`}
              tone="primary"
            />
            <MetricCard
              label="Deals proposés"
              value={overview.deals_proposed}
              icon={Handshake}
              hint={`${overview.deals_accepted} acceptés`}
              tone="warning"
            />
            <MetricCard
              label="Participations potentielles"
              value={overview.deals_accepted}
              icon={TrendingUp}
              tone="success"
            />
            <MetricCard
              label="Missions advisory actives"
              value={overview.advisory_active}
              icon={Users}
              tone="success"
            />
            <MetricCard
              label="Blueprints finalisés"
              value={overview.blueprints_finalized}
              icon={CheckCircle2}
              tone="success"
            />
            <MetricCard
              label="Échéances < 30 j"
              value={overview.calls_with_deadline_30d}
              icon={Clock}
              tone={overview.calls_with_deadline_30d > 0 ? "warning" : "default"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

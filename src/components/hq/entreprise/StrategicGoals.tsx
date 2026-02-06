import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategicGoalsProps {
  className?: string;
}

export function StrategicGoals({ className }: StrategicGoalsProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Objectifs Stratégiques 2026</CardTitle>
            <CardDescription>Progression des OKRs annuels</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun objectif stratégique configuré</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Configurez vos OKRs annuels pour suivre la progression stratégique
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

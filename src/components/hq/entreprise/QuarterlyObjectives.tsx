import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuarterlyObjectivesProps {
  className?: string;
}

export function QuarterlyObjectives({ className }: QuarterlyObjectivesProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Objectifs Q1 2026
        </CardTitle>
        <CardDescription>Suivi des objectifs trimestriels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun objectif Q1 configuré</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Définissez vos objectifs trimestriels pour activer le suivi
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingCompletionWidgetProps {
  className?: string;
}

export function TrainingCompletionWidget({ className }: TrainingCompletionWidgetProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Formations & Certifications
        </CardTitle>
        <CardDescription>Suivi des formations obligatoires et optionnelles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucune formation configurée</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Créez des modules de formation pour suivre la progression de l'équipe
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

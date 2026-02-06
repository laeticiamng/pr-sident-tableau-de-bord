import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItemsProps {
  className?: string;
}

export function ActionItems({ className }: ActionItemsProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <CheckSquare className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>Actions Issues des Réunions</CardTitle>
            <CardDescription>Suivi des actions assignées</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Aucune action enregistrée</p>
          <p className="text-sm mt-1">Les actions apparaîtront ici après la création d'un suivi de réunion.</p>
        </div>
      </CardContent>
    </Card>
  );
}

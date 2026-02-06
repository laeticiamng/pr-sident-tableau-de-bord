import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart4, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketDistributionChartProps {
  className?: string;
}

export function TicketDistributionChart({ className }: TicketDistributionChartProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart4 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Distribution des Tickets</CardTitle>
            <CardDescription>Répartition par catégorie et plateforme</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Support requise</p>
          <p className="text-sm mt-1">
            Intégrez Zendesk, Intercom ou Freshdesk pour afficher la distribution des tickets
          </p>
          <Badge variant="subtle" className="mt-3">
            <AlertCircle className="h-3 w-3 mr-1" />
            Source : Zendesk / Intercom
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

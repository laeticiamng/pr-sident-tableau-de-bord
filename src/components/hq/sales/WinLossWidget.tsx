import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WinLossWidgetProps {
  className?: string;
}

export function WinLossWidget({ className }: WinLossWidgetProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          Taux de Closing
        </CardTitle>
        <CardDescription>Performance commerciale du trimestre</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Connexion CRM requise</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connectez HubSpot, Pipedrive ou Salesforce pour suivre le pipeline commercial
          </p>
          <Badge variant="outline" className="mt-3">CRM</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

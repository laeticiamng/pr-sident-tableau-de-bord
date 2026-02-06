import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComplianceAlertsProps {
  className?: string;
}

export function ComplianceAlerts({ className }: ComplianceAlertsProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle>Alertes Conformité</CardTitle>
            <CardDescription>Suivi des obligations réglementaires</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Configuration Compliance requise</p>
          <p className="text-sm mt-1">Les alertes réglementaires nécessitent un calendrier de conformité en base de données.</p>
          <Badge variant="outline" className="mt-3">Calendrier RGPD</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

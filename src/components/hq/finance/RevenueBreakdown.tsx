import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RevenueBreakdown() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          Répartition des Revenus
        </CardTitle>
        <CardDescription>Par plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Stripe avancée requise</p>
          <p className="text-sm mt-1">La répartition par plateforme nécessite le tagging des produits Stripe par plateforme.</p>
          <Badge variant="outline" className="mt-3">Stripe Products</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

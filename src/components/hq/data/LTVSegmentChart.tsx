import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LTVSegmentChart() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          LTV par Segment
        </CardTitle>
        <CardDescription>Valeur vie client par catégorie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Connexion Analytics requise</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connectez Stripe Billing et votre analytics pour segmenter la LTV
          </p>
          <Badge variant="outline" className="mt-3">Stripe / Analytics</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

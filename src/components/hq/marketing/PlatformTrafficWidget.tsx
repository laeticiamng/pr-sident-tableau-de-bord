import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformTrafficWidgetProps {
  className?: string;
}

export function PlatformTrafficWidget({ className }: PlatformTrafficWidgetProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Trafic par Plateforme</CardTitle>
            <CardDescription>Visiteurs mensuels consolidés</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion GA4 requise</p>
          <p className="text-sm mt-1">
            Intégrez Google Analytics 4 pour afficher le trafic consolidé des 5 plateformes
          </p>
          <Badge variant="subtle" className="mt-3">
            <AlertCircle className="h-3 w-3 mr-1" />
            Source : Google Analytics 4
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

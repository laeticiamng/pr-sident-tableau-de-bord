import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Database, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitiveRadarProps {
  className?: string;
}

export function CompetitiveRadar({ className }: CompetitiveRadarProps) {
  // État vide - aucune donnée réelle
  return (
    <Card className={cn("card-executive border-dashed border-2 border-muted-foreground/20", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Radar Compétitif
            </CardTitle>
            <CardDescription>
              Positionnement vs concurrence
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-sm font-semibold mb-1">Analyse non disponible</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Lancez une analyse concurrentielle via le bouton IA.
        </p>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Link2 className="h-2.5 w-2.5" />
          Source : Perplexity AI
        </Badge>
      </CardContent>
    </Card>
  );
}

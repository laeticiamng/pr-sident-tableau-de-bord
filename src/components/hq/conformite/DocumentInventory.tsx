import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentInventoryProps {
  className?: string;
}

export function DocumentInventory({ className }: DocumentInventoryProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Inventaire Documents
        </CardTitle>
        <CardDescription>
          Répartition des documents par catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Inventaire non configuré</p>
          <p className="text-xs text-muted-foreground mt-1">Les documents doivent provenir d'un système de gestion documentaire</p>
          <Badge variant="outline" className="mt-3">GED / SharePoint</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

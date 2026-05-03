import { FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Blueprint360Builder } from "@/components/hq/studio/Blueprint360Builder";
import { BlueprintCard } from "@/components/hq/studio/BlueprintCard";
import { useStudioBlueprints } from "@/hooks/useStudio";

export default function StudioBlueprintsPage() {
  const { data, isLoading } = useStudioBlueprints();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Bibliothèque des Blueprints 360°
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Le Blueprint 360° est le livrable signature du Studio : un dossier stratégique complet, structuré en 12 sections, prêt à être présenté à un porteur de projet ou un financeur.
        </p>
      </div>

      <Card className="border-border/60 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Blueprints existants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : (data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Aucun Blueprint encore. Démarrez à partir d'une opportunité ou d'un appel à projets.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data ?? []).map((bp) => (
                <BlueprintCard key={bp.id} blueprint={bp} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Méthodologie Blueprint 360°</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Chaque Blueprint suit une structure unique en 12 sections. Cette structure garantit qu'aucun angle stratégique n'est oublié et permet à un partenaire ou un financeur d'évaluer le projet en quelques minutes.
        </p>
        <Blueprint360Builder />
      </div>
    </div>
  );
}

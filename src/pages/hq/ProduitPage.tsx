import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Layers, 
  RefreshCw,
  Rocket,
  Database,
  Link2
} from "lucide-react";
import { OKRProgress } from "@/components/hq/product/OKRProgress";
import { RoadmapExportButton } from "@/components/hq/product/RoadmapExportButton";
import { ReleaseTimeline } from "@/components/hq/product/ReleaseTimeline";
import { FeatureRequests } from "@/components/hq/product/FeatureRequests";

export default function ProduitPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Produit & Roadmap</h1>
          <p className="text-muted-foreground text-lg">
            Gouvernance produit et suivi des objectifs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoadmapExportButton />
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Platform Roadmaps - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            Roadmaps par Plateforme
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des initiatives produit
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-sm font-semibold mb-1">Connexion requise</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Connectez Jira, Linear ou GitHub Projects pour la roadmap.
          </p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Link2 className="h-2.5 w-2.5" />
            Sources : Jira, Linear, GitHub
          </Badge>
        </CardContent>
      </Card>

      {/* OKRs - Using new component */}
      <OKRProgress />

      {/* Release Timeline */}
      <ReleaseTimeline />

      {/* Feature Requests - Enhanced Component */}
      <FeatureRequests />

      {/* Prochaines Releases - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            Prochaines Releases
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Aucune release planifiée
          </p>
          <Badge variant="outline" className="text-[10px] gap-1 mt-2">
            <Link2 className="h-2.5 w-2.5" />
            Source requise : GitHub, CI/CD
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

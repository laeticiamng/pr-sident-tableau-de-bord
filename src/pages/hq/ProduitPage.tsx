import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Layers, 
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Rocket
} from "lucide-react";
import { PLATFORM_FEATURES, FEATURE_REQUESTS, UPCOMING_RELEASES } from "@/lib/mock-data";
import { OKRProgress } from "@/components/hq/product/OKRProgress";
import { RoadmapExportButton } from "@/components/hq/product/RoadmapExportButton";
import { ReleaseTimeline } from "@/components/hq/product/ReleaseTimeline";
import { FeatureRequests } from "@/components/hq/product/FeatureRequests";
import { cn } from "@/lib/utils";

const platforms = [
  { key: "emotionscare", name: "EmotionsCare" },
  { key: "pixel-perfect-replica", name: "Pixel Perfect Replica" },
  { key: "system-compass", name: "System Compass" },
  { key: "growth-copilot", name: "Growth Copilot" },
  { key: "med-mng", name: "Med MNG" },
];

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

      {/* Platform Roadmaps */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            Roadmaps par Plateforme
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des initiatives produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {platforms.map((platform) => {
              const features = PLATFORM_FEATURES[platform.key as keyof typeof PLATFORM_FEATURES] || { delivered: 0, inProgress: 0, blocked: 0 };
              return (
                <div 
                  key={platform.key} 
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-sm mb-3">{platform.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="text-muted-foreground">{features.delivered} livrées</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-warning" />
                      <span className="text-muted-foreground">{features.inProgress} en cours</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-muted-foreground">{features.blocked} bloquées</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* OKRs - Using new component */}
      <OKRProgress />

      {/* Release Timeline */}
      <ReleaseTimeline />

      {/* Feature Requests - Enhanced Component */}
      <FeatureRequests />

      {/* Prochaines Releases */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            Prochaines Releases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {UPCOMING_RELEASES.map((release, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{release.version}</p>
                    <p className="text-xs text-muted-foreground">{release.platform}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(release.date).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">{release.features} features</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

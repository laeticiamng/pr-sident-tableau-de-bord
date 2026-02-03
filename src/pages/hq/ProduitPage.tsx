import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Target, 
  Layers, 
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Rocket
} from "lucide-react";
import { PRODUCT_OKRS, PLATFORM_FEATURES, FEATURE_REQUESTS, UPCOMING_RELEASES } from "@/lib/mock-data";
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
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
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

      {/* OKRs */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            OKRs Trimestriels
          </CardTitle>
          <CardDescription>
            Objectifs et résultats clés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PRODUCT_OKRS.map((okr, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{okr.objective}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={okr.status === "on_track" ? "success" : "warning"}
                    >
                      {okr.status === "on_track" ? "En bonne voie" : "À risque"}
                    </Badge>
                    <Badge variant="subtle">{okr.progress}%</Badge>
                  </div>
                </div>
                <Progress value={okr.progress} className="h-2" />
                <div className="grid gap-2 md:grid-cols-3 mt-2">
                  {okr.keyResults.map((kr, krIndex) => (
                    <div 
                      key={krIndex}
                      className="p-2 rounded-lg bg-muted/30 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate">{kr.name}</span>
                        <span className={cn(
                          "font-mono",
                          kr.progress >= 70 ? "text-success" :
                          kr.progress >= 40 ? "text-warning" : "text-destructive"
                        )}>
                          {kr.progress}%
                        </span>
                      </div>
                      <Progress value={kr.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              Demandes de Fonctionnalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FEATURE_REQUESTS.map((request) => (
                <div 
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{request.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{request.platform}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="subtle" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {request.votes}
                    </Badge>
                    <Badge 
                      variant={
                        request.status === "completed" ? "success" :
                        request.status === "planned" ? "gold" : "subtle"
                      }
                    >
                      {request.status === "completed" ? "Terminé" :
                       request.status === "planned" ? "Planifié" : "En revue"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-primary" />
              Prochaines Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {UPCOMING_RELEASES.map((release, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow"
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
    </div>
  );
}

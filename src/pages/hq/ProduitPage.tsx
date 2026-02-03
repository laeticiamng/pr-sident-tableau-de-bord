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
  RefreshCw
} from "lucide-react";

const platforms = [
  { key: "emotionscare", name: "EmotionsCare" },
  { key: "pixel-perfect-replica", name: "Pixel Perfect Replica" },
  { key: "system-compass", name: "System Compass" },
  { key: "growth-copilot", name: "Growth Copilot" },
  { key: "med-mng", name: "Med MNG" },
];

const okrStatus = [
  { objective: "Améliorer l'expérience utilisateur", progress: 0, status: "not_started" },
  { objective: "Augmenter la rétention", progress: 0, status: "not_started" },
  { objective: "Lancer de nouvelles fonctionnalités", progress: 0, status: "not_started" },
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
            {platforms.map((platform) => (
              <div 
                key={platform.key} 
                className="p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-sm mb-3">{platform.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span className="text-muted-foreground">0 livrées</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-warning" />
                    <span className="text-muted-foreground">0 en cours</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">0 bloquées</span>
                  </div>
                </div>
              </div>
            ))}
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
            {okrStatus.map((okr, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{okr.objective}</span>
                  <Badge variant="subtle">{okr.progress}%</Badge>
                </div>
                <Progress value={okr.progress} className="h-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Status: Non démarré</span>
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
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande en attente</p>
              <p className="text-sm mt-1">
                Les demandes des utilisateurs apparaîtront ici.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-primary" />
              Prochaines Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune release planifiée</p>
              <p className="text-sm mt-1">
                Les releases à venir seront affichées ici.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

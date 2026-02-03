import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, Github, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function HQPlateformesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Plateformes</h1>
        <p className="text-muted-foreground text-lg">
          Vue d'ensemble des 5 plateformes managées.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-success mb-1">5</div>
          <div className="text-sm text-muted-foreground">Plateformes Actives</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-success mb-1">4</div>
          <div className="text-sm text-muted-foreground">Statut Vert</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-warning mb-1">1</div>
          <div className="text-sm text-muted-foreground">Statut Ambre</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-destructive mb-1">0</div>
          <div className="text-sm text-muted-foreground">Incidents Critiques</div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {MANAGED_PLATFORMS.map((platform, index) => (
          <div key={platform.key} className="card-executive p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                <div>
                  <h2 className="text-xl font-semibold">{platform.name}</h2>
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </div>
              <Badge variant={index === 1 ? "status-amber" : "status-green"}>
                {index === 1 ? "Ambre" : "Vert"}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <CheckCircle className="h-4 w-4 mx-auto mb-1 text-success" />
                <div className="text-xs text-muted-foreground">Uptime</div>
                <div className="font-semibold">99.9%</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <Activity className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Dernière Release</div>
                <div className="font-semibold">v1.{index}.0</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Dernier Check</div>
                <div className="font-semibold">Il y a 5m</div>
              </div>
            </div>

            {/* Last Director Report */}
            <div className="p-4 rounded-lg bg-secondary/20 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Dernier rapport directeur</span>
                <span className="text-xs text-muted-foreground">Aujourd'hui</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {index === 1 
                  ? "⚠️ Surveillance en cours sur les performances de l'API. Optimisation prévue cette semaine."
                  : "✅ Tous les indicateurs sont au vert. Aucune action requise."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href={platform.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                Ouvrir
              </Button>
              <Button variant="executive" size="sm" className="ml-auto">
                Préparer Release
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

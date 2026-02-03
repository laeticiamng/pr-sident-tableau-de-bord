import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, CheckCircle, AlertCircle, Zap } from "lucide-react";

const statusLabels = {
  production: { label: "Production", icon: CheckCircle, className: "bg-success text-success-foreground" },
  prototype: { label: "Prototype", icon: AlertCircle, className: "bg-warning text-warning-foreground" },
  development: { label: "Développement", icon: Zap, className: "bg-muted text-muted-foreground" },
};

export default function PlateformesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6">
              Écosystème
            </Badge>
            <h1 className="text-headline-1 md:text-display-2 mb-6">
              Nos 5 Plateformes
            </h1>
            <p className="text-body-lg text-muted-foreground">
              Chaque plateforme répond à un besoin spécifique, toutes sont pilotées 
              depuis notre siège social numérique avec les mêmes standards d'excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {MANAGED_PLATFORMS.map((platform, index) => {
              const statusConfig = statusLabels[platform.status as keyof typeof statusLabels] || statusLabels.development;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={platform.key}
                  className="card-executive p-8 flex flex-col animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold mb-2">{platform.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">
                    {platform.shortDescription}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{platform.tagline}"
                  </p>
                  <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">
                    {platform.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {platform.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {platform.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{platform.features.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold">{platform.stats.modules}</div>
                      <div className="text-[10px] text-muted-foreground">Modules</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold">{platform.stats.tables}</div>
                      <div className="text-[10px] text-muted-foreground">Tables</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold">{platform.stats.edgeFunctions}</div>
                      <div className="text-[10px] text-muted-foreground">Functions</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold">{platform.stats.branches}</div>
                      <div className="text-[10px] text-muted-foreground">Branches</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={platform.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                      Voir le projet
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-headline-1 mb-6">Gouvernance Centralisée</h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              Toutes nos plateformes partagent la même infrastructure backend, 
              les mêmes standards de sécurité et la même rigueur d'exécution. 
              Le siège social numérique assure la cohérence et la qualité 
              à travers l'ensemble de l'écosystème.
            </p>
            <div className="grid gap-4 md:grid-cols-4 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">5</div>
                <div className="text-sm text-muted-foreground">Plateformes Actives</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">~900</div>
                <div className="text-sm text-muted-foreground">Tables Supabase</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">~350</div>
                <div className="text-sm text-muted-foreground">Edge Functions</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">87</div>
                <div className="text-sm text-muted-foreground">Modules Métier</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

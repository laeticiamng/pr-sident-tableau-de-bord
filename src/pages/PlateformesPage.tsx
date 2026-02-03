import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {MANAGED_PLATFORMS.map((platform, index) => (
              <div
                key={platform.key}
                className="card-executive p-8 flex flex-col animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Status Indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium text-muted-foreground">
                    Plateforme Active
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3">{platform.name}</h3>
                <p className="text-muted-foreground flex-1 mb-6">
                  {platform.description}
                </p>

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
            ))}
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
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">5</div>
                <div className="text-sm text-muted-foreground">Plateformes Actives</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">1</div>
                <div className="text-sm text-muted-foreground">Base de Données Partagée</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Possibilités</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

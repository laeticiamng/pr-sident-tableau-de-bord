import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import {
  Phone,
  FileText,
  Shield,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BriefingRoom() {
  // Mock data - will be replaced by real data from DB
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Bonjour" : currentTime.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-1 mb-2">
            {greeting}, Madame la Présidente
          </h1>
          <p className="text-muted-foreground text-lg">
            Voici votre briefing exécutif du jour.
          </p>
        </div>
        <Button variant="hero" size="lg" className="animate-pulse-gold">
          <Phone className="h-5 w-5" />
          Appeler le Directeur Général
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Réunion DG", icon: Users, variant: "executive" as const },
          { label: "Brief Exécutif", icon: FileText, variant: "outline" as const },
          { label: "Audit Sécurité", icon: Shield, variant: "outline" as const },
          { label: "Plan Marketing", icon: TrendingUp, variant: "outline" as const },
          { label: "Préparer Release", icon: Package, variant: "outline" as const },
        ].map((action) => (
          <Button key={action.label} variant={action.variant} className="h-auto py-4 flex-col gap-2">
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Brief Card */}
        <div className="lg:col-span-2 card-executive p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Brief Exécutif du Jour</h2>
            <Badge variant="gold">Auto-généré</Badge>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-2">Résumé</p>
              <p className="font-medium">
                Toutes les plateformes sont opérationnelles. Aucun incident critique en cours. 
                2 approbations en attente de votre décision.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Santé Globale</span>
                </div>
                <p className="text-2xl font-bold">Excellente</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-warning mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Approbations</span>
                </div>
                <p className="text-2xl font-bold">2 en attente</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Blockers</span>
                </div>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals Inbox */}
        <div className="card-executive p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Approbations</h2>
            <Link to="/hq/approbations">
              <Button variant="ghost" size="sm">
                Tout voir
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { title: "Déploiement v2.1.0", platform: "EmotionsCare", priority: "medium" },
              { title: "Mise à jour RLS", platform: "System Compass", priority: "high" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">{item.title}</span>
                  <Badge variant={item.priority === "high" ? "status-amber" : "subtle"} className="text-xs">
                    {item.priority === "high" ? "Urgent" : "Normal"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{item.platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platforms RAG Status */}
      <div className="card-executive p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Statut des Plateformes</h2>
          <Link to="/hq/plateformes">
            <Button variant="outline" size="sm">
              Voir les détails
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {MANAGED_PLATFORMS.map((platform) => (
            <div
              key={platform.key}
              className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                <Badge variant="status-green" className="text-xs">Vert</Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{platform.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Opérationnelle. Aucun incident.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-executive p-6">
          <h2 className="text-xl font-semibold mb-4">Dernière Réunion DG</h2>
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("fr-FR")} — 09:00
              </span>
              <Badge variant="subtle">CEO_AGENT</Badge>
            </div>
            <p className="text-sm">
              Revue hebdomadaire des KPIs. Toutes les plateformes performent selon les objectifs. 
              Focus cette semaine : préparation de la release Growth Copilot v2.0.
            </p>
          </div>
        </div>

        <div className="card-executive p-6">
          <h2 className="text-xl font-semibold mb-4">Réunions Directeurs Plateforme</h2>
          <div className="space-y-3">
            {MANAGED_PLATFORMS.slice(0, 3).map((platform) => (
              <div key={platform.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${platform.color}`} />
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 2 jours</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

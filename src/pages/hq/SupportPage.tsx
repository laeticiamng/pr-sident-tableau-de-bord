import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HeadphonesIcon, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  RefreshCw
} from "lucide-react";

const supportKPIs = [
  { label: "Tickets Ouverts", value: "0", icon: MessageSquare },
  { label: "Temps Réponse Moy.", value: "—", icon: Clock },
  { label: "Taux Résolution", value: "—", icon: CheckCircle },
  { label: "Satisfaction Client", value: "—", icon: TrendingUp },
];

const ticketPriorities = [
  { priority: "Critique", count: 0, color: "destructive" },
  { priority: "Haute", count: 0, color: "warning" },
  { priority: "Moyenne", count: 0, color: "default" },
  { priority: "Basse", count: 0, color: "subtle" },
];

export default function SupportPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Support Console</h1>
          <p className="text-muted-foreground text-lg">
            Gestion centralisée du support client.
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {supportKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* By Priority */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Par Priorité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticketPriorities.map((item) => (
                <div 
                  key={item.priority}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <Badge variant={item.color as any}>{item.priority}</Badge>
                  <span className="text-xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Platform */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              Par Plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun ticket</p>
              <p className="text-sm mt-1">
                La répartition par plateforme apparaîtra ici.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              Base de Connaissances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>0 articles</p>
              <p className="text-sm mt-1">
                Documentation support à créer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            Tickets Récents
          </CardTitle>
          <CardDescription>
            Dernières demandes de support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun ticket en cours</p>
            <p className="text-sm mt-1">
              Les demandes de support apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Response Templates */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Templates de Réponse
          </CardTitle>
          <CardDescription>
            Modèles de réponse préparés par les agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Bienvenue & Onboarding",
              "Problème Technique",
              "Demande de Fonctionnalité",
              "Facturation & Paiement",
              "Fermeture de Compte",
              "Escalade vers Équipe",
            ].map((template) => (
              <div 
                key={template}
                className="p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <span className="text-sm">{template}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

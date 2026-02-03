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
  RefreshCw,
  Star,
  ExternalLink
} from "lucide-react";
import { 
  SUPPORT_KPIS, 
  SUPPORT_TICKETS_BY_PRIORITY, 
  SUPPORT_TICKETS_BY_PLATFORM,
  KNOWLEDGE_BASE_ARTICLES 
} from "@/lib/mock-data";

export default function SupportPage() {
  const kpis = [
    { label: "Tickets Ouverts", value: SUPPORT_KPIS.openTickets.toString(), icon: MessageSquare },
    { label: "Temps Réponse Moy.", value: SUPPORT_KPIS.avgResponseTime, icon: Clock },
    { label: "Taux Résolution", value: `${SUPPORT_KPIS.resolutionRate}%`, icon: CheckCircle },
    { 
      label: "Satisfaction Client", 
      value: `${SUPPORT_KPIS.customerSatisfaction}/5`, 
      icon: Star,
      extra: "⭐".repeat(Math.round(SUPPORT_KPIS.customerSatisfaction))
    },
  ];

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
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.extra && (
                <div className="text-sm mt-1">{kpi.extra}</div>
              )}
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
              {SUPPORT_TICKETS_BY_PRIORITY.map((item) => (
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
            <div className="space-y-3">
              {SUPPORT_TICKETS_BY_PLATFORM.map((item) => (
                <div 
                  key={item.platform}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="text-sm font-medium">{item.platform}</span>
                  <Badge variant={item.count > 0 ? "default" : "subtle"}>{item.count}</Badge>
                </div>
              ))}
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
            <CardDescription>
              {KNOWLEDGE_BASE_ARTICLES.length} articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {KNOWLEDGE_BASE_ARTICLES.slice(0, 4).map((article) => (
                <div 
                  key={article.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <span className="text-sm truncate flex-1">{article.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{article.views}</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2">
                Voir tous les articles
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
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
          <div className="space-y-3">
            {[
              { id: "TKT-001", subject: "Problème de connexion EmotionsCare", priority: "high", status: "open", created: "Il y a 2h" },
              { id: "TKT-002", subject: "Question facturation Growth Copilot", priority: "medium", status: "pending", created: "Il y a 4h" },
              { id: "TKT-003", subject: "Bug affichage mobile", priority: "low", status: "resolved", created: "Il y a 1j" },
            ].map((ticket) => (
              <div 
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {ticket.status === "open" && <MessageSquare className="h-5 w-5 text-warning" />}
                  {ticket.status === "pending" && <Clock className="h-5 w-5 text-primary" />}
                  {ticket.status === "resolved" && <CheckCircle className="h-5 w-5 text-success" />}
                  <div>
                    <p className="font-medium text-sm">{ticket.subject}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-mono">{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.created}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      ticket.priority === "high" ? "destructive" : 
                      ticket.priority === "medium" ? "warning" : "subtle"
                    }
                  >
                    {ticket.priority === "high" ? "Haute" : ticket.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                  <Badge 
                    variant={
                      ticket.status === "resolved" ? "success" : 
                      ticket.status === "open" ? "warning" : "subtle"
                    }
                  >
                    {ticket.status === "resolved" ? "Résolu" : ticket.status === "open" ? "Ouvert" : "En attente"}
                  </Badge>
                </div>
              </div>
            ))}
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
                className="p-3 rounded-lg border hover:bg-muted/30 hover:border-primary/50 cursor-pointer transition-all"
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

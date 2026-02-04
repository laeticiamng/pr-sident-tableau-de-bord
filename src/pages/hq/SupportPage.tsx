import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle,
  FileText,
  RefreshCw,
  Star,
  ExternalLink
} from "lucide-react";
import { SLAMonitor } from "@/components/hq/support/SLAMonitor";
import { TicketsByPriority } from "@/components/hq/support/TicketsByPriority";
import { TicketTrendChart } from "@/components/hq/support/TicketTrendChart";
import { SUPPORT_KPIS, KNOWLEDGE_BASE_ARTICLES } from "@/lib/mock-data";

export default function SupportPage() {
  const kpis = [
    { label: "Tickets Ouverts", value: SUPPORT_KPIS.openTickets.toString(), icon: MessageSquare },
    { label: "Temps Réponse Moy.", value: SUPPORT_KPIS.avgResponseTime, icon: Clock },
    { label: "Taux Résolution", value: `${SUPPORT_KPIS.resolutionRate}%`, icon: CheckCircle },
    { label: "Satisfaction Client", value: `${SUPPORT_KPIS.customerSatisfaction}/5`, icon: Star, extra: "⭐".repeat(Math.round(SUPPORT_KPIS.customerSatisfaction)) },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Support Console</h1>
          <p className="text-muted-foreground text-lg">Gestion centralisée du support client.</p>
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
              {kpi.extra && <div className="text-sm mt-1">{kpi.extra}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Overview & Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TicketsByPriority />
        <TicketTrendChart />
      </div>

      {/* SLA Monitoring */}
      <SLAMonitor />

      {/* Knowledge Base */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Base de Connaissances
          </CardTitle>
          <CardDescription>{KNOWLEDGE_BASE_ARTICLES.length} articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {KNOWLEDGE_BASE_ARTICLES.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-all">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{article.title}</span>
                  <Badge variant="subtle" className="text-xs mt-1">{article.category}</Badge>
                </div>
                <span className="text-xs text-muted-foreground ml-2">{article.views} vues</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            Tickets Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "TKT-001", subject: "Problème de connexion EmotionsCare", priority: "high", status: "open", created: "Il y a 2h" },
              { id: "TKT-002", subject: "Question facturation Growth Copilot", priority: "medium", status: "pending", created: "Il y a 4h" },
              { id: "TKT-003", subject: "Bug affichage mobile", priority: "low", status: "resolved", created: "Il y a 1j" },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
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
                  <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "warning" : "subtle"}>
                    {ticket.priority === "high" ? "Haute" : ticket.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                  <Badge variant={ticket.status === "resolved" ? "success" : ticket.status === "open" ? "warning" : "subtle"}>
                    {ticket.status === "resolved" ? "Résolu" : ticket.status === "open" ? "Ouvert" : "En attente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
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
  Database,
  Link2,
  AlertTriangle
} from "lucide-react";
import { SLAMonitor } from "@/components/hq/support/SLAMonitor";
import { TicketsByPriority } from "@/components/hq/support/TicketsByPriority";
import { TicketTrendChart } from "@/components/hq/support/TicketTrendChart";
import { EscalationQueue } from "@/components/hq/support/EscalationQueue";
import { TicketDistributionChart } from "@/components/hq/support/TicketDistributionChart";

export default function SupportPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Support Console</h1>
          <p className="text-muted-foreground text-lg">Gestion centralisée du support client multi-plateformes.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* KPIs - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Métriques Support
            </CardTitle>
            <Badge variant="destructive" className="text-[9px]">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Non connecté
            </Badge>
          </div>
          <CardDescription>
            Tickets, temps de réponse, satisfaction
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-sm font-semibold mb-1">Connexion Helpdesk requise</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Connectez Zendesk, Freshdesk ou Intercom pour les métriques support.
          </p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Link2 className="h-2.5 w-2.5" />
            Sources : Zendesk, Freshdesk, Intercom
          </Badge>
        </CardContent>
      </Card>

      {/* Ticket Overview & Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TicketsByPriority />
        <TicketTrendChart />
      </div>

      {/* Ticket Distribution */}
      <TicketDistributionChart />

      {/* Escalation Queue */}
      <EscalationQueue />

      {/* SLA Monitoring */}
      <SLAMonitor />

      {/* Knowledge Base - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Base de Connaissances
          </CardTitle>
          <CardDescription>Articles et FAQ</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Aucun article disponible
          </p>
        </CardContent>
      </Card>

      {/* Recent Tickets - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            Tickets Récents
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Aucun ticket récent
          </p>
          <Badge variant="outline" className="text-[10px] gap-1 mt-2">
            <Link2 className="h-2.5 w-2.5" />
            Source requise : Helpdesk
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

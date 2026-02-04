import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp,
  Calendar,
  FileText,
  ArrowRight,
  Phone,
  ArrowUpRight
} from "lucide-react";
import { SALES_KPIS, SALES_PIPELINE, SALES_ACTIVITIES, RECENT_OPPORTUNITIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { SalesPipelineChart } from "@/components/hq/charts/SalesPipelineChart";
import { ConversionFunnelChart } from "@/components/hq/charts/ConversionFunnelChart";

export default function VentesPage() {
  const kpis = [
    { 
      label: "CA Mensuel", 
      value: `${SALES_KPIS.monthlyRevenue.toLocaleString("fr-FR")} €`, 
      change: SALES_KPIS.monthlyRevenueChange,
      icon: DollarSign 
    },
    { 
      label: "Deals en Cours", 
      value: SALES_KPIS.activeDeals.toString(), 
      icon: Briefcase 
    },
    { 
      label: "Taux de Conversion", 
      value: `${SALES_KPIS.conversionRate}%`, 
      icon: Target 
    },
    { 
      label: "Clients Actifs", 
      value: SALES_KPIS.activeClients.toString(), 
      icon: Users 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Ventes & Commercial</h1>
          <p className="text-muted-foreground text-lg">
            Pipeline commercial et suivi des opportunités.
          </p>
        </div>
        <Button variant="executive">
          <Phone className="h-4 w-4 mr-2" />
          Nouveau Prospect
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                {kpi.change && <ArrowUpRight className="h-4 w-4 text-success" />}
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
              {kpi.change && (
                <div className="text-xs text-success mt-1">
                  +{kpi.change}% vs mois dernier
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesPipelineChart />
        <ConversionFunnelChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Deals */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-primary" />
              Opportunités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_OPPORTUNITIES.map((opp) => (
                <div 
                  key={opp.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{opp.name}</p>
                    <p className="text-xs text-muted-foreground">{opp.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{opp.value.toLocaleString("fr-FR")} €</p>
                    <p className="text-xs text-muted-foreground">{opp.probability}% proba</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              Prochaines Activités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SALES_ACTIVITIES.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === "call" && <Phone className="h-4 w-4 text-primary" />}
                    {activity.type === "meeting" && <Users className="h-4 w-4 text-primary" />}
                    {activity.type === "proposal" && <FileText className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="font-medium text-sm">{activity.prospect}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(activity.date).toLocaleDateString("fr-FR")}</p>
                    <Badge variant={activity.status === "scheduled" ? "subtle" : "gold"} className="text-xs">
                      {activity.status === "scheduled" ? "Planifié" : "Envoyé"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Propositions Commerciales
          </CardTitle>
          <CardDescription>
            Devis et propositions en attente de validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {RECENT_OPPORTUNITIES.filter(o => o.stage === "Proposition" || o.stage === "Négociation").map((opp) => (
              <div 
                key={opp.id}
                className="p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-sm mb-2">{opp.name}</h4>
                <div className="flex items-center justify-between">
                  <Badge variant="gold">{opp.value.toLocaleString("fr-FR")} €</Badge>
                  <Badge variant="subtle">{opp.probability}%</Badge>
                </div>
              </div>
            ))}
            {RECENT_OPPORTUNITIES.filter(o => o.stage === "Proposition" || o.stage === "Négociation").length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune proposition en cours</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

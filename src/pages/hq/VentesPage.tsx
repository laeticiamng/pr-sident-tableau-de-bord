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
  Phone
} from "lucide-react";

const pipelineStages = [
  { name: "Prospects", count: 0, value: "0 €" },
  { name: "Qualification", count: 0, value: "0 €" },
  { name: "Proposition", count: 0, value: "0 €" },
  { name: "Négociation", count: 0, value: "0 €" },
  { name: "Clôture", count: 0, value: "0 €" },
];

const salesKPIs = [
  { label: "CA Mensuel", value: "—", icon: DollarSign },
  { label: "Deals en Cours", value: "0", icon: Briefcase },
  { label: "Taux de Conversion", value: "—", icon: Target },
  { label: "Clients Actifs", value: "—", icon: Users },
];

export default function VentesPage() {
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
        {salesKPIs.map((kpi) => (
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

      {/* Pipeline */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pipeline Commercial
          </CardTitle>
          <CardDescription>
            Vue d'ensemble du funnel de vente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="w-full p-4 rounded-lg border bg-muted/30 text-center">
                    <div className="font-medium text-sm">{stage.name}</div>
                    <div className="text-2xl font-bold mt-2">{stage.count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stage.value}</div>
                  </div>
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune opportunité en cours</p>
              <p className="text-sm mt-1">Les deals apparaîtront ici.</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune activité planifiée</p>
              <p className="text-sm mt-1">Les rendez-vous et suivis seront affichés ici.</p>
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
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune proposition en cours</p>
            <p className="text-sm mt-1">
              Les propositions nécessitant approbation apparaîtront ici.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

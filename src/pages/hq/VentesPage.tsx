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
  Phone,
  Database,
  Link2,
  AlertTriangle
} from "lucide-react";
import { SalesPipelineChart } from "@/components/hq/charts/SalesPipelineChart";
import { ConversionFunnelChart } from "@/components/hq/charts/ConversionFunnelChart";
import { TopClients } from "@/components/hq/sales/TopClients";
import { WinLossWidget } from "@/components/hq/sales/WinLossWidget";
import { DealVelocityWidget } from "@/components/hq/sales/DealVelocityWidget";

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

      {/* KPIs - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Métriques Commerciales
            </CardTitle>
            <Badge variant="destructive" className="text-[9px]">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Non connecté
            </Badge>
          </div>
          <CardDescription>
            CA, deals, conversions, clients actifs
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-sm font-semibold mb-1">Connexion CRM requise</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Connectez votre CRM (HubSpot, Pipedrive) pour les KPIs commerciaux.
          </p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Link2 className="h-2.5 w-2.5" />
            Sources : HubSpot, Pipedrive, Stripe
          </Badge>
        </CardContent>
      </Card>

      {/* Pipeline Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesPipelineChart />
        <ConversionFunnelChart />
      </div>

      {/* Win/Loss & Deal Velocity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WinLossWidget />
        <DealVelocityWidget />
      </div>

      {/* Opportunités & Activités - États vides */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-primary" />
              Opportunités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Connectez un CRM pour voir vos opportunités
            </p>
          </CardContent>
        </Card>

        <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              Prochaines Activités
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Connectez un calendrier pour voir vos activités
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <TopClients />

      {/* Proposals - État vide */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Propositions Commerciales
          </CardTitle>
          <CardDescription>
            Devis et propositions en attente de validation
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Aucune proposition en cours
          </p>
          <Badge variant="outline" className="text-[10px] gap-1 mt-2">
            <Link2 className="h-2.5 w-2.5" />
            Source requise : CRM
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

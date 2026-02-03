import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";

const financialKPIs = [
  { 
    label: "Chiffre d'Affaires", 
    value: "—", 
    change: "—",
    trend: "neutral",
    icon: DollarSign 
  },
  { 
    label: "Dépenses Mensuelles", 
    value: "—", 
    change: "—",
    trend: "neutral",
    icon: CreditCard 
  },
  { 
    label: "Marge Brute", 
    value: "—", 
    change: "—",
    trend: "neutral",
    icon: TrendingUp 
  },
  { 
    label: "Trésorerie", 
    value: "—", 
    change: "—",
    trend: "neutral",
    icon: Wallet 
  },
];

const platformCosts = [
  { name: "EmotionsCare", hosting: "—", compute: "—", total: "—" },
  { name: "Pixel Perfect Replica", hosting: "—", compute: "—", total: "—" },
  { name: "System Compass", hosting: "—", compute: "—", total: "—" },
  { name: "Growth Copilot", hosting: "—", compute: "—", total: "—" },
  { name: "Med MNG", hosting: "—", compute: "—", total: "—" },
];

export default function FinancePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Finance & ROI</h1>
          <p className="text-muted-foreground text-lg">
            Vue financière consolidée de l'entreprise.
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {financialKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                {kpi.trend === "up" && <ArrowUpRight className="h-4 w-4 text-success" />}
                {kpi.trend === "down" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
              <div className="text-xs text-muted-foreground mt-2">{kpi.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Costs */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              Coûts par Plateforme
            </CardTitle>
            <CardDescription>
              Répartition des dépenses d'infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformCosts.map((platform) => (
                <div 
                  key={platform.name} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="font-medium text-sm">{platform.name}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Hébergement: {platform.hosting}</span>
                    <span>Compute: {platform.compute}</span>
                    <Badge variant="subtle">{platform.total}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Platform */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenus par Plateforme
            </CardTitle>
            <CardDescription>
              Contribution au chiffre d'affaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Données non disponibles</p>
              <p className="text-sm mt-1">
                Configurez les sources de revenus pour chaque plateforme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Economics */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            Unit Economics
          </CardTitle>
          <CardDescription>
            Métriques clés de rentabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg border text-center">
              <div className="text-sm text-muted-foreground mb-2">CAC</div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground">Coût d'Acquisition</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-sm text-muted-foreground mb-2">LTV</div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground">Valeur Client</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-sm text-muted-foreground mb-2">LTV/CAC</div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground">Ratio</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-sm text-muted-foreground mb-2">Payback</div>
              <div className="text-2xl font-bold">—</div>
              <div className="text-xs text-muted-foreground">Mois</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

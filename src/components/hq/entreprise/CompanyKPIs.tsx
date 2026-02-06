import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Briefcase,
  Target,
  Calendar,
  Award,
  Database
} from "lucide-react";
import { useStripeKPIs, formatPercentage } from "@/hooks/useStripeKPIs";
import { useAgents } from "@/hooks/useHQData";

const COMPANY_CONSTANTS = {
  founded: "2025-05-15",
  platforms: 5,
};

export function CompanyKPIs() {
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();
  const { data: agents, isLoading: agentsLoading } = useAgents();

  const ageInMonths = Math.floor(
    (new Date().getTime() - new Date(COMPANY_CONSTANTS.founded).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const totalCustomers = stripeData?.kpis?.totalCustomers;
  const mrrChange = stripeData?.kpis?.mrrChange;
  const agentCount = agents?.length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          Indicateurs Société
        </CardTitle>
        <CardDescription>
          Métriques clés de l'entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{ageInMonths}</p>
            <p className="text-xs text-muted-foreground">Mois d'activité</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/5">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{COMPANY_CONSTANTS.platforms}</p>
            <p className="text-xs text-muted-foreground">Plateformes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/5">
            <Users className="h-5 w-5 mx-auto mb-2 text-accent" />
            {agentsLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold">{agentCount ?? "—"}</p>
            )}
            <p className="text-xs text-muted-foreground">Agents IA</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/5">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-warning" />
            {stripeLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold">
                {mrrChange != null ? formatPercentage(mrrChange) : "—"}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Croissance MRR</p>
          </div>
        </div>

        {/* Clients Stripe */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Clients Stripe</span>
            </div>
            {stripeLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <Badge variant="gold">
                {totalCustomers != null ? totalCustomers : "—"}
              </Badge>
            )}
          </div>
        </div>

        {/* Objectives - Not configured */}
        <div className="mb-6 p-4 rounded-lg border border-dashed border-muted-foreground/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Target className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Objectifs Annuels</p>
              <p className="text-xs">Aucun objectif configuré — nécessite un module OKR</p>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px]">OKR</Badge>
          </div>
        </div>

        {/* Milestones - Not configured */}
        <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Award className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Jalons Clés</p>
              <p className="text-xs">Aucun jalon configuré — nécessite un suivi stratégique</p>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px]">Roadmap</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

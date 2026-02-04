import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  Bot, 
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle
} from "lucide-react";
import { useAgents } from "@/hooks/useHQData";
import { cn } from "@/lib/utils";
import { TeamPerformanceMetrics } from "@/components/hq/rh/TeamPerformanceMetrics";
import { OnboardingTracker } from "@/components/hq/rh/OnboardingTracker";

export default function RHPage() {
  const { data: agents, isLoading } = useAgents();

  // Statistiques des agents IA
  const totalAgents = agents?.length || 0;
  const activeAgents = agents?.filter(a => a.is_enabled).length || 0;
  const agentsByCategory = agents?.reduce((acc, agent) => {
    const cat = agent.role_category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // KPIs RH simulés (agents IA)
  const rhKPIs = {
    productivityScore: 94,
    tasksCompleted: 1247,
    avgResponseTime: "2.3s",
    uptime: 99.9,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Ressources Humaines IA</h1>
        <p className="text-muted-foreground text-lg">
          Gestion des agents IA et performance de l'équipe exécutive.
        </p>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAgents}</p>
                <p className="text-xs text-muted-foreground">Agents IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAgents}</p>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rhKPIs.productivityScore}%</p>
                <p className="text-xs text-muted-foreground">Productivité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rhKPIs.uptime}%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents par département */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Répartition par Département
          </CardTitle>
          <CardDescription>
            Distribution des agents IA par catégorie fonctionnelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(agentsByCategory).map(([category, count]) => {
                const countNum = typeof count === 'number' ? count : 0;
                const percentage = totalAgents > 0 ? (countNum / totalAgents) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="subtle">{countNum} agents</Badge>
                        <span className="text-muted-foreground font-mono">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des agents */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Équipe Exécutive IA
          </CardTitle>
          <CardDescription>
            Tous les agents IA de l'organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {agents?.map(agent => (
                <div
                  key={agent.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    agent.is_enabled ? "bg-card hover:bg-muted/30" : "bg-muted/20 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.is_enabled ? "bg-success" : "bg-muted-foreground"
                    )} />
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.role_title_fr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="subtle" className="text-xs capitalize">
                      {agent.role_category}
                    </Badge>
                    <Badge 
                      variant={agent.is_enabled ? "gold" : "secondary"}
                      className="text-xs"
                    >
                      {agent.is_enabled ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Tracker */}
      <OnboardingTracker />

      {/* Performance globale - Composant dédié */}
      <TeamPerformanceMetrics />
    </div>
  );
}

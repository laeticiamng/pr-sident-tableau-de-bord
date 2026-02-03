import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Users, Building2, Bot, Power, RefreshCw } from "lucide-react";
import { useAgents, useOrgRoles } from "@/hooks/useHQData";

const categoryLabels = {
  c_suite: "Comité Exécutif",
  function_head: "Responsables de Fonction",
  platform_gm: "Directeurs Généraux Plateforme",
};

const categoryIcons = {
  c_suite: Users,
  function_head: Building2,
  platform_gm: Bot,
};

const categoryColors = {
  c_suite: "gold",
  function_head: "default",
  platform_gm: "subtle",
};

export default function EquipeExecutivePage() {
  const { data: agents, isLoading: agentsLoading, refetch } = useAgents();
  const { data: orgRoles, isLoading: rolesLoading } = useOrgRoles();

  const isLoading = agentsLoading || rolesLoading;

  // Group agents by category
  const groupedAgents = agents?.reduce((acc, agent) => {
    const category = agent.role_category || "c_suite";
    if (!acc[category]) acc[category] = [];
    acc[category].push(agent);
    return acc;
  }, {} as Record<string, typeof agents>);

  // Count by category
  const countByCategory = {
    c_suite: groupedAgents?.c_suite?.length || 0,
    function_head: groupedAgents?.function_head?.length || 0,
    platform_gm: groupedAgents?.platform_gm?.length || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Équipe Executive</h1>
          <p className="text-muted-foreground text-lg">
            Organigramme complet des directeurs et agents du siège.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {isLoading ? "..." : agents?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Agents</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? "..." : countByCategory.c_suite}
            </div>
            <div className="text-sm text-muted-foreground">Directeurs Exécutifs</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {isLoading ? "..." : countByCategory.function_head}
            </div>
            <div className="text-sm text-muted-foreground">Responsables Fonction</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground mb-1">
              {isLoading ? "..." : countByCategory.platform_gm}
            </div>
            <div className="text-sm text-muted-foreground">Directeurs Plateforme</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Groups */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        Object.entries(categoryLabels).map(([category, label]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          const categoryAgents = groupedAgents?.[category] || [];
          
          return (
            <Card key={category} className="card-executive">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  {label}
                </CardTitle>
                <CardDescription>
                  {categoryAgents.length} agent{categoryAgents.length > 1 ? "s" : ""} dans cette catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryAgents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryAgents.map((agent) => (
                      <div 
                        key={agent.id} 
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge 
                            variant={categoryColors[category as keyof typeof categoryColors] as any} 
                            className="font-mono text-xs"
                          >
                            {agent.role_key}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Power className={`h-3 w-3 ${agent.is_enabled ? "text-success" : "text-muted-foreground"}`} />
                            <Switch 
                              checked={agent.is_enabled} 
                              disabled 
                              className="scale-75"
                            />
                          </div>
                        </div>
                        <h3 className="font-semibold">{agent.role_title_fr || agent.name}</h3>
                        {agent.model_preference && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono">
                            Modèle: {agent.model_preference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CategoryIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun agent dans cette catégorie</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Building2, Bot, Power, RefreshCw, Play, Sparkles, Zap } from "lucide-react";
import { useAgents, useOrgRoles } from "@/hooks/useHQData";
import { useRunQueue } from "@/hooks/useRunQueue";
import { AGENT_PROFILES, getAgentProfile, AgentProfile } from "@/lib/agent-profiles";
import { AgentPerformanceWidget } from "@/components/hq/equipe/AgentPerformanceWidget";

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
  const { enqueue } = useRunQueue();
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

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
                    {categoryAgents.map((agent) => {
                      const profile = getAgentProfile(agent.role_key);
                      
                      return (
                        <div 
                          key={agent.id} 
                          className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                          onClick={() => profile && setSelectedAgent(profile)}
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
                          {profile && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {profile.specialty}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {profile?.capabilities.slice(0, 2).map(cap => (
                              <Badge key={cap.id} variant="subtle" className="text-[10px]">
                                {cap.name}
                              </Badge>
                            ))}
                            {profile && profile.capabilities.length > 2 && (
                              <Badge variant="subtle" className="text-[10px]">
                                +{profile.capabilities.length - 2}
                              </Badge>
                            )}
                          </div>
                          {agent.model_preference && (
                            <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                              {agent.model_preference}
                            </p>
                          )}
                        </div>
                      );
                    })}
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

      {/* Agent Performance Widget */}
      <AgentPerformanceWidget />

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {selectedAgent?.nameFr}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgent && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Modèle IA</p>
                  <p className="font-mono text-sm">{selectedAgent.model}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Catégorie</p>
                  <Badge variant="gold">
                    {categoryLabels[selectedAgent.category]}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Spécialité
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAgent.specialty}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Capacités
                </h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {selectedAgent.capabilities.map(cap => (
                      <div key={cap.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm">{cap.name}</h5>
                          {cap.runTypes.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => {
                                    cap.runTypes.forEach(rt => enqueue(rt));
                                    setSelectedAgent(null);
                                  }}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Lancer
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Lancer ce run</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{cap.description}</p>
                        {cap.runTypes.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {cap.runTypes.map(rt => (
                              <Badge key={rt} variant="subtle" className="text-[10px]">
                                {rt}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

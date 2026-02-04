import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Building2, Bot, Power, RefreshCw, Play, Sparkles, Zap, Crown, Briefcase } from "lucide-react";
import { useAgents, useOrgRoles } from "@/hooks/useHQData";
import { useRunQueue } from "@/hooks/useRunQueue";
import { AGENT_PROFILES, getAgentProfile, getAgentStats, AgentProfile } from "@/lib/agent-profiles";
import { AgentPerformanceWidget } from "@/components/hq/equipe/AgentPerformanceWidget";

const categoryLabels: Record<string, string> = {
  direction: "Direction Générale",
  c_suite: "Comité Exécutif (C-Suite)",
  function_head: "Responsables de Fonction",
  platform_gm: "Directeurs Généraux Plateforme",
  department: "Chefs de Département",
};

const categoryIcons: Record<string, typeof Users> = {
  direction: Crown,
  c_suite: Users,
  function_head: Building2,
  platform_gm: Bot,
  department: Briefcase,
};

const categoryColors: Record<string, string> = {
  direction: "gold",
  c_suite: "default",
  function_head: "subtle",
  platform_gm: "secondary",
  department: "outline",
};

const categoryOrder = ["direction", "c_suite", "function_head", "platform_gm", "department"];

export default function EquipeExecutivePage() {
  const { data: agents, isLoading: agentsLoading, refetch } = useAgents();
  const { data: orgRoles, isLoading: rolesLoading } = useOrgRoles();
  const { enqueue } = useRunQueue();
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  const isLoading = agentsLoading || rolesLoading;
  
  // Get stats from agent-profiles.ts (source of truth)
  const agentStats = getAgentStats();

  // Group AGENT_PROFILES by category (source of truth for 39 agents)
  const groupedProfiles = AGENT_PROFILES.reduce((acc, profile) => {
    const category = profile.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(profile);
    return acc;
  }, {} as Record<string, AgentProfile[]>);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Équipe Executive</h1>
          <p className="text-muted-foreground text-lg">
            39 employés IA répartis en 5 catégories (37 départements + 2 Direction).
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="card-executive bg-gradient-to-br from-gold/10 to-transparent border-gold/30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">{agentStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Agents</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Crown className="h-5 w-5 mx-auto mb-2 text-gold" />
            <div className="text-2xl font-bold text-gold mb-1">{agentStats.direction}</div>
            <div className="text-xs text-muted-foreground">Direction</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary mb-1">{agentStats.cSuite}</div>
            <div className="text-xs text-muted-foreground">C-Suite</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Building2 className="h-5 w-5 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-success mb-1">{agentStats.functionHeads}</div>
            <div className="text-xs text-muted-foreground">Function Heads</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent mb-1">{agentStats.platformGMs + agentStats.departments}</div>
            <div className="text-xs text-muted-foreground">GMs + Départements</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Groups - From AGENT_PROFILES (source of truth) */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        categoryOrder.map((category) => {
          const CategoryIcon = categoryIcons[category] || Users;
          const categoryProfiles = groupedProfiles[category] || [];
          const label = categoryLabels[category] || category;
          
          if (categoryProfiles.length === 0) return null;
          
          return (
            <Card key={category} className="card-executive">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  {label}
                </CardTitle>
                <CardDescription>
                  {categoryProfiles.length} agent{categoryProfiles.length > 1 ? "s" : ""} dans cette catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryProfiles.map((profile) => {
                    // Try to find matching agent from DB for status
                    const dbAgent = agents?.find(a => a.role_key === profile.roleKey);
                    const isEnabled = dbAgent?.is_enabled ?? true;
                    
                    return (
                      <div 
                        key={profile.roleKey} 
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                        onClick={() => setSelectedAgent(profile)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge 
                            variant={categoryColors[category] as any} 
                            className="font-mono text-xs"
                          >
                            {profile.roleKey}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Power className={`h-3 w-3 ${isEnabled ? "text-success" : "text-muted-foreground"}`} />
                            <Switch 
                              checked={isEnabled} 
                              disabled 
                              className="scale-75"
                            />
                          </div>
                        </div>
                        <h3 className="font-semibold">{profile.nameFr}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {profile.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {profile.capabilities.slice(0, 2).map(cap => (
                            <Badge key={cap.id} variant="subtle" className="text-[10px]">
                              {cap.name}
                            </Badge>
                          ))}
                          {profile.capabilities.length > 2 && (
                            <Badge variant="subtle" className="text-[10px]">
                              +{profile.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                          {profile.model}
                        </p>
                      </div>
                    );
                  })}
                </div>
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

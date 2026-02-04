import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Bot, Power, RefreshCw, Play, Sparkles, Zap, Crown, Briefcase } from "lucide-react";
import { useAgents } from "@/hooks/useHQData";
import { useRunQueue } from "@/hooks/useRunQueue";
import { AGENT_PROFILES, DEPARTMENTS, getAgentStats, getAgentsByDepartment, getDirectionAgents, AgentProfile, DepartmentKey } from "@/lib/agent-profiles";
import { AgentPerformanceWidget } from "@/components/hq/equipe/AgentPerformanceWidget";

const departmentIcons: Record<string, typeof Users> = {
  direction: Crown,
  marketing: Users,
  commercial: Briefcase,
  finance: Briefcase,
  security: Briefcase,
  product: Briefcase,
  engineering: Bot,
  data: Bot,
  support: Users,
  governance: Crown,
  people: Users,
  innovation: Sparkles,
};

const departmentColors: Record<string, string> = {
  direction: "gold",
  marketing: "default",
  commercial: "secondary",
  finance: "subtle",
  security: "destructive",
  product: "default",
  engineering: "secondary",
  data: "subtle",
  support: "default",
  governance: "gold",
  people: "subtle",
  innovation: "default",
};

export default function EquipeExecutivePage() {
  const { data: agents, isLoading: agentsLoading, refetch } = useAgents();
  const { enqueue } = useRunQueue();
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  // Get stats from agent-profiles.ts (source of truth)
  const agentStats = getAgentStats();

  // Get direction agents (CGO/QCO)
  const directionAgents = getDirectionAgents();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Équipe Executive</h1>
          <p className="text-muted-foreground text-lg">
            {agentStats.total} employés IA : 2 Direction (CGO/QCO) + {agentStats.departmentAgents} agents répartis dans {agentStats.totalDepartments} départements.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary mb-1">{agentStats.totalDepartments}</div>
            <div className="text-xs text-muted-foreground">Départements</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-success mb-1">{agentStats.departmentHeads}</div>
            <div className="text-xs text-muted-foreground">Chefs Département</div>
          </CardContent>
        </Card>
      </div>

      {/* Direction (CGO + QCO) */}
      {agentsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card className="card-executive bg-gradient-to-br from-gold/5 to-transparent border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-gold" />
              Direction Générale
            </CardTitle>
            <CardDescription>
              {directionAgents.length} directeur{directionAgents.length > 1 ? "s" : ""} — Pilotage stratégique global
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {directionAgents.map((profile) => {
                const dbAgent = agents?.find(a => a.role_key === profile.roleKey);
                const isEnabled = dbAgent?.is_enabled ?? true;
                
                return (
                  <div 
                    key={profile.roleKey} 
                    className="p-4 rounded-lg border border-gold/30 bg-gold/5 hover:shadow-md transition-shadow cursor-pointer hover:border-gold/50"
                    onClick={() => setSelectedAgent(profile)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="gold" className="font-mono text-xs">
                        {profile.roleKey}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Power className={`h-3 w-3 ${isEnabled ? "text-success" : "text-muted-foreground"}`} />
                        <Switch checked={isEnabled} disabled className="scale-75" />
                      </div>
                    </div>
                    <h3 className="font-semibold">{profile.nameFr}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{profile.specialty}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {profile.capabilities.slice(0, 2).map(cap => (
                        <Badge key={cap.id} variant="subtle" className="text-[10px]">
                          {cap.name}
                        </Badge>
                      ))}
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
      )}

      {/* 11 Départements */}
      {agentsLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        Object.entries(DEPARTMENTS).map(([deptKey, deptInfo]) => {
          const DeptIcon = departmentIcons[deptKey] || Users;
          const deptAgents = getAgentsByDepartment(deptKey);
          
          if (deptAgents.length === 0) return null;
          
          return (
            <Card key={deptKey} className="card-executive">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DeptIcon className="h-5 w-5 text-primary" />
                  {deptInfo.name}
                </CardTitle>
                <CardDescription>
                  {deptAgents.length} agent{deptAgents.length > 1 ? "s" : ""} dans ce département
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {deptAgents.map((profile) => {
                    const dbAgent = agents?.find(a => a.role_key === profile.roleKey);
                    const isEnabled = dbAgent?.is_enabled ?? true;
                    
                    return (
                      <div 
                        key={profile.roleKey} 
                        className={`p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50 ${profile.isHead ? 'bg-primary/5 border-primary/20' : ''}`}
                        onClick={() => setSelectedAgent(profile)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={departmentColors[deptKey] as "default" | "secondary" | "destructive" | "outline" | "gold" | "subtle"}
                              className="font-mono text-xs"
                            >
                              {profile.roleKey}
                            </Badge>
                            {profile.isHead && (
                              <Badge variant="gold" className="text-[10px]">Chef</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Power className={`h-3 w-3 ${isEnabled ? "text-success" : "text-muted-foreground"}`} />
                            <Switch checked={isEnabled} disabled className="scale-75" />
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
              {selectedAgent?.isHead && (
                <Badge variant="gold" className="ml-2">Chef de Département</Badge>
              )}
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
                  <p className="text-xs text-muted-foreground mb-1">Département</p>
                  <Badge variant="gold">
                    {selectedAgent.category === "direction" 
                      ? "Direction Générale" 
                      : DEPARTMENTS[selectedAgent.department as DepartmentKey]?.name || selectedAgent.department
                    }
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

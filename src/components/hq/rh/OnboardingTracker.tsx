import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingTracker() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["hq-agents-onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_agents");
      if (error) throw error;
      return data || [];
    },
  });

  const hasAgents = agents && agents.length > 0;
  const enabledCount = agents?.filter(a => a.is_enabled).length || 0;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 text-primary" />
          Suivi Onboarding Agents
        </CardTitle>
        <CardDescription>
          {hasAgents
            ? `${enabledCount}/${agents.length} agents actifs`
            : "Statut des agents IA"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !hasAgents ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Bot className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun agent configuré</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Les agents IA apparaîtront ici une fois configurés
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className={`h-4 w-4 ${agent.is_enabled ? "text-success" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.role_title_fr}</p>
                    </div>
                  </div>
                  <Badge variant={agent.is_enabled ? "success" : "warning"}>
                    {agent.is_enabled ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

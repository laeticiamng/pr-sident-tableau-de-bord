import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentPerformanceWidgetProps {
  className?: string;
}

export function AgentPerformanceWidget({ className }: AgentPerformanceWidgetProps) {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["hq-agents-performance"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_agents");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Performance des Agents IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun agent configuré</p>
            <p className="text-xs text-muted-foreground mt-1">Les agents IA apparaîtront ici une fois configurés</p>
            <Badge variant="outline" className="mt-3">Base de données HQ</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enabledAgents = agents.filter(a => a.is_enabled).length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Performance des Agents IA
            </CardTitle>
            <CardDescription>
              Agents configurés et leur statut
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="success">{enabledAgents} actifs</Badge>
            <Badge variant="subtle">{agents.length} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    agent.is_enabled ? "bg-success animate-pulse" : "bg-muted-foreground"
                  )} />
                  <div>
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground">{agent.role_title_fr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={agent.is_enabled ? "success" : "subtle"} className="text-xs">
                    {agent.is_enabled ? "Actif" : "Désactivé"}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    {agent.model_preference}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Catégorie : {agent.role_category} • Aucune métrique d'exécution disponible
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents } from "@/hooks/useHQData";

export function PerformanceReview() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></CardContent>
      </Card>
    );
  }

  const enabledAgents = agents?.filter(a => a.is_enabled) || [];

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          Revue de Performance
        </CardTitle>
        <CardDescription>
          {enabledAgents.length} agent(s) actif(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enabledAgents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucun agent actif</p>
            <p className="text-sm mt-1">Les agents apparaîtront ici une fois activés.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enabledAgents.slice(0, 6).map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {agent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{agent.name}</h4>
                    <Badge variant="subtle">{agent.role_category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {agent.role_title_fr} • {agent.model_preference}
                  </p>
                </div>
                <Badge variant="outline">Évaluation non configurée</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
